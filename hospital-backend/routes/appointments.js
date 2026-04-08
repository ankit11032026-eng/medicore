// routes/appointments.js
const express = require('express');
const router  = express.Router();
const { Appointment } = require('../models');
const { protect, staffOrAdmin, adminOnly } = require('../middleware/auth');

// POST /api/appointments — book a new appointment (public)
router.post('/', async (req, res) => {
  try {
    const appt = await Appointment.create(req.body);
    res.status(201).json({ success: true, appointment: appt });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/appointments — all appointments (staff/admin only)
router.get('/', protect, staffOrAdmin, async (req, res) => {
  try {
    const { status, search, date } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date)   filter.date   = date;
    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [
        { 'patient.firstName': re },
        { 'patient.lastName':  re },
        { 'patient.phone':     re },
        { 'doctor.name':       re },
        { appointmentId:       re },
      ];
    }
    const appts = await Appointment.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, appointments: appts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/appointments/my — patient's own appointments
router.get('/my', protect, async (req, res) => {
  try {
    const appts = await Appointment.find({ 'patient.phone': req.user.phone })
      .sort({ createdAt: -1 });
    res.json({ success: true, appointments: appts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/appointments/stats — summary counts (staff/admin)
router.get('/stats', protect, staffOrAdmin, async (req, res) => {
  try {
    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'Pending' }),
      Appointment.countDocuments({ status: 'Confirmed' }),
      Appointment.countDocuments({ status: 'Completed' }),
      Appointment.countDocuments({ status: 'Cancelled' }),
    ]);
    res.json({ success: true, stats: { total, pending, confirmed, completed, cancelled } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/appointments/:id — single appointment
router.get('/:id', protect, staffOrAdmin, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, appointment: appt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/appointments/:id/status — update status (staff/admin)
router.patch('/:id/status', protect, staffOrAdmin, async (req, res) => {
  try {
    const { status, staffNotes } = req.body;
    const update = { status };
    if (staffNotes)              update.staffNotes  = staffNotes;
    if (status === 'Confirmed')  update.checkedInAt = new Date();
    if (status === 'Completed')  update.completedAt = new Date();
    const appt = await Appointment.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!appt) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, appointment: appt });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/appointments/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
