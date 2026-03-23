const express = require('express');
const router = express.Router();
// const { authMiddleware, requireCompany } = require('../middleware/authMiddleware');
const {
  postJob,
  getMyJobs,
  getApplicantsForJob,
  updateApplicationStatus
} = require('../controllers/companyController');

// All routes require JWT + company role
// router.use(authMiddleware);
// router.use(requireCompany);

// Use /company/jobs so /api/jobs is reserved for admin + public job API (no conflict)
router.post('/company/jobs', postJob);
router.get('/company/jobs', getMyJobs);
router.get('/company/jobs/:jobId/applicants', getApplicantsForJob);
router.put('/company/jobs/:jobId/applicants/:studentId/status', updateApplicationStatus);

module.exports = router;
