const express = require('express');
const { body } = require('express-validator');
const roleController = require('../controllers/role.controller');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

router.get('/', roleController.getAllRoles);
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Role name is required'),
    body('description').trim().notEmpty().withMessage('Role description is required'),
    validate,
  ],
  roleController.createRole
);
router.put('/:id', roleController.updateRole);
router.delete('/:id', roleController.deleteRole);

module.exports = router;
