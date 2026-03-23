<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CareTip;
use App\Models\GardenEntry;
use App\Models\Plant;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class GardenEntryController extends Controller
{
    public function index(Request $request)
    {
        $entries = GardenEntry::with(['plant', 'sourceOrder'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'message' => null,
            'data' => [
                'entries' => $entries->map(fn (GardenEntry $entry) => $this->transformEntry($entry)),
                'summary' => [
                    'total_entries' => $entries->count(),
                    'needs_watering' => $entries->filter(fn (GardenEntry $entry) => $this->isDue($entry->last_watered_at, $entry->watering_frequency_days))->count(),
                    'needs_fertilizer' => $entries->filter(fn (GardenEntry $entry) => $this->isDue($entry->last_fertilized_at, $entry->fertilizing_frequency_days))->count(),
                ],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'plant_id' => 'required|exists:plants,id',
            'nickname' => 'nullable|string|max:120',
            'city' => 'nullable|string|max:120',
            'room' => 'nullable|string|max:120',
            'notes' => 'nullable|string|max:2000',
            'quantity' => 'nullable|integer|min:1|max:99',
            'watering_frequency_days' => 'nullable|integer|min:1|max:30',
            'fertilizing_frequency_days' => 'nullable|integer|min:7|max:120',
            'acquired_at' => 'nullable|date',
            'last_watered_at' => 'nullable|date',
            'last_fertilized_at' => 'nullable|date',
        ]);

        $plant = Plant::findOrFail($validated['plant_id']);

        $entry = GardenEntry::create([
            'user_id' => $request->user()->id,
            'plant_id' => $plant->id,
            'nickname' => $validated['nickname'] ?? null,
            'city' => $validated['city'] ?? null,
            'room' => $validated['room'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'quantity' => $validated['quantity'] ?? 1,
            'watering_frequency_days' => $validated['watering_frequency_days'] ?? $this->guessWateringFrequency($plant),
            'fertilizing_frequency_days' => $validated['fertilizing_frequency_days'] ?? 30,
            'acquired_at' => $validated['acquired_at'] ?? now()->toDateString(),
            'last_watered_at' => $validated['last_watered_at'] ?? null,
            'last_fertilized_at' => $validated['last_fertilized_at'] ?? null,
        ])->load(['plant', 'sourceOrder']);

        return response()->json([
            'message' => 'Plant added to your garden',
            'data' => [
                'entry' => $this->transformEntry($entry),
            ],
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $entry = GardenEntry::with(['plant', 'sourceOrder'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'plant_id' => 'sometimes|exists:plants,id',
            'nickname' => 'nullable|string|max:120',
            'city' => 'nullable|string|max:120',
            'room' => 'nullable|string|max:120',
            'notes' => 'nullable|string|max:2000',
            'quantity' => 'nullable|integer|min:1|max:99',
            'watering_frequency_days' => 'nullable|integer|min:1|max:30',
            'fertilizing_frequency_days' => 'nullable|integer|min:7|max:120',
            'acquired_at' => 'nullable|date',
            'last_watered_at' => 'nullable|date',
            'last_fertilized_at' => 'nullable|date',
        ]);

        $entry->update($validated);

        return response()->json([
            'message' => 'Garden entry updated',
            'data' => [
                'entry' => $this->transformEntry($entry->fresh(['plant', 'sourceOrder'])),
            ],
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $entry = GardenEntry::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $entry->delete();

        return response()->json([
            'message' => 'Plant removed from your garden',
        ]);
    }

    public function markWatered(Request $request, int $id)
    {
        $entry = GardenEntry::with(['plant', 'sourceOrder'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        $entry->update([
            'last_watered_at' => now(),
        ]);

        return response()->json([
            'message' => 'Watering reminder updated',
            'data' => [
                'entry' => $this->transformEntry($entry->fresh(['plant', 'sourceOrder'])),
            ],
        ]);
    }

    public function markFertilized(Request $request, int $id)
    {
        $entry = GardenEntry::with(['plant', 'sourceOrder'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        $entry->update([
            'last_fertilized_at' => now(),
        ]);

        return response()->json([
            'message' => 'Fertilizer reminder updated',
            'data' => [
                'entry' => $this->transformEntry($entry->fresh(['plant', 'sourceOrder'])),
            ],
        ]);
    }

    public function adminIndex(Request $request)
    {
        $query = GardenEntry::with(['user', 'plant', 'sourceOrder'])
            ->latest();

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', '%' . $search . '%')
                        ->orWhere('email', 'like', '%' . $search . '%');
                })->orWhereHas('plant', function ($plantQuery) use ($search) {
                    $plantQuery->where('name', 'like', '%' . $search . '%');
                })->orWhere('nickname', 'like', '%' . $search . '%')
                    ->orWhere('city', 'like', '%' . $search . '%');
            });
        }

        $entries = $query->paginate((int) $request->query('per_page', 20));

        return response()->json([
            'message' => null,
            'data' => [
                'entries' => $entries->items(),
                'pagination' => [
                    'current_page' => $entries->currentPage(),
                    'per_page' => $entries->perPage(),
                    'total' => $entries->total(),
                    'last_page' => $entries->lastPage(),
                ],
            ],
        ]);
    }

    private function transformEntry(GardenEntry $entry): array
    {
        $recommendedTips = collect();

        if ($entry->plant_id) {
            $recommendedTips = CareTip::published()
                ->select('id', 'title', 'excerpt', 'image', 'category')
                ->whereJsonContains('plant_ids', $entry->plant_id)
                ->limit(2)
                ->get();
        }

        $nextWateringDate = $this->nextDueDate($entry->last_watered_at, $entry->watering_frequency_days);
        $nextFertilizerDate = $this->nextDueDate($entry->last_fertilized_at, $entry->fertilizing_frequency_days);

        return [
            'id' => $entry->id,
            'nickname' => $entry->nickname,
            'city' => $entry->city,
            'room' => $entry->room,
            'notes' => $entry->notes,
            'quantity' => $entry->quantity,
            'acquired_at' => optional($entry->acquired_at)->toDateString(),
            'last_watered_at' => optional($entry->last_watered_at)->toIso8601String(),
            'last_fertilized_at' => optional($entry->last_fertilized_at)->toIso8601String(),
            'watering_frequency_days' => $entry->watering_frequency_days,
            'fertilizing_frequency_days' => $entry->fertilizing_frequency_days,
            'next_watering_date' => optional($nextWateringDate)->toDateString(),
            'next_fertilizing_date' => optional($nextFertilizerDate)->toDateString(),
            'needs_watering' => $this->isDue($entry->last_watered_at, $entry->watering_frequency_days),
            'needs_fertilizer' => $this->isDue($entry->last_fertilized_at, $entry->fertilizing_frequency_days),
            'days_until_watering' => $this->daysUntil($nextWateringDate),
            'days_until_fertilizer' => $this->daysUntil($nextFertilizerDate),
            'plant' => $entry->plant,
            'source_order' => $entry->sourceOrder,
            'recommended_tips' => $recommendedTips,
        ];
    }

    private function isDue($lastDoneAt, int $frequencyDays): bool
    {
        return $this->daysUntil($this->nextDueDate($lastDoneAt, $frequencyDays)) <= 0;
    }

    private function nextDueDate($lastDoneAt, int $frequencyDays): Carbon
    {
        $base = $lastDoneAt ? Carbon::parse($lastDoneAt) : Carbon::now()->subDays($frequencyDays);

        return $base->copy()->addDays($frequencyDays)->startOfDay();
    }

    private function daysUntil(?Carbon $date): int
    {
        if (! $date) {
            return 0;
        }

        return Carbon::now()->startOfDay()->diffInDays($date, false);
    }

    private function guessWateringFrequency(Plant $plant): int
    {
        $value = strtolower((string) $plant->water);

        if (str_contains($value, 'daily')) {
            return 2;
        }

        if (str_contains($value, 'bi') || str_contains($value, 'every two')) {
            return 14;
        }

        if (str_contains($value, 'low') || str_contains($value, 'weekly')) {
            return 7;
        }

        return 6;
    }
}
