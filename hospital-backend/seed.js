// seed.js — Run once to populate Atlas with initial data
// Usage: node seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { User, Doctor } = require('./models');

const connectDB = require('./config/db');

const DOCTORS = [
  { name: 'Dr. Rajesh Mehta',  specialty: 'Cardiology',   experience: '15 years', fee: '₹800', rating: 4.9, initials: 'RM', tags: ['Heart Disease','Arrhythmia','Hypertension'], schedule: { days: ['Mon','Tue','Wed','Thu','Fri','Sat'], slots: ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','2:30 PM','3:00 PM','4:00 PM'] } },
  { name: 'Dr. Sunita Patel',  specialty: 'Neurology',    experience: '12 years', fee: '₹900', rating: 4.8, initials: 'SP', tags: ['Migraines','Epilepsy','Stroke'], schedule: { days: ['Mon','Tue','Wed','Thu','Fri'], slots: ['9:00 AM','10:00 AM','11:00 AM','2:00 PM','3:00 PM','4:00 PM'] } },
  { name: 'Dr. Arjun Kumar',   specialty: 'Orthopedics',  experience: '10 years', fee: '₹750', rating: 4.7, initials: 'AK', tags: ['Knee Replacement','Spine','Sports Injury'], schedule: { days: ['Tue','Wed','Thu','Fri','Sat','Sun'], slots: ['9:00 AM','10:00 AM','11:00 AM','3:00 PM','4:00 PM','5:00 PM'] } },
  { name: 'Dr. Priya Sharma',  specialty: 'Pediatrics',   experience: '8 years',  fee: '₹600', rating: 4.9, initials: 'PS', tags: ['Child Health','Vaccination','Newborn Care'], schedule: { days: ['Mon','Tue','Wed','Thu','Fri','Sat'], slots: ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM'] } },
  { name: 'Dr. Kavita Nair',   specialty: 'Dermatology',  experience: '9 years',  fee: '₹700', rating: 4.6, initials: 'KN', tags: ['Acne','Psoriasis','Hair Loss'], schedule: { days: ['Wed','Thu','Fri','Sat','Sun','Mon'], slots: ['10:00 AM','11:00 AM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'] } },
  { name: 'Dr. Anjali Desai',  specialty: 'Gynecology',   experience: '14 years', fee: '₹850', rating: 4.8, initials: 'AD', tags: ['Prenatal','PCOS','Fertility'], schedule: { days: ['Mon','Tue','Wed','Thu','Fri','Sat'], slots: ['9:00 AM','10:00 AM','11:00 AM','2:00 PM','3:00 PM','4:00 PM'] } },
  { name: 'Dr. Rahul Joshi',   specialty: 'Dentistry',    experience: '7 years',  fee: '₹500', rating: 4.7, initials: 'RJ', tags: ['Root Canal','Braces','Implants'], schedule: { days: ['Tue','Wed','Thu','Fri','Sat'], slots: ['9:00 AM','10:00 AM','11:00 AM','3:00 PM','4:00 PM','5:00 PM'] } },
];

const seed = async () => {
  await connectDB();

  console.log('🌱 Seeding database...\n');

  // Clear existing
  await Promise.all([User.deleteMany(), Doctor.deleteMany()]);

  // Create admin user
  const adminPass = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
  await User.create({
    username: process.env.ADMIN_USERNAME || 'admin',
    password: adminPass,
    role: 'admin',
    name: 'Administrator',
  });
  console.log(`✅ Admin user created: ${process.env.ADMIN_USERNAME || 'admin'}`);

  // Create staff user
  const staffPass = await bcrypt.hash(process.env.STAFF_PASSWORD || 'staff123', 10);
  await User.create({
    username: process.env.STAFF_USERNAME || 'staff',
    password: staffPass,
    role: 'staff',
    name: 'Reception Staff',
    department: 'Reception',
  });
  console.log(`✅ Staff user created: ${process.env.STAFF_USERNAME || 'staff'}`);

  // Create doctors
  await Doctor.insertMany(DOCTORS);
  console.log(`✅ ${DOCTORS.length} doctors seeded`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('─────────────────────────────────────');
  console.log(`Admin login:  ${process.env.ADMIN_USERNAME||'admin'} / ${process.env.ADMIN_PASSWORD||'admin123'}`);
  console.log(`Staff login:  ${process.env.STAFF_USERNAME||'staff'} / ${process.env.STAFF_PASSWORD||'staff123'}`);
  console.log('─────────────────────────────────────\n');

  mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });
