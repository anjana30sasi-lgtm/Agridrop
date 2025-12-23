const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS so your GitHub Pages frontend can communicate with this Render backend
app.use(cors());

// Database of 44 Crops with region, water need, and yield/profit metrics
const cropData = [
    // SOUTH INDIA
    { crop: "Rice", water_need: "High", region: "South India", yield_per_acre: 3, profit_per_acre: 48000 },
    { crop: "Sugarcane", water_need: "High", region: "South India", yield_per_acre: 4, profit_per_acre: 70000 },
    { crop: "Banana", water_need: "High", region: "South India", yield_per_acre: 4, profit_per_acre: 70000 },
    { crop: "Coconut", water_need: "High", region: "South India", yield_per_acre: 3.5, profit_per_acre: 65000 },
    { crop: "Maize", water_need: "Medium", region: "South India", yield_per_acre: 3, profit_per_acre: 45000 },
    { crop: "Tomato", water_need: "Medium", region: "South India", yield_per_acre: 2.8, profit_per_acre: 55000 },
    { crop: "Mango", water_need: "Medium", region: "South India", yield_per_acre: 3, profit_per_acre: 72000 },
    { crop: "Coffee", water_need: "Medium", region: "South India", yield_per_acre: 1.2, profit_per_acre: 60000 },
    { crop: "Millets", water_need: "Low", region: "South India", yield_per_acre: 2, profit_per_acre: 50000 },
    { crop: "Sorghum", water_need: "Low", region: "South India", yield_per_acre: 2.2, profit_per_acre: 47000 },
    { crop: "Onion", water_need: "Low", region: "South India", yield_per_acre: 2.5, profit_per_acre: 52000 },
    { crop: "Papaya", water_need: "Low", region: "South India", yield_per_acre: 2.5, profit_per_acre: 50000 },

    // NORTH INDIA
    { crop: "Wheat", water_need: "High", region: "North India", yield_per_acre: 2.5, profit_per_acre: 40000 },
    { crop: "Apple", water_need: "High", region: "North India", yield_per_acre: 3, profit_per_acre: 65000 },
    { crop: "Tea", water_need: "High", region: "North India", yield_per_acre: 1, profit_per_acre: 65000 },
    { crop: "Potato", water_need: "Medium", region: "North India", yield_per_acre: 3, profit_per_acre: 60000 },
    { crop: "Peas", water_need: "Medium", region: "North India", yield_per_acre: 2, profit_per_acre: 42000 },
    { crop: "Mustard", water_need: "Medium", region: "North India", yield_per_acre: 1.7, profit_per_acre: 36000 },
    { crop: "Barley", water_need: "Low", region: "North India", yield_per_acre: 1.8, profit_per_acre: 35000 },
    { crop: "Lentil", water_need: "Low", region: "North India", yield_per_acre: 1.9, profit_per_acre: 40000 },
    { crop: "Pumpkin", water_need: "Low", region: "North India", yield_per_acre: 1.5, profit_per_acre: 40000 },

    // WEST INDIA
    { crop: "Cotton", water_need: "High", region: "West India", yield_per_acre: 1.5, profit_per_acre: 52000 },
    { crop: "Groundnut", water_need: "Low", region: "West India", yield_per_acre: 2.1, profit_per_acre: 45000 },
    { crop: "Cucumber", water_need: "Low", region: "West India", yield_per_acre: 2.2, profit_per_acre: 47000 },
    { crop: "Brinjal", water_need: "Medium", region: "West India", yield_per_acre: 2, profit_per_acre: 44000 },
    { crop: "Grapes", water_need: "Medium", region: "West India", yield_per_acre: 3, profit_per_acre: 68000 },
    { crop: "Pomegranate", water_need: "Low", region: "West India", yield_per_acre: 2, profit_per_acre: 62000 },

    // EAST INDIA
    { crop: "Jute", water_need: "High", region: "East India", yield_per_acre: 2.5, profit_per_acre: 55000 },
    { crop: "Soybean", water_need: "Medium", region: "East India", yield_per_acre: 2.5, profit_per_acre: 43000 },
    { crop: "Cabbage", water_need: "Low", region: "East India", yield_per_acre: 2, profit_per_acre: 48000 },
    { crop: "Bottle Gourd", water_need: "Low", region: "East India", yield_per_acre: 2, profit_per_acre: 47000 },

    // CENTRAL INDIA
    { crop: "Chickpea", water_need: "Low", region: "Central India", yield_per_acre: 1.6, profit_per_acre: 38000 },
    { crop: "Onion", water_need: "Low", region: "Central India", yield_per_acre: 2.1, profit_per_acre: 52000 },
    { crop: "Tomato", water_need: "Medium", region: "Central India", yield_per_acre: 2.3, profit_per_acre: 55000 },
    
    // ADDITIONAL VARIED CROPS
    { crop: "Blackgram", water_need: "Low", region: "South India", yield_per_acre: 1.5, profit_per_acre: 35000 },
    { crop: "Mungbean", water_need: "Low", region: "North India", yield_per_acre: 1.4, profit_per_acre: 34000 },
    { crop: "Kidney Beans", water_need: "Medium", region: "North India", yield_per_acre: 1.8, profit_per_acre: 41000 },
    { crop: "Radish", water_need: "Low", region: "South India", yield_per_acre: 2, profit_per_acre: 48000 },
    { crop: "Spinach", water_need: "Low", region: "North India", yield_per_acre: 1.5, profit_per_acre: 40000 },
    { crop: "Okra", water_need: "Medium", region: "South India", yield_per_acre: 2.1, profit_per_acre: 50000 },
    { crop: "Capsicum", water_need: "Low", region: "South India", yield_per_acre: 2, profit_per_acre: 51000 },
    { crop: "Watermelon", water_need: "Medium", region: "South India", yield_per_acre: 3, profit_per_acre: 55000 },
    { crop: "Muskmelon", water_need: "Low", region: "South India", yield_per_acre: 2.3, profit_per_acre: 48000 },
    { crop: "Pear", water_need: "Medium", region: "North India", yield_per_acre: 2.5, profit_per_acre: 60000 }
];

// Root route to check if server is running
app.get('/', (req, res) => {
    res.send("Agridrop Backend is Live and Ready!");
});

// The Recommendation API Endpoint
app.get('/recommend', (req, res) => {
    const { water, region, land } = req.query;
    const landSize = parseFloat(land) || 1;

    // Safety check: if parameters are missing
    if (!water || !region) {
        return res.status(400).json({ error: "Missing water or region parameters" });
    }

    const filtered = cropData.filter(c => 
        c.region.toLowerCase() === region.toLowerCase() && 
        c.water_need.toLowerCase() === water.toLowerCase()
    ).map(c => ({
        ...c,
        total_yield: (c.yield_per_acre * landSize).toFixed(2),
        total_profit: Math.round(c.profit_per_acre * landSize)
    }));

    res.json(filtered);
});

// Use the PORT provided by Render environment, or 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
