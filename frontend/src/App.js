import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./App.css";

// Marker icon fix for Leaflet
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to handle map clicks
function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={markerIcon}>
      <Popup>
        Lat: {position.lat.toFixed(4)}, Lng: {position.lng.toFixed(4)}
      </Popup>
    </Marker>
  );
}

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [passTimes, setPassTimes] = useState([]); // placeholder for backend
  const [imagery, setImagery] = useState([]); // placeholder for backend

  // Geocoding for live search
  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
    );
    const data = await res.json();
    setSuggestions(data);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchSuggestions(query);
  };

  const handleSuggestionClick = (place) => {
    setSelectedLocation({
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      display_name: place.display_name,
    });
    setSuggestions([]);
    setSearchQuery(place.display_name);
  };

  return (
    <div className="app-container">
      {/* Left Side Panel */}
      <div className="side-panel">
        <h2>📍 Location Info</h2>
        {selectedLocation ? (
          <div>
            <p><b>Place:</b> {selectedLocation.display_name}</p>
            <p><b>Lat:</b> {selectedLocation.lat.toFixed(4)}</p>
            <p><b>Lon:</b> {selectedLocation.lng.toFixed(4)}</p>
          </div>
        ) : (
          <p>Select a location on the map</p>
        )}

        <h2>🛰️ Next Landsat Pass</h2>
        {passTimes.length > 0 ? (
          <ul>
            {passTimes.map((time, idx) => (
              <li key={idx}>{time}</li>
            ))}
          </ul>
        ) : (
          <p>No data yet (waiting for backend)</p>
        )}

        <h2>🖼️ Latest Imagery</h2>
        {imagery.length > 0 ? (
          <div className="imagery-grid">
            {imagery.map((img, idx) => (
              <img key={idx} src={img} alt="Landsat thumbnail" />
            ))}
          </div>
        ) : (
          <p>No images yet</p>
        )}
      </div>

      {/* Map + Search */}
      <div className="map-container">
        {/* Live Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search a place..."
          />
          {suggestions.length > 0 && (
            <ul className="suggestions">
              {suggestions.map((place, idx) => (
                <li key={idx} onClick={() => handleSuggestionClick(place)}>
                  {place.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <MapContainer
          center={[20, 78]} // Default India center
          zoom={4}
          style={{ height: "100vh", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <LocationMarker onLocationSelect={setSelectedLocation} />
          {selectedLocation && (
            <Marker
              position={[selectedLocation.lat, selectedLocation.lng]}
              icon={markerIcon}
            >
              <Popup>{selectedLocation.display_name}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
