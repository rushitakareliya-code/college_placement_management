const express = require('express');
const router = express.Router();
// const { authMiddleware, requireStudent } = require('../middleware/authMiddleware');
const {
  loginStudent,
  registerStudent
} = require('../controllers/studentController');

router.post('/student/register', registerStudent);
router.post('/student/login', loginStudent);

module.exports = router;
