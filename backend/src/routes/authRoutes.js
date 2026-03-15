const express = require('express');
const router = express.Router();
const {
  registerStudent,
  loginStudent,
  registerCompany,
  loginCompany,
  loginAdmin
} = require('../controllers/authController');

router.post('/student/register', registerStudent);
router.post('/student/login', loginStudent);
router.post('/company/register', registerCompany);
router.post('/company/login', loginCompany);
router.post('/admin/login', loginAdmin);

module.exports = router;
