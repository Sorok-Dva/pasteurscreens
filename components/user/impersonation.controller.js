const __ = process.cwd();
const _ = require('lodash');
const { BackError } = require(`${__}/helpers/back.error`);
const Models = require(`${__}/orm/models/index`);

const Users_Impersonation = {};

Users_Impersonation.GetList = (req, res, next) => {
  Models.User.findAll({ attributes: ['id', 'email'], order: ['id'] }).then(users => {
    return res.send(users);
  }).catch(error => next(new BackError(error)));
};

Users_Impersonation.User = (req, res, next) => {
  Models.User.findOne({
    where: { id: req.params.id },
    attributes: { exclude: ['password'] }
  }).then(user => {
    if (_.isNil(user)) return res.status(400).send('Utilisateur introuvable.');
    const originalUser = req.user.id;
    const originalRole = req.user.role;
    req.logIn(user, (err) => !_.isNil(err) ? next(new BackError(err)) : null);
    req.session.originalUser = originalUser;
    req.session.role = originalRole;
    res.cookie('originalUser', originalUser, { maxAge: 900000, httpOnly: true });
    return res.send({ status: 'OK' });
  });
};

Users_Impersonation.Remove = (req, res, next) => {
  Models.User.findOne({
    where: { id: req.session.originalUser },
    attributes: { exclude: ['password'] }
  }).then(user => {
    if (_.isNil(user)) return res.status(400).send('Utilisateur introuvable.');
    delete req.session.originalUser;
    delete req.session.role;
    req.logIn(user, (err) => !_.isNil(err) ? next(new BackError(err)) : null);
    res.clearCookie('originalUser');
    return res.send({ status: 'OK' });
  });
};

Users_Impersonation.removeImpersonationBeforeNewIfExists = (req, res, next) => {
  if (req.session.originalUser) {
    Models.User.findOne({
      where: { id: req.session.originalUser },
      attributes: { exclude: ['password'] }
    }).then(user => {
      if (_.isNil(user)) return res.status(400).send('Utilisateur introuvable.');
      delete req.session.originalUser;
      delete req.session.role;
      req.logIn(user, (err) => !_.isNil(err) ? next(new BackError(err)) : null);
      res.clearCookie('originalUser');
      return next();
    });
  } else return next();
};

module.exports = Users_Impersonation;