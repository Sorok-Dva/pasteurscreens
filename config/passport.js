const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const Models = require('../orm/models');
const UserComponent = require('../components/user');

passport.use(new LocalStrategy({ passReqToCallback: true }, (req, email, password, done) => {
  Models.User.findOne({
    where: { email },
    attributes: ['id', 'password', 'email', 'role', 'validated']
  }).then(user => {
    if (!user) return done(null, false, req.flash('error_msg', req.i18n_texts.flash.error.UNKNOWN_USER));
    // if (!user.validated) return done(null, false, req.flash('error_msg', req.i18n_texts.flash.error.ACCOUNT_NOT_VALIDATED));
    UserComponent.Main.comparePassword(password, user.dataValues.password, (err, isMatch) => {
      if (err) return done(null, false, { error: err });
      if (isMatch) {
        const session = {
          id: user.dataValues.id,
          email: user.dataValues.email,
          role: user.dataValues.role,
          opts: user.opts
        };
        user.last_login = new Date();
        user.save();
        return done(null, session);
      } else {
        return done(null, false, req.flash('error_msg', req.i18n_texts.flash.error.WRONG_PASSWORD));
      }
    })
  }).catch(err => {
    console.log(err);
  });
}));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
  Models.User.findOne({ attributes: ['id', 'email', 'role', 'opts'], where: { id } }).then(user => {
    if (!user) return done('Utilisateur inconnu.', false);
    const session = {
      id: user.dataValues.id,
      email: user.dataValues.email,
      role: user.dataValues.role,
      opts: user.opts
    };
    user.updatedAt = new Date();
    user.save();
    done(null, session);
  });
});

module.exports = passport;
