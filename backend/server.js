// backend/server.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// --- Basic test route ---
app.get("/ping", (req, res) => {
  res.json({ message: "Backend is alive!" });
});

// --- 🔥 Mock satellite route ---
app.get("/mock-satellite", (req, res) => {
  res.json({
    location: "23.5°N, 85.0°E",
    satellite: "MockSat-1",
    passTime: "2025-08-24T10:15:00Z",
    imageUrl: "https://via.placeholder.com/400x300.png?text=Mock+Satellite+Image"
  });
});

// --- 🔥 Mock imagery route ---
app.get("/mock-imagery", (req, res) => {
  res.json({
    imageryId: "IMG123456",
    date: "2025-08-20",
    provider: "MockProvider",
    url: "https://via.placeholder.com/600x400.png?text=Mock+Imagery"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
