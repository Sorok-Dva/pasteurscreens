const Env = require('../config/env');

class ExtendableError extends Error {
  constructor (message, status, { isPublic, stack, code } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    this.code = code;
    this.isPublic = isPublic;
    this.isOperational = true; // This is required since bluebird 4 doesn't append it anymore.
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor.name);
    }
  }
}

class BackError extends ExtendableError {
  constructor (message, status, { isPublic = false, stack = null, code = null, extraContextForSentry = null } = {}) {
    super(message, status, { isPublic, stack, code, extraContextForSentry });
  }

  toJSON () {
    const obj = {
      message: this.message,
      status: this.status
    };
    if (this.status < 500) {
      obj.name = this.name;
    }
    if (Env.current !== 'production' && 'staging') {
      obj.stack = this.stack;
    }
    return obj;
  }
}

module.exports = {
  BackError
};