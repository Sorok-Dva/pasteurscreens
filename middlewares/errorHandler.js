const httpStatus = require('http-status');
const Sentry = require('../config/sentry');
const { BackError } = require('../helpers/back.error');
const Env = require('../config/env');

const debug = require('debug')('error'); // eslint-disable-line no-unused-vars

const getStatus = (err) => err.status;

const sendError = (req, res, status, err) => {
  if (res.headersSent) return;
  err.status = status;
  if (Env.current === 'production' || Env.current === 'pre-prod') {
    delete err.stack;
    if (err.status === 500) err.sentry = Sentry.captureException(err);
  }
  if (req.xhr) return res.status(status).json(err);
  else return res.status(status).render('error', { error: err });
};

module.exports = {
  getStatus,
  client: (err, req, res, next) => {
    if (err.errorCode && err.name && err.message) {
      sendError(req, res, err.errorCode, { name: err.name, message: err.message });
    }
    next(err);
  },
  converter: (err, req, res, next) => {
    if (!(err instanceof BackError)) {
      return next(new BackError(err.message, getStatus(err), err));
    }
    return next(err);
  },
  log: (err, req, res, next) => {
    debug(err);
    if ('errors' in err) {
      debug(err.errors);
    }
    if ('stack' in err) {
      debug(err.stack);
    }
    next(err);
  },
  notFoundError: (req, res, next) => res.render('error', { error: 'Page not found'}),
  api: (err, req, res, next) => { // eslint-disable-line no-unused-vars
    let status = err.status || err.statusCode || 500;
    if (status < 400) status = 500;

    if (err instanceof BackError && status >= 500) return sendError(req, res, status, err);

    const body = { status };

    // show the stacktrace when not in production
    if (Env.current !== 'production' && 'staging') {
      body.stack = err.stack;
    }
    // internal server errors
    if (status >= 500) {
      body.message = httpStatus[status];
      return sendError(req, res, status, body);
    }

    // client errors
    body.message = err.message;

    if (err.code) body.code = err.code;
    if (err.name) body.name = err.name;
    if (err.type) body.type = err.type;
    if (err.errors) body.errors = err.errors;

    return sendError(req, res, status, body);
  }
};