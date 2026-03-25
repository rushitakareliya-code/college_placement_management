const Student = require("../models/Student");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerStudent = async (req, res, next) => {
  try {
    const { name, email, number, address, password, cpassword } = req.body;

    // ✅ Required field check
    // if (!name || !email || !number || !address || !password || !cpassword) {
    //   return res.status(400).json({ message: 'All fields are required.' });
    // }

    // ✅ Password match check
    if (password !== cpassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // ✅ Check existing user
    const exists = await Student.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // ✅ Hash password (bcrypt now works!)
    const hashedPassword = await bcrypt.hash(password, 10);
    // You only need ONE hashed password - use it for both
    const student = await Student.create({
      name,
      email,
      number,
      address,
      password: hashedPassword,
      cpassword: hashedPassword  // ✅ Same hash for both
    });

    // ✅ Generate token
    const token = generateToken(student._id, 'student');

    res.status(201).json({
      message: 'Student registered successfully.',
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: 'student'
      }
    });

  } catch (error) {
    next(error);
  }
};

// loginStudent remains the same...
const loginStudent = async (req, res, next) => {
  console.log("LOGIN API HIT"); 
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        emailError: !email,
        passwordError: !password,
        message: 'Email and password are required.'
      });
    }

    const student = await Student.findOne({ email });

    let emailError = false;
    let passwordError = false;

    // Check email
    if (!student) {
      emailError = true;
    } else {
      // Check password
      const match = await bcrypt.compare(password, student.password);
      if (!match) passwordError = true;
    }

    // Both email and password are wrong → common error
    if (emailError && passwordError) {
      return res.status(401).json({
        emailError,
        passwordError,
        commonError: 'Invalid credentials'
      });
    }

    // Only email wrong
    if (emailError) {
      return res.status(401).json({ emailError, message: 'Invalid email' });
    }

    // Only password wrong
    if (passwordError) {
      return res.status(401).json({ passwordError, message: 'Invalid password' });
    }

    // ✅ Successful login
    const token = generateToken(student._id, 'student');
    res.json({
      message: 'Login successful.',
      token,
      user: { id: student._id, name: student.name, email: student.email, role: 'student' }
    });

  } catch (error) {
    next(error);
  }
};
module.exports = {
  registerStudent,
  loginStudent
};
