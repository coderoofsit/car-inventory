const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();  // For environment variables

const app = express();
app.use(cors());  // Enable cross-origin requests
app.use(express.json());  // Parse incoming JSON requests

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected!'))
  .catch(err => console.log(err));

// Example Route: Get all cars
app.get('/cars', async (req, res) => {
    try {
        const cars = await Car.find();  // Fetch all cars from MongoDB
        res.json(cars);
    } catch (err) {
        res.status(400).send(err);
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
