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

// Add filtering support to GET /api/cars
router.get('/cars', async (req, res) => {
  try {
    const query = {};
    // Map query params to MongoDB query
    if (req.query.brand) {
      if (Array.isArray(req.query.brand)) {
        query["brand"] = { $in: req.query.brand.map(b => new RegExp(`^${b}$`, 'i')) };
      } else {
        query["brand"] = new RegExp(`^${req.query.brand}$`, 'i');
      }
    }
    if (req.query.model) {
      if (Array.isArray(req.query.model)) {
        query["model"] = { $in: req.query.model.map(m => new RegExp(`^${m}$`, 'i')) };
      } else {
        query["model"] = new RegExp(`^${req.query.model}$`, 'i');
      }
    }
    if (req.query.fuel) {
      if (Array.isArray(req.query.fuel)) {
        query["fuelTypeDetails"] = { $in: req.query.fuel.map(f => new RegExp(`^${f}$`, 'i')) };
      } else {
        query["fuelTypeDetails"] = new RegExp(`^${req.query.fuel}$`, 'i');
      }
    }
    if (req.query.transmission) query["transmissionTypeDetails"] = req.query.transmission;
    if (req.query.ownership) query["ownerDetails"] = req.query.ownership;
    if (req.query.minYear || req.query.maxYear) {
      query["manufactureYear"] = {};
      if (req.query.minYear) query["manufactureYear"].$gte = parseInt(req.query.minYear);
      if (req.query.maxYear) query["manufactureYear"].$lte = parseInt(req.query.maxYear);
    }
    if (req.query.minPrice || req.query.maxPrice) {
      query["sellingPrice"] = {};
      if (req.query.minPrice) query["sellingPrice"].$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice) query["sellingPrice"].$lte = parseInt(req.query.maxPrice);
    }
    if (req.query.minMileage || req.query.maxMileage) {
      query["kmRun"] = {};
      if (req.query.minMileage) query["kmRun"].$gte = parseInt(req.query.minMileage);
      if (req.query.maxMileage) query["kmRun"].$lte = parseInt(req.query.maxMileage);
    }
    // Add more filters as needed
    // Log the final query for debugging
    console.log('Car filter query:', JSON.stringify(query, null, 2));
    const cars = await Car.find(query);
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new car
router.post('/', async (req, res) => {
  console.log('[carRoutes] POST / - Add new car');
  try {
    // Accept 'media' as the array of images/videos
    if (req.body.media && Array.isArray(req.body.media)) {
      req.body.images = req.body.media;
      delete req.body.media;
    }
    const car = new Car(req.body);
    const savedCar = await car.save();
    res.status(201).json(savedCar);
  } catch (err) {
    console.error('[carRoutes] Error saving car:', err);
    res.status(400).json({ error: err.message });
  }
});

// POST /upload - Upload media (images and videos) to Cloudinary
router.post('/upload', upload.single('media'), async (req, res) => {
  console.log('[carRoutes] POST /upload - Upload media');
  try {
    if (!req.file) {
      console.log('[carRoutes] No file received');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log('[carRoutes] File received:', req.file.originalname, req.file.mimetype, req.file.size);
    
    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/avif'];
    const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];
    
    if (!allowedTypes.includes(req.file.mimetype)) {
      console.log('[carRoutes] Invalid file type:', req.file.mimetype);
      return res.status(400).json({ 
        error: 'Invalid file type. Supported formats: JPG, PNG, GIF, MP4, MOV, AVI, WebM' 
      });
    }
    
    // Upload to Cloudinary using a stream
    const streamUpload = (fileBuffer, resourceType = 'auto') => {
      return new Promise((resolve, reject) => {
        const uploadOptions = { 
          folder: 'car-inventory',
          resource_type: resourceType
        };
        
        const stream = cloudinary.uploader.upload_stream(
          uploadOptions,
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
    
    // Determine resource type based on mimetype
    const isVideo = allowedVideoTypes.includes(req.file.mimetype);
    const resourceType = isVideo ? 'video' : 'image';
    
    const result = await streamUpload(req.file.buffer, resourceType);
    console.log('[carRoutes] Cloudinary upload result:', result);
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('[carRoutes] Error uploading media:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET a single car by ID
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test route for debugging
router.get('/test', (req, res) => {
  console.log('[carRoutes] GET /test - Test route hit');
  res.json({ message: 'Test route working' });
});

module.exports = router;
