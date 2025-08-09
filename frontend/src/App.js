import React, { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import MapComponent from "./components/map";


const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationMarker({ setLat, setLng }) {
  useMapEvents({
    click(e) {
      setLat(e.latlng.lat);
      setLng(e.latlng.lng);
    },
  });
  return null;
}

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

function App() {
  const [lat, setLat] = useState(20.5937);
  const [lng, setLng] = useState(78.9629);
  const [zoom] = useState(5);
  const [place, setPlace] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  // Debounced search
  const searchPlace = useCallback(async (query) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: query,
          format: "json",
          addressdetails: 1,
          limit: 5,
        },
      });
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      searchPlace(place);
    }, 500); // 0.5s delay after typing stops
    return () => clearTimeout(delayDebounce);
  }, [place, searchPlace]);

  const selectPlace = (lat, lon) => {
    setLat(parseFloat(lat));
    setLng(parseFloat(lon));
    setResults([]);
    setPlace("");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* Sidebar */}
      <div style={{ width: "280px", padding: "15px", background: "#f8f8f8", borderRight: "1px solid #ddd" }}>
        <h3>Target Location</h3>
        <p><strong>Latitude:</strong> {lat.toFixed(6)}</p>
        <p><strong>Longitude:</strong> {lng.toFixed(6)}</p>

        <input
          type="number"
          value={lat}
          onChange={(e) => setLat(parseFloat(e.target.value))}
          placeholder="Latitude"
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <input
          type="number"
          value={lng}
          onChange={(e) => setLng(parseFloat(e.target.value))}
          placeholder="Longitude"
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="Search place..."
            style={{ width: "100%", marginBottom: "10px" }}
          />
          {loading && <div style={{ fontSize: "12px", color: "#666" }}>Searching...</div>}

          {/* Dropdown results */}
          {results.length > 0 && (
            <ul style={{
              listStyle: "none",
              margin: 0,
              padding: "5px",
              background: "#fff",
              border: "1px solid #ccc",
              position: "absolute",
              width: "100%",
              zIndex: 1000,
              maxHeight: "150px",
              overflowY: "auto"
            }}>
              {results.map((r, i) => (
                <li
                  key={i}
                  onClick={() => selectPlace(r.lat, r.lon)}
                  style={{ padding: "5px", cursor: "pointer", borderBottom: "1px solid #eee" }}
                >
                  {r.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <p style={{ fontSize: "12px", marginTop: "10px", color: "#555" }}>
          Click the map, type coordinates, or search by place name.
        </p>
      </div>

      {/* Map */}
      <div style={{ flex: 1 }}>
        <MapContainer center={[lat, lng]} zoom={zoom} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <Marker position={[lat, lng]} icon={markerIcon}>
            <Popup>
              Target Location: {lat.toFixed(6)}, {lng.toFixed(6)}
            </Popup>
          </Marker>
          <LocationMarker setLat={setLat} setLng={setLng} />
          <RecenterMap lat={lat} lng={lng} />
        </MapContainer>
      </div>
    </div>
  );
}

export default App;

