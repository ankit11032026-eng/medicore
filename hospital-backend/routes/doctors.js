// routes/doctors.js
const express = require('express');
const router  = express.Router();
const { Doctor } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/doctors — public
router.get('/', async (req, res) => {
  try {
    const { specialty } = req.query;
    const filter = specialty ? { specialty: new RegExp(specialty, 'i') } : {};
    const doctors = await Doctor.find({ ...filter, available: true }).sort({ rating: -1 });
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/doctors — admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({ success: true, doctor });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/doctors/:id — admin only
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/doctors/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Doctor removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;


// ──────────────────────────────────────────────────────────
// routes/contact.js
// ──────────────────────────────────────────────────────────
const contactRouter = express.Router();
const { Contact }   = require('../models');

// POST /api/contact — public
contactRouter.post('/', async (req, res) => {
  try {
    const msg = await Contact.create(req.body);
    res.status(201).json({ success: true, message: 'Message sent!', id: msg._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/contact — admin only (view all messages)
contactRouter.get('/', protect, adminOnly, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/contact/:id/read — mark as read
contactRouter.patch('/:id/read', protect, adminOnly, async (req, res) => {
  try {
    await Contact.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = { doctorRouter: router, contactRouter };
