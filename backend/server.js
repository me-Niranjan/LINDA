// backend/server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = 5000;

// 🔹 Route to fetch imagery from NASA CMR
app.get("/api/imagery", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "lat and lon required" });
  }

  try {
    // NASA CMR API search for HLSL30 dataset (Landsat-Sentinel harmonized)
    const response = await axios.get("https://cmr.earthdata.nasa.gov/search/granules.json", {
      params: {
        short_name: "HLSL30",   // Landsat-based HLS product
        bounding_box: `${lon-0.01},${lat-0.01},${lon+0.01},${lat+0.01}`, 
        page_size: 5,
        sort_key: "-start_date"
      }
    });

    const granules = response.data.feed.entry.map(item => ({
      title: item.title,
      time: item.time_start,
      download: item.links?.find(l => l.rel.includes("data#"))?.href || "N/A"
    }));

    res.json({ results: granules });
  } catch (err) {
    console.error("Error fetching imagery:", err.message);
    res.status(500).json({ error: "Failed to fetch imagery" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
