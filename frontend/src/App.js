import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

// Leaflet marker icon (fix for missing default icon)
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Recenter map when position changes
function RecenterOnPosition({ position, zoom = 6 }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, zoom, { animate: true });
  }, [position, zoom, map]);
  return null;
}

// Capture map clicks reliably
function MapClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        name: `Lat ${e.latlng.lat.toFixed(4)}, Lon ${e.latlng.lng.toFixed(4)}`,
      });
    },
  });
  return null;
}

export default function App() {
  // Default center: India-ish
  const [selected, setSelected] = useState({ lat: 20, lng: 78, name: "Start" });
  const [suggestions, setSuggestions] = useState([]);
  const [query, setQuery] = useState("");
  const [satelliteData, setSatelliteData] = useState(null);

  // Fetch mock backend data once (kept for wiring)
  useEffect(() => {
    fetch("http://localhost:5000/mock-satellite")
      .then((r) => r.json())
      .then(setSatelliteData)
      .catch((err) => console.error("Mock fetch failed:", err));
  }, []);

  // Live search (debounced)
  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            q
          )}&limit=8`,
          { signal: controller.signal, headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setSuggestions(data || []);
      } catch (_) {
        /* ignore abort/errors for typing */
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [query]);

  const handleSuggestionClick = (place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    setSelected({ lat, lng, name: place.display_name });
    setQuery(place.display_name);
    setSuggestions([]);
  };

  const position = [selected.lat, selected.lng];

  return (
    <div className="app">
      {/* LEFT: Side Panel */}
      <aside className="side">
        <h2 className="sectionTitle">📍 Location</h2>
        <div className="card">
          <div className="row">
            <span className="label">Name</span>
            <span className="value">{selected?.name || "—"}</span>
          </div>
          <div className="row">
            <span className="label">Latitude</span>
            <span className="value">{selected.lat.toFixed(5)}</span>
          </div>
          <div className="row">
            <span className="label">Longitude</span>
            <span className="value">{selected.lng.toFixed(5)}</span>
          </div>
        </div>

        <h2 className="sectionTitle">🛰️ Mock Satellite</h2>
        <div className="card">
          {satelliteData ? (
            <>
              <div className="row">
                <span className="label">Satellite</span>
                <span className="value">{satelliteData.satellite}</span>
              </div>
              <div className="row">
                <span className="label">Pass Time</span>
                <span className="value">
                  {new Date(satelliteData.passTime).toLocaleString()}
                </span>
              </div>
              <div className="imgWrap">
                <img
                  src={satelliteData.imageUrl}
                  alt="Mock satellite"
                  className="img"
                />
              </div>
            </>
          ) : (
            <p className="muted">Loading from backend…</p>
          )}
        </div>
      </aside>

      {/* RIGHT: Map */}
      <main className="mapWrap">
        {/* Floating live search */}
        <div className="searchWrap">
          <input
            className="searchInput"
            placeholder="Search a place (min 3 chars)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {suggestions.length > 0 && (
            <ul className="suggestList">
              {suggestions.map((s, i) => (
                <li key={i} onClick={() => handleSuggestionClick(s)}>
                  {s.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <MapContainer
          center={position}
          zoom={5}
          style={{ height: "100vh", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <MapClickHandler onPick={setSelected} />
          <RecenterOnPosition position={position} zoom={6} />

          <Marker position={position} icon={markerIcon}>
            <Popup>
              {selected.name}
              <br />
              {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
            </Popup>
          </Marker>
        </MapContainer>
      </main>
    </div>
  );
}
