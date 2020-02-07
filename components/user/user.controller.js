const __ = process.cwd();
const { validationResult } = require('express-validator');
const { BackError } = require(`${__}/helpers/back.error`);
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const httpStatus = require('http-status');
// const Mailer = require(`${__}/components/mailer`);
const Models = require(`${__}/orm/models/index`);

const User = {};

User.create = (req, res, next) => {
  const errors = validationResult(req);
  const { email, password } = req.body;

  if (!errors.isEmpty()) {
    return res.status(httpStatus.BAD_REQUEST).send({ body: req.body, errors: errors.array() });
  }

  bcrypt.hash(password, 10).then(hash => {
    Models.User.create({
      email,
      password: hash,
      role: 'User',
      key: crypto.randomBytes(20).toString('hex')
    }).then(user => {
      // Mailer.Main.sendUserVerificationEmail(user, req.headers.host);
      return res.status(201).send({ created: true });
    }).catch(error => {
      res.status(200).send({ body: req.body, sequelizeError: error });
    });
  });
};

User.Delete = (req, res, next) => {
  Models.User.findOne({
    where: { id: req.user.id },
    attributes: ['id', 'password']
  }).then(user => {
    if (_.isNil(user)) {
      return res.status(404).send('Utilisateur inconnu.');
    }
    User.comparePassword(req.body.password, user.dataValues.password, (err, isMatch) => {
      if (err) return res.status(200).json({ error: err });
      if (isMatch) {
        user.destroy().then(() => {
          req.logout();
          req.session.destroy();
          return res.status(201).send({ deleted: true });
        }).catch(error => next(new BackError(error)))
      } else {
        return res.status(403).send('Mot de passe invalide.');
      }
    });
  });
};

User.Update = (req, res, next) => {
  const where = { id: req.user.id };
  Models.User.findOne({ where }).then(user => {
    if (_.isNil(user)) return res.status(404).send('Utilisateur inconnu.');
    const { email, opts } = req.body;
    Models.User.update({ email, opts }, { where }).then((updatedUser) => {
      return res.status(200).send({ status: 'updated', updatedUser })
    }).catch(error => next(new BackError(error)));
  });
};

User.Get = (req, res, next) => {
  const where = { id: req.user.id };
  const attributes = { exclude: ['password'] };
  Models.User.findOne({ where, attributes }).then(user => {
    if (_.isNil(user)) return res.status(404).send('Utilisateur inconnu.');
    return res.render('users/profile', { user });
  }).catch(error => next(new BackError(error)));
};

User.ValidateAccount = (req, res, next) => {
  if (req.params.key) {
    Models.User.findOne({
      where: { key: req.params.key, validated: false }
    }).then(user => {
      if (_.isNil(user)) {
        return next(new BackError('Clé de validation invalide ou compte déjà validé.', 403));
      }
      user.key = crypto.randomBytes(20).toString('hex');
      user.validated = true;
      user.save().then(result => {
        req.logIn(user, (err) => !_.isNil(err) ? next(new BackError(err)) : null);
        res.status(200).send({ status: 'validated', success_msg: 'Compte validé avec succès. Vous êtes maintenant connecté.' });
      })
    });
  } else return res.status(404).send({ status: 'KEY_NOT_FOUND', error_msg: 'Clé de validation invalide.' });
};

User.sendResetPassword = (req, res, next) => {
  Models.User.findOne({
    where: { email: req.body.email },
    attributes: ['id', 'email', 'key']
  }).then(user => {
    if (!_.isNil(user)) {
      if (_.isNil(user.key)) {
        user.key = crypto.randomBytes(20).toString('hex');
        user.save();
      }
      // Mailer.Main.sendUserResetPasswordLink(user, req.headers.host);
      return res.send({ status: 'EMAIL_SENT' })
    } else return res.status(404).send({ status: 'USER_NOT_FOUND', error_msg: 'Utilisateur introuvable.' });
  }).catch(error => next(new BackError(error)));
};

User.resetPassword = (req, res, next) => {
  const errors = validationResult(req);
  const { password } = req.body;
  const { key } = req.params;

  if (!errors.isEmpty()) return res.status(400).send({ body: req.body, errors: errors.array() });

  Models.User.findOne({
    where: { key },
    attributes: ['id', 'password', 'key']
  }).then(user => {
    if (!user) return res.status(404).send({ status: 'USER_NOT_FOUND', error_msg: 'Utilisateur introuvable.' });

    bcrypt.hash(password, 10).then(hash => {
      user.password = hash;
      user.key = crypto.randomBytes(20).toString('hex');
      user.save();
      return res.send({ status: 'PASSWORD_UPDATED' });
    });
  }).catch(err => next(new BackError(err)));
};

/**
 * ComparePassword Method
 * @param candidatePassword
 * @param hash
 * @param callback
 * @returns callback
 * @description Compare two passwords hash to authenticate user.
 */
User.comparePassword = (candidatePassword, hash, callback) => {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    return callback(err, isMatch);
  });
};

User.changePassword = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).send({ body: req.body, errors: errors.array() });

  const oldpass = req.body.oldPassword;
  const newpass = req.body.newPassword;
  const newpasscheck = req.body.newPasswordVerification;

  Models.User.findOne({ where: { id: req.user.id } }).then(user => {
    User.comparePassword(oldpass, user.password, function (err, match) {
      if (match) {
        if (newpass === newpasscheck) {
          if (oldpass === newpass) return res.status(400).json({ error: 'new password cannot be your old password' });
          bcrypt.hash(newpass, 10).then(hash => {
            user.password = hash;
            user.save();
          });
          return res.status(201).json({ status: 'PASSWORD_UPDATED' });
        } else return res.status(403).json({ status: 'Mot de passe incorrect.' });
      } else return res.status(403).json({ status: 'Ancien mot de passe incorrect.' });
    });
  })
};

/**
 * [API] Verify Email Availability Method
 * @param req
 * @param res
 * @param next
 * @returns boolean
 * @description Check if email is already used by a user. Used by registration form.
 */
User.verifyEmailAvailability = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  Models.User.findOne({
    where: { email: req.body.email },
    attributes: ['id']
  }).then(user => {
    if (user) return res.status(400).json({ error: 'Email déjà utilisé.' });
    return next();
  });
};

User.SendMagicLinkLogin = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  Models.User.findOne({
    where: { email: req.body.email },
    attributes: ['id', 'email', 'role', 'validated', 'key']
  }).then(user => {
    if (!user) return next(new BackError('Utilisateur introuvable.', 403));
    // if (!user.validated) return next(new BackError('Compte non validé.', 403));
    user.key = crypto.randomBytes(20).toString('hex');
    user.save().then(() => {
      // Mailer.Main.sendUserMagicLinkLogin(user, req.headers.host);
      return res.send({ status: 'EMAIL_SENT' });
    }).catch(error => next(new BackError(error)));
  }).catch(error => next(new BackError(error)));
};

User.MagicLinkLogin = (req, res, next) => {
  if (_.isNil(req.params.key)) return res.status(404).send({ status: 'KEY_NOT_FOUND', error_msg: 'Clé de validation invalide.' });
  Models.User.findOne({
    where: { key: req.params.key },
    attributes: ['id', 'email', 'role', 'validated']
  }).then(user => {
    if (!user) return next(new BackError('Lien invalide.', 403));
    req.logIn(user, (err) => {
      if (err) return next(new BackError(err));
      user.last_login = new Date();
      user.key = crypto.randomBytes(20).toString('hex');
      user.save();
      return res.status(200).send({ status: 'logged', user });
    });
  }).catch(error => next(new BackError(error)));
};

module.exports = User;