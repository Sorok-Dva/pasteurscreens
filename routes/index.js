const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

const IndexController = require('../controllers/index');

router.get('/', IndexController.getIndex);
router.get('/restore', User.ensureAuthenticated, IndexController.getRestore);
router.get('/lang/:lang', IndexController.changeLang);
router.get('/home', User.ensureAuthenticated, IndexController.getHome);
router.get('/register', User.ensureNotAuthenticated, IndexController.getRegister);
router.post('/register', User.ensureNotAuthenticated, IndexController.postRegister);
router.get('/login', User.ensureNotAuthenticated, IndexController.getLogin);
router.post('/login', User.ensureNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/home', failureRedirect: '/?error=login', failureFlash: true
}), IndexController.postLogin);
router.get('/logout', User.ensureAuthenticated, IndexController.getLogout);
router.post('/forgot', User.ensureNotAuthenticated, IndexController.postForgot);
router.get('/reset/:token', User.ensureNotAuthenticated, IndexController.getResetPassword);
router.post('/reset/:token', User.ensureNotAuthenticated, IndexController.postResetPassword);
router.post('/screens/save', IndexController.postSaveScreen);
passport.use(new LocalStrategy((nickname, password, done) => {
    User.getUser(nickname, user => {
        if (!user) return done(null, false, {message: 'Unknown User'});
        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, {message: 'Invalid password'});
            }
        });
    });
}));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => User.getUserById(id, (err, user) => done(err, user)));

module.exports = router;
