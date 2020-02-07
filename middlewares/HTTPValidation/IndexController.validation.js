const { check } = require('express-validator');
const HTTPValidation = {};

HTTPValidation.login = [
  check('username').not().isEmpty()
];

module.exports = HTTPValidation;