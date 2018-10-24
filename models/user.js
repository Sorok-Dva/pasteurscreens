const mysql = require('./../bin/mysql');
const sha1 = require('sha1');
const md5 = require('md5');
const bcrypt = require('bcryptjs');

const config = require('../config/main');

const User = {};

User.ensureNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  } else {
    req.flash('error_msg', 'You are already logged in');
    res.redirect('/');
  }
};

User.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('error_msg', 'You are not logged');
    res.redirect('/');
  }
};

User.ensureIsAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (config.roles.includes(req.user.role)) {
      next();
    } else {
      req.flash('error_msg', 'You\'re not allowed to access this content. This incident will be reported.');
      res.redirect('/');
    }
  } else {
    req.flash('error_msg', 'You are not logged');
    res.redirect('/');
  }
};

User.createUser = async (user, cb) => {
  user.key = sha1(md5(user.ip) + md5(user.email));

  bcrypt.genSalt(10).then(salt => {
    bcrypt.hash(user.password, salt).then(hash => {
      mysql.insert({
        into: 'users',
        data: {
          email: user.email,
          password: hash,
          registerIp: user.ip,
          key: user.key
        }
      }).then(result => cb(result, user.key, null))
        .catch(error => {
          if (error.code === 'ER_DUP_ENTRY')
          { return cb(null, null, error) }
        });
    });
  });
};

User.comparePassword = (candidatePassword, hash, callback) => {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) throw err;
    callback(null, isMatch);
  });
};

User.validateAccount = async (key, callback) => {
  mysql.select({
    select: '*',
    from: 'users',
    where: `\`key\` = '${key}'`
  }).then(key => {
    if (key) {
      mysql.update({
        update: 'users',
        where: `\`key\` = '${key}'`,
        data: { validated: true }
      }).then(result => callback(result)).catch(error => callback(error));
    } else {
      return callback(null);
    }
  }).catch(error => {
    throw new Error(error);
  });
};
User.updatePassword = (email, password, callback) => {
  mysql.update({
    update: 'users',
    where: `\`email\` = '${email}`,
    data: { password }
  }).then(result => callback(result)).catch(error => callback(error));
};

User.updateEmail = (oldMail, email, callback) => {
  mysql.update({
    update: 'users',
    where: `\`email\` = '${oldMail}'`,
    data: { email }
  }).then(result => callback(result)).catch(error => callback(error));
};

User.getUser = (email, callback) => {
  mysql.select({
    select: '*',
    from: 'users',
    where: `\`email\` = '${email}'`
  }).then(user => callback(user[0] || null))
    .catch(error => {
      throw new Error(error)
    });
};

User.getUserById = (id, callback) => {
  mysql.select({
    select: '*',
    from: 'users',
    where: `\`id\` = '${id}'`
  }).then(user => callback(null, user[0] || null))
    .catch(error => callback(error, null));
};

module.exports = User;