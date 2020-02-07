const _ = require('lodash');
const httpsStatus = require('http-status');
const { BackError } = require('../helpers/back.error');
const Authentication = {};

/**
 * ensureIsNotAuthenticated MiddleWare
 * @param req
 * @param res
 * @param next
 * @returns {*}
 * @description Ensure that the current user is logged-out
 */
Authentication.ensureIsNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  } else {
    req.flash('error_msg', req.i18n_texts.flash.error.ALREADY_LOGGED);
    res.redirect('/');
  }
};

/**
 * ensureAuthenticated MiddleWare
 * @param req
 * @param res
 * @param next
 * @returns {*}
 * @description Ensure that the current user is logged-in
 */
Authentication.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('error_msg', req.i18n_texts.flash.error.NOT_CONNECTED);
    res.redirect('/');
  }
};

/**
 * ensureIsAdmin MiddleWare
 * @param req
 * @param res
 * @param next
 * @returns {*}
 * @description Ensure that the current user is an admin
 */
Authentication.ensureIsAdmin = (req, res, next) => {
  if (req.isAuthenticated() && !_.isNil(req.user)) {
    if (['Admin'].includes(req.user.role) || ['Admin'].includes(req.session.role)) {
      next();
    } else {
      return next(new BackError(req.i18n_texts.flash.error.FORBIDDEN, httpsStatus.FORBIDDEN));
    }
  } else {
    req.logout();
    req.session.destroy();
    return next(new BackError(req.i18n_texts.flash.error.MUT_BE_CONNECTED, httpsStatus.UNAUTHORIZED));
  }
};

module.exports = Authentication;