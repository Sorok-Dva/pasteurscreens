const User = require('../models/user');
const mysql = require('../bin/mysql');
const mailer = require('../bin/mailer');

const AdminController = {};

AdminController.getAccounts = (req, res) => {
    return res.render('admin/accounts', { accounts: [] });
};

/**
 * @method editUserProfile
 * @description User profile edition
 * @param req
 * @returns {*}
 */
AdminController.editUserProfile = (req) => {
    let nickname = req.body.nickname,
        userId = req.body.userId,
        email = req.body.email
    ;

    req.checkBody('userId', 'You mad bro ?').notEmpty();
    req.checkBody('nickname', 'You must provide a nickname.').notEmpty();
    req.checkBody('email', 'You must provide an email address').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();

    let errors = req.validationErrors();

    if (errors) {
        return Promise.reject(new Error('Form error : ' + errors));
    } else {
    }
};

module.exports = AdminController;