const express = require('express');
const cors = require('cors');
require('dotenv').config();

const landsatRoutes = require('./routes/landsat');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/landsat', landsatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
