import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import axios from "axios";

export default function MapComponent() {
  const [position, setPosition] = useState([28.6139, 77.2090]); // Default: Delhi
  const [landsatData, setLandsatData] = useState(null);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);

        // Call backend API
        axios
          .get(`http://localhost:5000/api/landsat/pass?lat=${lat}&lon=${lng}`)
          .then((res) => {
            setLandsatData(res.data);
          })
          .catch((err) => {
            console.error("Error fetching Landsat data:", err);
          });
      },
    });
    return null;
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Map */}
      <div style={{ width: "70%", height: "100vh" }}>
        <MapContainer center={position} zoom={5} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler />
          <Marker position={position}>
            <Popup>Clicked Location</Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Side panel */}
      <div style={{ width: "30%", padding: "1rem", background: "#f8f8f8" }}>
        <h2>Selected Location</h2>
        <p><strong>Lat:</strong> {position[0]}</p>
        <p><strong>Lon:</strong> {position[1]}</p>

        {landsatData ? (
          <>
            <h3>Landsat Pass Info</h3>
            <p><strong>Satellite:</strong> {landsatData.satellite}</p>
            <p><strong>Next Pass:</strong> {landsatData.nextPass}</p>
            <small>{landsatData.note}</small>
          </>
        ) : (
          <p>Click on the map to see Landsat pass info.</p>
        )}
      </div>
    </div>
  );
}
