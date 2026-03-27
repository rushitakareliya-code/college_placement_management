const express = require('express');
const router = express.Router();
const { submitContact, getContacts, updateContactStatus } = require('../controllers/contactController');

router.post('/submit', submitContact);
router.get('/', getContacts);
router.put('/:id/status', updateContactStatus);

module.exports = router;
