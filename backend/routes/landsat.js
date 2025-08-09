const express = require('express');
const router = express.Router();
const { getLandsatPass } = require('../controllers/landsatcontroller');

// Example: GET /api/landsat/pass?lat=28.6139&lon=77.2090
router.get('/pass', getLandsatPass);

module.exports = router;
