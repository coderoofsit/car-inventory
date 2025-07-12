const express = require('express');
const router = express.Router();
const Car = require('../models/car');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Add a middleware for logging all requests to this router
router.use((req, res, next) => {
  console.log(`[carRoutes] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  if (req.method !== 'GET') {
    console.log('Body:', req.body);
  }
  next();
});

// GET all cars
router.get('/', async (req, res) => {
  console.log('[carRoutes] GET / - Fetch all cars');
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    console.error('[carRoutes] Error fetching cars:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST new car
router.post('/', async (req, res) => {
  console.log('[carRoutes] POST / - Add new car');
  try {
    const car = new Car(req.body);
    const savedCar = await car.save();
    res.status(201).json(savedCar);
  } catch (err) {
    console.error('[carRoutes] Error saving car:', err);
    res.status(400).json({ error: err.message });
  }
});

// POST /upload - Upload image to Cloudinary
router.post('/upload', upload.single('image'), async (req, res) => {
  console.log('[carRoutes] POST /upload - Upload image');
  try {
    if (!req.file) {
      console.log('[carRoutes] No file received');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('[carRoutes] File received:', req.file.originalname, req.file.mimetype, req.file.size);
    // Upload to Cloudinary using a stream
    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'car-inventory' },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };
    const result = await streamUpload(req.file.buffer);
    console.log('[carRoutes] Cloudinary upload result:', result);
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('[carRoutes] Error uploading image:', err);
    res.status(500).json({ error: err.message });
  }
});

// Test route for debugging
router.get('/test', (req, res) => {
  console.log('[carRoutes] GET /test - Test route hit');
  res.json({ message: 'Test route working' });
});

module.exports = router;
