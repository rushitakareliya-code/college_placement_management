const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  number: { type: Number, required: true },
  address : { type: String, required: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model('Student', studentSchema);
