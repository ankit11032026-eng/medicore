// models/index.js — All MongoDB schemas & models

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─────────────────────────────────────────
// APPOINTMENT MODEL
// ─────────────────────────────────────────
const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    unique: true,
    default: () => 'APT-2026-' + Math.floor(1000 + Math.random() * 9000),
  },
  // Patient info
  patient: {
    firstName:  { type: String, required: true, trim: true },
    lastName:   { type: String, required: true, trim: true },
    phone:      { type: String, required: true },
    email:      { type: String, trim: true, lowercase: true },
    dob:        { type: String },
    gender:     { type: String, enum: ['Male', 'Female', 'Other'] },
    address:    { type: String },
    bloodGroup: { type: String },
    emergency:  { type: String },
  },
  // Doctor info
  doctor: {
    name:      { type: String, required: true },
    specialty: { type: String, required: true },
  },
  // Slot
  date:      { type: String, required: true },
  time:      { type: String, required: true },
  fee:       { type: String },
  reason:    { type: String },
  // Workflow status
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  // Staff notes
  staffNotes: { type: String },
  checkedInAt: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });

// ─────────────────────────────────────────
// PATIENT MODEL (registered users)
// ─────────────────────────────────────────
const patientSchema = new mongoose.Schema({
  firstName:   { type: String, required: true, trim: true },
  lastName:    { type: String, trim: true },
  phone:       { type: String, required: true, unique: true },
  email:       { type: String, trim: true, lowercase: true },
  password:    { type: String, required: true, minlength: 6 },
  dob:         { type: String },
  gender:      { type: String },
  bloodGroup:  { type: String },
  address:     { type: String },
}, { timestamps: true });

// Hash password before save
patientSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

patientSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// ─────────────────────────────────────────
// USER MODEL (admin / staff accounts)
// ─────────────────────────────────────────
const userSchema = new mongoose.Schema({
  username:   { type: String, required: true, unique: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['admin', 'staff'], required: true },
  department: { type: String, default: 'Reception' },
  name:       { type: String },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// ─────────────────────────────────────────
// DOCTOR MODEL
// ─────────────────────────────────────────
const doctorSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  specialty:   { type: String, required: true },
  experience:  { type: String },
  fee:         { type: String },
  rating:      { type: Number, default: 4.5 },
  available:   { type: Boolean, default: true },
  initials:    { type: String },
  description: { type: String },
  tags:        [String],
  schedule: {
    days: [String],  // e.g. ['Mon', 'Tue', 'Wed']
    slots: [String], // e.g. ['9:00 AM', '9:30 AM', ...]
  },
}, { timestamps: true });

// ─────────────────────────────────────────
// CONTACT MESSAGE MODEL
// ─────────────────────────────────────────
const contactSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  phone:   { type: String },
  email:   { type: String },
  subject: { type: String },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = {
  Appointment: mongoose.model('Appointment', appointmentSchema),
  Patient:     mongoose.model('Patient',     patientSchema),
  User:        mongoose.model('User',        userSchema),
  Doctor:      mongoose.model('Doctor',      doctorSchema),
  Contact:     mongoose.model('Contact',     contactSchema),
};
