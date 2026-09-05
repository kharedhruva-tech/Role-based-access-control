const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

router.post(
  '/',
  [
    body('username').trim().isLength({ min: 3 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('roleId').notEmpty(),
    validate,
  ],
  userController.createUser
);

router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
