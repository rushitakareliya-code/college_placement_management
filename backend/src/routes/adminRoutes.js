const express = require('express');
const router = express.Router();
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');
const {
  getAllStudents,
  getAllCompanies,
  approveOrBlockCompany,
  getPlacementReport,
  addCompany,
  updateCompany,
  deleteCompany,

} = require('../controllers/adminController');

// All routes require JWT + admin role
router.use(authMiddleware);
router.use(requireAdmin);

router.get('/students', getAllStudents);
router.get('/companies', getAllCompanies);
router.post('/companies', addCompany);
router.put('/companies/:companyId', updateCompany);
router.delete('/companies/:companyId', deleteCompany);
router.put('/companies/:companyId/approval', approveOrBlockCompany);
router.get('/placement-report', getPlacementReport);

module.exports = router;
