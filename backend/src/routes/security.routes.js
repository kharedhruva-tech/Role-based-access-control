const express = require('express');
const securityController = require('../controllers/security.controller');

const router = express.Router();

router.get('/events', securityController.getSecurityEvents);
router.get('/metrics', securityController.getSecurityMetrics);

module.exports = router;
