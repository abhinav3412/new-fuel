"use client";

import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix default marker icon in Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom fuel station icon
const FuelStationIcon = L.divIcon({
  html: `<div style="
    background: #22c55e;
    border: 3px solid white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  ">⛽</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
  className: "fuel-station-icon",
});

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]; // India fallback
const DEFAULT_ZOOM = 12;

type TileType = "street" | "satellite";

// Centers map on position and keeps marker in sync
function MapController({
  position,
}: {
  position: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 14, { duration: 1 });
    }
  }, [map, position]);
  return null;
}

// Recentre button: must be inside MapContainer to use useMap
function RecentreButton({
  position,
}: {
  position: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  const handleClick = () => {
    if (position) {
      map.flyTo([position.lat, position.lng], 14, { duration: 0.5 });
    } else {
      map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 0.5 });
    }
  };
  return (
    <div className="admin-map-recentre-wrap">
      <button type="button" className="admin-map-recentre-btn" onClick={handleClick}>
        Recentre
      </button>
    </div>
  );
}

type AdminMapProps = { popupLabel?: string; mapClassName?: string; wrapClassName?: string };

export default function AdminMap({ popupLabel = "Your location (Admin)", mapClassName = "admin-leaflet-map", wrapClassName = "admin-leaflet-wrap" }: AdminMapProps = {}) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [fuelStations, setFuelStations] = useState<Array<{ id: number; name: string; latitude: number; longitude: number }>>([]);
  const [tileType, setTileType] = useState<TileType>("street");
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/fuel-stations")
      .then((res) => res.json())
      .then((data) => setFuelStations(Array.isArray(data) ? data : []))
      .catch(() => setFuelStations([]));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    // Browsers only allow geolocation on secure origins: HTTPS or http://localhost
    if (!window.isSecureContext) {
      setLocationError(
        "Location works only on HTTPS or localhost. Open this page at http://localhost:3000 (or use HTTPS) to see your position."
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationError(null);
      },
      (err) => {
        const msg =
          err.code === 1
            ? "Location denied. Allow location for this site to see your position on the map."
            : err.code === 2
              ? "Location unavailable. Try again or open via http://localhost:3000 or HTTPS."
              : err.message || "Could not get your location.";
        setLocationError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return (
    <div className={wrapClassName}>
      <div className="admin-map-tile-controls">
        <button
          type="button"
          className={`admin-map-tile-btn ${tileType === "street" ? "admin-map-tile-btn--active" : ""}`}
          onClick={() => setTileType("street")}
        >
          Street
        </button>
        <button
          type="button"
          className={`admin-map-tile-btn ${tileType === "satellite" ? "admin-map-tile-btn--active" : ""}`}
          onClick={() => setTileType("satellite")}
        >
          Satellite
        </button>
      </div>
      {locationError && (
        <div className="admin-map-location-error">{locationError}</div>
      )}
      <MapContainer
        center={position ?? DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className={mapClassName}
        scrollWheelZoom={true}
      >
        {tileType === "street" && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        {tileType === "satellite" && (
          <TileLayer
            attribution="&copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}
        <MapController position={position} />
        <RecentreButton position={position} />
        {position && (
          <Marker position={[position.lat, position.lng]}>
            <Popup>{popupLabel}</Popup>
          </Marker>
        )}
        {fuelStations.map((station) => (
          <Marker key={station.id} position={[station.latitude, station.longitude]} icon={FuelStationIcon}>
            <Popup>⛽ {station.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
