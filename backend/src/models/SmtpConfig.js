const mongoose = require('mongoose');

const smtpConfigSchema = new mongoose.Schema(
  {
    host: { type: String, required: true, trim: true },
    port: { type: Number, required: true, default: 587 },
    secure: { type: Boolean, default: false }, // true for 465, false for others
    user: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    fromName: { type: String, default: 'Placement Portal', trim: true },
    fromEmail: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SmtpConfig', smtpConfigSchema);
