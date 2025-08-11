import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css"

function App() {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Initialize map
  useEffect(() => {
    const markerIcon = L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    const mapInstance = L.map(mapRef.current).setView([20.5937, 78.9629], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapInstance);

    markerRef.current = L.marker([20.5937, 78.9629], { icon: markerIcon }).addTo(mapInstance);

    mapInstance.on("click", (e) => {
      const { lat, lng } = e.latlng;
      markerRef.current.setLatLng([lat, lng]);
      fetchLocationInfo(lat, lng);
    });

    setMap(mapInstance);
  }, []);

  // Fetch location info from coordinates
  const fetchLocationInfo = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      setLocationInfo({
        name: data.display_name,
        lat: lat.toFixed(6),
        lng: lng.toFixed(6),
      });
    } catch (err) {
      console.error("Error fetching location info:", err);
    }
  };

  // Handle live search input
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Error fetching search suggestions:", err);
    }
  };

  // Handle selecting a suggestion
  const handleSuggestionClick = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    markerRef.current.setLatLng([lat, lon]);
    map.setView([lat, lon], 13);
    setLocationInfo({
      name: place.display_name,
      lat: lat.toFixed(6),
      lng: lon.toFixed(6),
    });
    setSuggestions([]);
    setSearchQuery(place.display_name);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "300px", padding: "10px", background: "#f0f0f0" }}>
        <h2>Location Search</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search for a place..."
          style={{ width: "100%", padding: "5px" }}
        />
        {suggestions.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              background: "#fff",
              border: "1px solid #ccc",
              maxHeight: "150px",
              overflowY: "auto",
            }}
          >
            {suggestions.map((s, idx) => (
              <li
                key={idx}
                onClick={() => handleSuggestionClick(s)}
                style={{
                  padding: "5px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}

        {locationInfo && (
          <div style={{ marginTop: "20px" }}>
            <h3>Location Info</h3>
            <p>
              <strong>Name:</strong> {locationInfo.name}
            </p>
            <p>
              <strong>Latitude:</strong> {locationInfo.lat}
            </p>
            <p>
              <strong>Longitude:</strong> {locationInfo.lng}
            </p>
          </div>
        )}
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ flex: 1 }}></div>
    </div>
  );
}

export default App;


