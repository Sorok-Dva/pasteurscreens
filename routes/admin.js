const express = require('express');
const router = express.Router();

const User = require('../models/user');

const adminController = require('../controllers/admin');

/**
 * @route GET '/admin/'
 */
router.get('/', User.ensureIsAdmin, (req, res) => {
	return res.render('admin/index', { });
});

router.get('/accounts', User.ensureIsAdmin, adminController.getAccounts);

module.exports = router;