import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default function MapComponent() {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");

  // Initialize map
  useEffect(() => {
    mapRef.current = L.map("map").setView([20.5937, 78.9629], 5); // Default: India

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Click to add marker
    mapRef.current.on("click", (e) => {
      placeMarker(e.latlng.lat, e.latlng.lng);
    });
  }, []);

  // Function to place marker
  const placeMarker = (lat, lng) => {
    if (markerRef.current) {
      markerRef.current.remove();
    }
    markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
    mapRef.current.setView([lat, lng], 13);
    setLocation({ lat, lng });
  };

  // Handle search by place name
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchTerm
        )}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        placeMarker(parseFloat(lat), parseFloat(lon));
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  // Handle recenter by lat/lng input
  const handleLatLngSubmit = (e) => {
    e.preventDefault();
    if (!latInput || !lngInput) return;
    placeMarker(parseFloat(latInput), parseFloat(lngInput));
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          padding: "10px",
          background: "#f4f4f4",
          borderRight: "1px solid #ddd",
        }}
      >
        <h3>Location Tools</h3>

        {/* Search by place name */}
        <form onSubmit={handleSearch} style={{ marginBottom: "10px" }}>
          <input
            type="text"
            value={searchTerm}
            placeholder="Search place..."
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "5px", width: "100%" }}
          />
          <button type="submit" style={{ marginTop: "5px", width: "100%" }}>
            Search
          </button>
        </form>

        {/* Search by coordinates */}
        <form onSubmit={handleLatLngSubmit}>
          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={latInput}
            onChange={(e) => setLatInput(e.target.value)}
            style={{ padding: "5px", width: "100%", marginBottom: "5px" }}
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={lngInput}
            onChange={(e) => setLngInput(e.target.value)}
            style={{ padding: "5px", width: "100%" }}
          />
          <button type="submit" style={{ marginTop: "5px", width: "100%" }}>
            Go
          </button>
        </form>

        {/* Show selected location */}
        {location.lat && location.lng && (
          <div style={{ marginTop: "15px" }}>
            <strong>Selected Location:</strong>
            <p>Lat: {location.lat.toFixed(5)}</p>
            <p>Lng: {location.lng.toFixed(5)}</p>
          </div>
        )}
      </div>

      {/* Map */}
      <div id="map" style={{ height: "100vh", flex: 1 }}></div>
    </div>
  );
}


