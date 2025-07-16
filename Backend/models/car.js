const mongoose = require('mongoose');
const Requirement = require('./requirement');
const nodemailer = require('nodemailer');

const carSchema = new mongoose.Schema({
  make: String,
  model: String,
  year: Number,
  price: Number,
  mileage: Number,
  location: String,
  fuel: String,
  transmission: String,
  media: [String], // Array of Cloudinary URLs (images/videos)
  condition: String,
  description: String,
  vin: String,
  availability: {
    type: String,
    enum: ['Available', 'Sold', 'Reserved'],
    default: 'Available'
  },
  // Additional fields from frontend
  trim: String,
  bodyStyle: String,
  doors: String,
  manufactureMonth: String,
  manufactureYear: String,
  brand: String,
  noOfOwner: String,
  homeTestDrive: String,
  registrationMonth: String,
  registrationYear: String,
  insuranceValidityMonth: String,
  insuranceValidityYear: String,
  insuranceValid: String,
  insuranceType: String,
  rto: String,
  engineCapacity: String,
  bodyStyleDetails: String,
  ownerDetails: String,
  homeTestDriveDetails: String,
  kmRun: String,
  fuelTypeDetails: String,
  transmissionTypeDetails: String,
  exteriorColorDetails: String,
  interiorColorDetails: String,
  sellingPrice: String,
  status: String,
  mileageUnit: String,
  fuelType: String,
  driveType: String,
  transmissionType: String,
  engineType: String,
  exteriorColor: String,
  interiorColor: String,
  // Features (arrays)
  interior: [String],
  convenience: [String],
  safety: [String],
  exterior: [String],
  performance: [String],
  documentsAvailable: [String],
  additional: [String],
}, { timestamps: true });

carSchema.post('save', async function (doc) {
  // Only notify if this is a new car (not an update)
  if (!doc.isNew) return;
  // Find requirements that match this car
  const requirements = await Requirement.find({ notified: false });
  for (const req of requirements) {
    let match = true;
    const f = req.filters;
    if (f.brand && f.brand.length && !f.brand.includes(doc.brand)) match = false;
    if (f.model && f.model.length && !f.model.includes(doc.model)) match = false;
    if (f.bodyStyle && f.bodyStyle.length && !f.bodyStyle.includes(doc.bodyStyle)) match = false;
    if (f.fuel && f.fuel.length && !f.fuel.includes(doc.fuelTypeDetails)) match = false;
    if (f.transmission && f.transmission !== doc.transmissionTypeDetails) match = false;
    if (f.ownership && f.ownership !== doc.ownership) match = false;
    if (f.minYear && doc.manufactureYear < f.minYear) match = false;
    if (f.maxYear && doc.manufactureYear > f.maxYear) match = false;
    if (f.minPrice && doc.sellingPrice < f.minPrice) match = false;
    if (f.maxPrice && doc.sellingPrice > f.maxPrice) match = false;
    if (f.minKmRun && doc.kmRun < f.minKmRun) match = false;
    if (f.maxKmRun && doc.kmRun > f.maxKmRun) match = false;
    if (match) {
      // Send email
      const transporter = nodemailer.createTransport({
        // Configure your SMTP here
        service: 'gmail',
        auth: {
          user: process.env.NOTIFY_EMAIL_USER,
          pass: process.env.NOTIFY_EMAIL_PASS
        }
      });
      await transporter.sendMail({
        from: process.env.NOTIFY_EMAIL_USER,
        to: req.contact.email,
        subject: 'We found a car matching your requirement!',
        text: `Hi ${req.contact.name},\n\nWe have added a car that matches your requirement: ${doc.brand} ${doc.model}, Year: ${doc.manufactureYear}, Price: ${doc.sellingPrice}. Visit our site to view more details.\n\nThank you!`
      });
      req.notified = true;
      await req.save();
    }
  }
});

module.exports = mongoose.model('Car', carSchema);
