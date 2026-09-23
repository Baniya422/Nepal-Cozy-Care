<?php

namespace App\Services;

use App\Models\AdminSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class DeliveryRoutingService
{
    /**
     * Calculate road distance between dispatch and customer coordinates.
     * Throws RuntimeException if routing fails, refusing to substitute straight-line distance.
     *
     * @return float Distance in kilometers rounded to 2 decimals
     */
    public function calculateRoadDistance(
        float $customerLat,
        float $customerLng,
        ?AdminSetting $settings = null
    ): float {
        $settings = $settings ?? AdminSetting::current();

        $dispatchLat = $settings->dispatch_latitude;
        $dispatchLng = $settings->dispatch_longitude;

        if ($dispatchLat === null || $dispatchLng === null) {
            throw new RuntimeException('Central store dispatch coordinates are not yet configured by the administrator.');
        }

        // Validate coordinate bounds
        if ($customerLat < -90 || $customerLat > 90 || $customerLng < -180 || $customerLng > 180) {
            throw new RuntimeException('Invalid delivery location coordinates.');
        }

        $routingService = $settings->routing_service ?: 'osrm';
        $apiUrl = $settings->routing_api_url;

        // Default to OSRM Public Routing API if not overridden
        $url = $apiUrl ?: "https://router.project-osrm.org/route/v1/driving/{$dispatchLng},{$dispatchLat};{$customerLng},{$customerLat}?overview=false";

        try {
            $request = Http::timeout(7)->acceptJson();
            if ($settings->routing_api_key) {
                $request = $request->withHeaders(['Authorization' => $settings->routing_api_key]);
            }

            $response = $request->get($url);

            if (! $response->successful()) {
                Log::warning('Road routing HTTP error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new RuntimeException('Unable to establish road route to your location. Please check the address or try again.');
            }

            $data = $response->json();
            $code = $data['code'] ?? null;

            if ($code !== 'Ok' || empty($data['routes'][0]['distance'])) {
                $msg = $data['message'] ?? 'No road route found';
                throw new RuntimeException("Routing failed: {$msg}. Please adjust your delivery pin to an accessible road.");
            }

            $distanceMeters = (float) $data['routes'][0]['distance'];

            return round($distanceMeters / 1000, 2);
        } catch (\Throwable $e) {
            if ($e instanceof RuntimeException) {
                throw $e;
            }

            Log::error('DeliveryRoutingService road routing exception: '.$e->getMessage());
            throw new RuntimeException('Road routing calculation failed: could not connect to routing service. Please retry in a moment.');
        }
    }

    /**
     * Quote delivery fee based on discounted subtotal and road distance.
     */
    public function quoteDelivery(
        float $customerLat,
        float $customerLng,
        float $discountedSubtotal,
        ?AdminSetting $settings = null
    ): array {
        $settings = $settings ?? AdminSetting::current();

        $roadDistanceKm = $this->calculateRoadDistance($customerLat, $customerLng, $settings);

        $freeThreshold = (float) ($settings->free_delivery_threshold ?? 2000.00);
        $freeRadiusKm = (float) ($settings->free_delivery_radius_km ?? 10.00);
        $standardFee = (float) ($settings->standard_delivery_fee ?? 100.00);
        $maxDistanceKm = (float) ($settings->max_delivery_distance_km ?? 25.00);

        if ($roadDistanceKm > $maxDistanceKm) {
            throw new RuntimeException(
                "Your delivery location is {$roadDistanceKm} km away by road, which exceeds our maximum service radius of {$maxDistanceKm} km."
            );
        }

        $deliveryFee = 0.0;
        $isFreeDelivery = false;
        $qualificationReason = '';

        // Rule 1: Subtotal after discounts >= 2,000 AND road distance <= 10 km: Free delivery
        if ($discountedSubtotal >= $freeThreshold && $roadDistanceKm <= $freeRadiusKm) {
            $deliveryFee = 0.0;
            $isFreeDelivery = true;
            $qualificationReason = "Free delivery qualified (Subtotal NPR {$discountedSubtotal} >= NPR {$freeThreshold} within {$freeRadiusKm} km)";
        }
        // Rule 2: Subtotal below 2,000 within 10 km: Standard delivery charge
        elseif ($roadDistanceKm <= $freeRadiusKm) {
            $deliveryFee = $standardFee;
            $isFreeDelivery = false;
            $qualificationReason = "Standard delivery charge (Within {$freeRadiusKm} km radius; add NPR ".max(0, $freeThreshold - $discountedSubtotal).' more for free delivery)';
        }
        // Rule 3: Any order beyond 10 km: distance-based delivery charge
        else {
            $deliveryFee = $this->calculateDistanceBasedFee($roadDistanceKm, $standardFee, $settings);
            $isFreeDelivery = false;
            $qualificationReason = "Distance-based delivery charge ({$roadDistanceKm} km road distance exceeds {$freeRadiusKm} km free-delivery radius)";
        }

        return [
            'road_distance_km' => $roadDistanceKm,
            'delivery_fee' => round($deliveryFee, 2),
            'is_free_delivery' => $isFreeDelivery,
            'qualification_reason' => $qualificationReason,
            'free_delivery_threshold' => $freeThreshold,
            'free_delivery_radius_km' => $freeRadiusKm,
            'standard_delivery_fee' => $standardFee,
            'max_delivery_distance_km' => $maxDistanceKm,
            'dispatch_address' => $settings->dispatch_address,
        ];
    }

    /**
     * Calculate tiered or per-km surcharge beyond 10 km.
     */
    private function calculateDistanceBasedFee(
        float $roadDistanceKm,
        float $standardFee,
        AdminSetting $settings
    ): float {
        $pricingMethod = $settings->pricing_method ?: 'distance_bands';

        if ($pricingMethod === 'per_km_rate') {
            $extraKm = max(0.0, $roadDistanceKm - (float) ($settings->free_delivery_radius_km ?? 10.0));
            $ratePerKm = 20.00; // NPR 20 per extra km default
            return round($standardFee + ($extraKm * $ratePerKm), 2);
        }

        // Distance bands calculation
        $rules = $settings->distance_pricing_rules;
        if (is_array($rules) && count($rules) > 0) {
            foreach ($rules as $band) {
                $min = (float) ($band['min_km'] ?? 0);
                $max = (float) ($band['max_km'] ?? 9999);
                if ($roadDistanceKm > $min && $roadDistanceKm <= $max) {
                    return (float) ($band['fee'] ?? $standardFee);
                }
            }
        }

        // Fallback default band if bands list is unconfigured or no band matched
        if ($roadDistanceKm <= 15) {
            return 150.00;
        }
        if ($roadDistanceKm <= 20) {
            return 220.00;
        }

        return 300.00;
    }
}
