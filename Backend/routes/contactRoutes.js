const express = require('express');
const router = express.Router();
const Contact = require('../models/contact');

// POST /api/contacts - Create a new contact
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message, customField } = req.body;
    if (!name || !email || !phone) {
      console.log('❌ Contact POST failed: missing required fields', req.body);
      return res.status(400).json({ error: 'Name, email, and phone are required.' });
    }
    const contact = new Contact({
      name,
      email,
      phone,
      message,
      customField: customField || {}
    });
    await contact.save();
    console.log('✅ Contact saved successfully:', contact);
    res.status(201).json(contact);
  } catch (err) {
    console.error('❌ Error saving contact:', err, 'Request body:', req.body);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 