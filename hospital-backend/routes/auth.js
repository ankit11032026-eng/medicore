// routes/auth.js — Login & registration for all roles
const express = require('express');
const router  = express.Router();
const { User, Patient } = require('../models');
const { generateToken, protect } = require('../middleware/auth');

// ── POST /api/auth/admin/login ──────────────────────────────
router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, role: 'admin' });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    res.json({
      success: true,
      token: generateToken(user._id, 'admin'),
      user: { id: user._id, username: user.username, role: 'admin', name: user.name },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/staff/login ──────────────────────────────
router.post('/staff/login', async (req, res) => {
  const { username, password, department } = req.body;
  try {
    const user = await User.findOne({ username, role: 'staff' });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid staff credentials' });
    }
    res.json({
      success: true,
      token: generateToken(user._id, 'staff'),
      user: { id: user._id, username: user.username, role: 'staff', department: department || user.department },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/patient/register ────────────────────────
router.post('/patient/register', async (req, res) => {
  const { firstName, lastName, phone, email, password } = req.body;
  try {
    const exists = await Patient.findOne({ phone });
    if (exists) return res.status(409).json({ message: 'Phone already registered' });
    const patient = await Patient.create({ firstName, lastName, phone, email, password });
    res.status(201).json({
      success: true,
      token: generateToken(patient._id, 'patient'),
      patient: { id: patient._id, name: `${firstName} ${lastName}`, phone, email },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── POST /api/auth/patient/login ────────────────────────────
router.post('/patient/login', async (req, res) => {
  const { phone, password } = req.body;
  try {
    const patient = await Patient.findOne({ phone });
    if (!patient || !(await patient.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid phone or password' });
    }
    res.json({
      success: true,
      token: generateToken(patient._id, 'patient'),
      patient: { id: patient._id, name: `${patient.firstName} ${patient.lastName}`, phone: patient.phone, email: patient.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/auth/me — verify current token ─────────────────
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
