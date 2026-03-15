const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Admin = require('../models/Admin');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password, branch, skills, resume } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    const exists = await Student.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await Student.create({
      name,
      email,
      password: hashedPassword,
      branch: branch || '',
      skills: skills || [],
      resume: resume || ''
    });
    const token = generateToken(student._id, 'student');
    res.status(201).json({
      message: 'Student registered successfully.',
      token,
      user: { id: student._id, name: student.name, email: student.email, role: 'student' }
    });
  } catch (error) {
    next(error);
  }
};

const loginStudent = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const student = await Student.findOne({ email });
    if (!student) return res.status(401).json({ message: 'Invalid email or password.' });
    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password.' });
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

const registerCompany = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    const exists = await Company.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const company = await Company.create({
      name,
      email,
      password: hashedPassword
    });
    const token = generateToken(company._id, 'company');
    res.status(201).json({
      message: 'Company registered successfully.',
      token,
      user: { id: company._id, name: company.name, email: company.email, role: 'company' }
    });
  } catch (error) {
    next(error);
  }
};

// login company
const loginCompany = async (req, res, next) => {
  try {
    console.log("company called");
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const company = await Company.findOne({ email });
    if (!company) return res.status(401).json({ message: 'Invalid email or password.' });
    const match = await bcrypt.compare(password, company.password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password.' });
    const token = generateToken(company._id, 'company');
    res.json({
      message: 'Login successful.',
      token,
      user: { id: company._id, name: company.name, email: company.email, role: 'company' }
    });
  } catch (error) {
    next(error);
  }
};

// log in admin
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: 'Invalid email or password.' });
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password.' });
    const token = generateToken(admin._id, 'admin');
    res.json({
      message: 'Login successful.',
      token,
      user: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStudent,
  loginStudent,
  registerCompany,
  loginCompany,
  loginAdmin
};
