const User = require('../models/user');

const config = require('./../config/main');
const request = require('request');
const mailer = require('./../bin/mailer');

const UserController = {};

UserController.getUser = (req, res) => {
  User.getData(req.user, (user) => {
    return res.render('users/profile', {user});
  });
};

UserController.postUserChangePassword = (req, res) => {
  let oldPassword = req.body.oldPassword,
    newPassword = req.body.newPassword,
    confNewPassword = req.body.confNewPassword
    ;

  req.checkBody('oldPassword', req.i18n_texts.errors.user.EMPTY_PASSWORD).notEmpty();
  req.checkBody('newPassword', req.i18n_texts.errors.user.EMPTY_NEW_PASSWORD).notEmpty();
  req.checkBody('confNewPassword', req.i18n_texts.errors.user.EMPTY_CONF_PASSWORD).notEmpty();
  req.checkBody('newPassword', req.i18n_texts.errors.user.PASSWORDS_NOT_MATCHES).equals(confNewPassword);

  let errors = req.validationErrors();

  if (errors) {
    return res.status(200).json({errors});
  }

  User.getAuthInfo(req.user.identifier, (user) => {
    if (!user) return res.status(200).json({res: 'Error', message: 'user not exists.'});

    let hash = null;
    if (user.password === hash) {
      User.updatePassword(req.user.identifier, newPassword, (result) => {
        return res.status(200).json({res: 'OK'});
      });
    }
    else {
      return res.status(200).json({message: req.i18n_texts.errors.user.INVALID_PASSWORD});
    }
  });
};

UserController.postUserChangeMail = (req, res) => {
  let oldEmail = req.body.oldEmail,
    newEmail = req.body.newEmail,
    confNewEmail = req.body.confNewEmail
    ;

  req.checkBody('oldEmail', req.i18n_texts.errors.user.EMPTY_MAIL).notEmpty();
  req.checkBody('newEmail', req.i18n_texts.errors.user.EMPTY_NEW_MAIL).notEmpty();
  req.checkBody('newEmail', req.i18n_texts.errors.user.INVALID_MAIL).isEmail();
  req.checkBody('confNewEmail', req.i18n_texts.errors.user.EMPTY_CONF_MAIL).notEmpty();
  req.checkBody('newEmail', req.i18n_texts.errors.user.MAIL_NOT_MATCHES).equals(confNewEmail);

  let errors = req.validationErrors();

  if (errors) {
    return res.status(200).json({errors});
  }

  User.getUserAccountInfo(req.user.identifier, (user) => {
    if (user && user.mail === oldEmail) {
      User.updateEmail(req.user.identifier, newEmail, (result) => {
        if (result) {
          return res.status(200).json({res: 'OK'});
        } else {
          return res.status(200).json({message: req.i18n_texts.errors.user.MAIL_ALREADY_USED});
        }
      });
    } else {
      return res.status(200).json({message: req.i18n_texts.errors.user.BAD_OLD_EMAIL});
    }
  })
};

UserController.getValidateAccount = (req, res) => {
  User.validateAccount(req.params.key, result => {
    if (!result) res.redirect('/home');
    else res.redirect('/user/account/validated')
  });
};

UserController.getAcccountValidated = (req, res) => {
  res.render('users/validated');
};

module.exports = UserController;