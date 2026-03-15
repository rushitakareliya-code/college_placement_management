const express = require('express');
const router = express.Router();
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');
const {
  getAllStudents,
  getAllCompanies,
  approveOrBlockCompany,
  getPlacementReport
} = require('../controllers/adminController');

// All routes require JWT + admin role
router.use(authMiddleware);
router.use(requireAdmin);

router.get('/students', getAllStudents);
router.get('/companies', getAllCompanies);
router.put('/companies/:companyId/approval', approveOrBlockCompany);
router.get('/placement-report', getPlacementReport);

module.exports = router;
