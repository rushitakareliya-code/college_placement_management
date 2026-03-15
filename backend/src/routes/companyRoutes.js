const express = require('express');
const router = express.Router();
const { authMiddleware, requireCompany } = require('../middleware/authMiddleware');
const {
  postJob,
  getMyJobs,
  getApplicantsForJob,
  updateApplicationStatus
} = require('../controllers/companyController');

// All routes require JWT + company role
router.use(authMiddleware);
router.use(requireCompany);

router.post('/jobs', postJob);
router.get('/jobs', getMyJobs);
router.get('/jobs/:jobId/applicants', getApplicantsForJob);
router.put('/jobs/:jobId/applicants/:studentId/status', updateApplicationStatus);

module.exports = router;
