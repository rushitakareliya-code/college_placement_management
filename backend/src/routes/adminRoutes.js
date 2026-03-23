const express = require('express');
const router = express.Router();
// const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getAllStudents,
  getAllCompanies,
  getAllJobs,
  addJob,
  updateJob,
  deleteJob,
  getAllNotices,
  addNotice,
  updateNotice,
  deleteNotice,
  approveOrBlockCompany,
  getPlacementReport,
  addCompany,
  updateCompany,
  deleteCompany,

} = require('../controllers/adminController');

const uploadsDir = path.join(__dirname, '../../uploads/notices');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeOriginal = file.originalname.replace(/\s+/g, '_');
    cb(null, `${unique}-${safeOriginal}`);
  }
});

const allowedExt = /\.(pdf|doc|docx|txt|png|jpg|jpeg|webp)$/i;
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (allowedExt.test(file.originalname)) {
      cb(null, true);
      return;
    }
    cb(new Error('Only PDF, DOC, DOCX, TXT and image files are allowed.'));
  }
});

// All routes require JWT + admin role
// router.use(authMiddleware);
// router.use(requireAdmin);

router.get('/students', getAllStudents);
router.get('/companies', getAllCompanies);
router.post('/companies', addCompany);
router.put('/companies/:companyId', updateCompany);
router.delete('/companies/:companyId', deleteCompany);
router.put('/companies/:companyId/approval', approveOrBlockCompany);
router.get('/jobs', getAllJobs);
router.post('/jobs', addJob);
router.put('/jobs/:jobId', updateJob);
router.delete('/jobs/:jobId', deleteJob);
router.get('/notices', getAllNotices);
router.post('/notices', upload.array('attachments', 10), addNotice);
router.put('/notices/:noticeId', upload.array('attachments', 10), updateNotice);
router.delete('/notices/:noticeId', deleteNotice);
router.get('/placement-report', getPlacementReport);

module.exports = router;
