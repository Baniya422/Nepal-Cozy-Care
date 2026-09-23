import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, AlertCircle, CheckCircle2 } from "lucide-react";

// Fix Vite/Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface DeliveryLocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  disabled?: boolean;
}

const DEFAULT_CENTER: [number, number] = [27.7172, 85.324]; // Kathmandu Center

export default function DeliveryLocationPicker({
  latitude,
  longitude,
  onChange,
  disabled = false,
}: DeliveryLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [geoStatus, setGeoStatus] = useState<{
    type: "info" | "success" | "error";
    text: string;
  } | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = latitude || DEFAULT_CENTER[0];
    const initialLng = longitude || DEFAULT_CENTER[1];

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], {
      draggable: !disabled,
      title: "Delivery Pin (Drag to adjust)",
    }).addTo(map);

    marker.bindPopup("<b>Delivery Destination</b><br/>Drag pin to your exact building or gate.").openPopup();

    marker.on("dragend", () => {
      const position = marker.getLatLng();
      onChange(position.lat, position.lng);
      setGeoStatus({
        type: "success",
        text: `Pin set to: ${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`,
      });
    });

    map.on("click", (e: L.LeafletMouseEvent) => {
      if (disabled) return;
      marker.setLatLng(e.latlng);
      onChange(e.latlng.lat, e.latlng.lng);
      setGeoStatus({
        type: "success",
        text: `Pin adjusted to: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`,
      });
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update marker position when props change externally
  useEffect(() => {
    if (latitude && longitude && markerRef.current && mapInstanceRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (
        Math.abs(currentPos.lat - latitude) > 0.0001 ||
        Math.abs(currentPos.lng - longitude) > 0.0001
      ) {
        markerRef.current.setLatLng([latitude, longitude]);
        mapInstanceRef.current.panTo([latitude, longitude]);
      }
    }
  }, [latitude, longitude]);

  // "Use my location" Geolocation Handler
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus({
        type: "error",
        text: "Geolocation is not supported by your browser. Please adjust the pin manually on the map.",
      });
      return;
    }

    setDetectingLocation(true);
    setGeoStatus({ type: "info", text: "Requesting your device GPS location..." });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectingLocation(false);
        const { latitude: lat, longitude: lng } = pos.coords;
        onChange(lat, lng);

        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.setView([lat, lng], 15);
          markerRef.current.openPopup();
        }

        setGeoStatus({
          type: "success",
          text: `Exact device location pinned (${lat.toFixed(5)}, ${lng.toFixed(5)}). You can drag to fine-tune.`,
        });
      },
      (err) => {
        setDetectingLocation(false);
        let errorMsg = "Could not fetch GPS location. Please drag the pin manually on the map.";
        if (err.code === 1) {
          errorMsg = "Location permission was denied. You can manually drag the pin to your doorstep.";
        } else if (err.code === 2) {
          errorMsg = "Location unavailable. Please adjust the delivery pin on the map.";
        }
        setGeoStatus({ type: "error", text: errorMsg });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="delivery-location-picker" style={{ marginTop: "0.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <span style={{ fontSize: "0.85rem", color: "#374151", fontWeight: 600 }}>
          Pin Delivery Destination on Map (Required for road distance)
        </span>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={disabled || detectingLocation}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.4rem 0.75rem",
            background: "#ecfdf5",
            color: "#059669",
            border: "1px solid #a7f3d0",
            borderRadius: "6px",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: disabled || detectingLocation ? "not-allowed" : "pointer",
          }}
        >
          <Navigation size={14} className={detectingLocation ? "animate-spin" : ""} />
          <span>{detectingLocation ? "Locating..." : "Use My Location"}</span>
        </button>
      </div>

      {geoStatus && (
        <div
          style={{
            marginBottom: "0.5rem",
            fontSize: "0.8rem",
            padding: "0.4rem 0.65rem",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            background:
              geoStatus.type === "success"
                ? "#ecfdf5"
                : geoStatus.type === "error"
                ? "#fef2f2"
                : "#eff6ff",
            color:
              geoStatus.type === "success"
                ? "#065f46"
                : geoStatus.type === "error"
                ? "#991b1b"
                : "#1e40af",
            border: `1px solid ${
              geoStatus.type === "success"
                ? "#a7f3d0"
                : geoStatus.type === "error"
                ? "#fecaca"
                : "#bfdbfe"
            }`,
          }}
        >
          {geoStatus.type === "success" ? (
            <CheckCircle2 size={14} />
          ) : (
            <AlertCircle size={14} />
          )}
          <span>{geoStatus.text}</span>
        </div>
      )}

      {/* Leaflet Map Frame */}
      <div
        ref={mapContainerRef}
        style={{
          height: "240px",
          width: "100%",
          borderRadius: "8px",
          border: "1px solid #d1d5db",
          zIndex: 1,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "0.35rem",
          fontSize: "0.75rem",
          color: "#6b7280",
        }}
      >
        <span>Tip: Drag the blue marker directly to your home/office gate.</span>
        {latitude && longitude ? (
          <span style={{ fontFamily: "monospace" }}>
            Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}
          </span>
        ) : (
          <span style={{ color: "#dc2626" }}>No coordinates selected</span>
        )}
      </div>
    </div>
  );
}
