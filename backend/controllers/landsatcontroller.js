const axios = require('axios');

const getLandsatPass = async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    try {
        // For now, mock data — will replace with NASA API later
        const mockPass = {
            lat,
            lon,
            satellite: 'Landsat 8',
            nextPass: '2025-08-12T10:15:00Z',
            note: 'This is mock data. API integration coming soon.'
        };

        res.json(mockPass);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch Landsat pass data' });
    }
};

module.exports = { getLandsatPass };
