const express = require('express');
const router = express.Router();

const User = require('../models/user');
const UserController = require('../controllers/user');

router.get('/', User.ensureAuthenticated, UserController.getUser);
router.post('/changePassword', User.ensureAuthenticated, UserController.postUserChangePassword);
router.post('/changeMail', User.ensureAuthenticated, UserController.postUserChangeMail);
router.get('/validation/:key', UserController.getValidateAccount);
router.get('/account/validated', UserController.getAcccountValidated);

module.exports = router;