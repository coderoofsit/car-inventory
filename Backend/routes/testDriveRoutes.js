const express = require('express');
const router = express.Router();
const TestDrive = require('../models/testDrive');
const Contact = require('../models/contact');

// POST /api/test-drives - Create a new test drive request
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, preferredDate, preferredTime, message, carExchange } = req.body;
    if (!name || !email || !phone || !preferredDate) {
      console.log('❌ Test Drive POST failed: missing required fields', req.body);
      return res.status(400).json({ error: 'Name, email, phone, and preferred date are required.' });
    }

    // Create test drive entry
    const testDrive = new TestDrive({
      name,
      email,
      phone,
      preferredDate,
      preferredTime,
      message,
      customField: {
        carExchange: carExchange || false
      }
    });
    await testDrive.save();

    // Also create a contact entry
    const contact = new Contact({
      name,
      email,
      phone,
      message: `Test Drive Request - Date: ${preferredDate}, Time: ${preferredTime || 'Not specified'}. ${message || ''}`,
      customField: {
        carExchange: carExchange || false
      }
    });
    await contact.save();

    console.log('✅ Test Drive saved successfully:', testDrive);
    console.log('✅ Contact entry created for test drive:', contact);
    
    res.status(201).json({ testDrive, contact });
  } catch (err) {
    console.error('❌ Error saving test drive:', err, 'Request body:', req.body);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 