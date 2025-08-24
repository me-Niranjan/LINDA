// src/components/SidePanel.js
import React from "react";

const SidePanel = ({ location, passTimes, imagery }) => {
  return (
    <div className="side-panel" style={styles.panel}>
      <h2 style={styles.title}>Location Info</h2>
      {location ? (
        <>
          <p><b>Place:</b> {location.name}</p>
          <p><b>Latitude:</b> {location.lat.toFixed(4)}</p>
          <p><b>Longitude:</b> {location.lon.toFixed(4)}</p>
        </>
      ) : (
        <p>Select a location to see details.</p>
      )}

      <hr />

      <h3 style={styles.subtitle}>Next Landsat Pass</h3>
      {passTimes && passTimes.length > 0 ? (
        <ul>
          {passTimes.map((time, idx) => (
            <li key={idx}>{new Date(time).toLocaleString()}</li>
          ))}
        </ul>
      ) : (
        <p>No pass data yet.</p>
      )}

      <hr />

      <h3 style={styles.subtitle}>Available Imagery</h3>
      {imagery && imagery.length > 0 ? (
        <div style={styles.imageryGrid}>
          {imagery.map((img, idx) => (
            <div key={idx} style={styles.imageBox}>
              <img src={img.thumbnail} alt="landsat" style={styles.img} />
              <a href={img.full} target="_blank" rel="noreferrer">Download</a>
            </div>
          ))}
        </div>
      ) : (
        <p>No imagery yet.</p>
      )}
    </div>
  );
};

const styles = {
  panel: {
    width: "300px",
    height: "100vh",
    background: "rgba(255,255,255,0.9)",
    padding: "1rem",
    overflowY: "auto",
    boxShadow: "2px 0 5px rgba(0,0,0,0.2)",
  },
  title: { margin: "0 0 1rem 0" },
  subtitle: { marginTop: "1rem" },
  imageryGrid: { display: "grid", gap: "10px" },
  imageBox: { border: "1px solid #ddd", padding: "5px", borderRadius: "5px" },
  img: { width: "100%", borderRadius: "5px" },
};

export default SidePanel;
