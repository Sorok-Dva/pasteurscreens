const { check } = require('express-validator');
const HTTPValidation = {};

HTTPValidation.normalizeEmail = [
  check('email').exists().isEmail().normalizeEmail()
];

HTTPValidation.create = [
  check('email').isEmail().normalizeEmail(),
  check('password')
    .isLength({ min: 8 }).withMessage('must be at least 8 chars long')
    .matches(/\d/).withMessage('must contain a number')
];

HTTPValidation.resetPassword = [
  check('key').exists().isLength({ min: 10 }).withMessage('wrong user key'),
  check('password')
    .isLength({ min: 8 }).withMessage('must be at least 8 chars long')
    .matches(/\d/).withMessage('must contain a number')
];

HTTPValidation.changePassword = [
  check('newPassword')
    .isLength({ min: 8 }).withMessage('must be at least 8 chars long')
    .matches(/\d/).withMessage('must contain a number'),
  check('newPasswordVerification')
    .isLength({ min: 8 }).withMessage('must be at least 8 chars long')
    .matches(/\d/).withMessage('must contain a number')
];

HTTPValidation.ApiVerifyPassword = [
  check('delPassword').exists()
];

HTTPValidation.ApiVerifyEmailAvailability = [
  check('email').exists().isEmail().normalizeEmail()
];

module.exports = HTTPValidation;