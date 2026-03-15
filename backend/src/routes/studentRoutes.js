const express = require('express');
const router = express.Router();
const { authMiddleware, requireStudent } = require('../middleware/authMiddleware');
const {
  getApprovedJobs,
  applyForJob,
  getAppliedJobs,
  updateProfile
} = require('../controllers/studentController');

// All routes require JWT + student role
router.use(authMiddleware);
router.use(requireStudent);

router.get('/jobs', getApprovedJobs);
router.post('/jobs/:jobId/apply', applyForJob);
router.get('/applications', getAppliedJobs);
router.put('/profile', updateProfile);

module.exports = router;
