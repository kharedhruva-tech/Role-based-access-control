const express = require('express');
const auditController = require('../controllers/audit.controller');

const router = express.Router();

router.get('/', auditController.getAuditLogs);

module.exports = router;
