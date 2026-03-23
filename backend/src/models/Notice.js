const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  attachments: [{ type: String, trim: true }]
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
