const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    console.log("mongo",process.env.MONGODB_URL)
    
    const conn = await mongoose.connect(process.env.MONGODB_URL);

    console.log(`MongoDB Connected succsessfully : ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

module.exports = connectDB;