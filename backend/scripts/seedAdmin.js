/**
 * One-time script to create the first admin (pre-created in DB).
 * Run: node scripts/seedAdmin.js
 * Default: admin@example.com / admin123
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../src/models/Admin');

const defaultEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const exists = await Admin.findOne({ email: defaultEmail });
  if (exists) {
    console.log('Admin already exists:', defaultEmail);
    process.exit(0);
    return;
  }
  const hashed = await bcrypt.hash(defaultPassword, 10);
  await Admin.create({
    name: 'Admin',
    email: defaultEmail,
    password: hashed
  });
  console.log('Admin created:', defaultEmail);
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
