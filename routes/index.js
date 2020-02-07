const { Authentication, Express, HTTPValidation } = require('../middlewares');
const { Gallery, Render, User } = require('../components');
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
require('../config/passport');

/* const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min window
  max: 15, // start blocking after 3 requests
  handler: (req, res, next) => {
    return res.status(403).send({ error: 'Trop de tentatives de connexion, veuillez réessayer dans quelques minutes.' });
  },
  keyGenerator: function (req /!*, res*!/) {
    return req.body.username;
  },
}); */

router.get('/', Render.Index);

router.get('/gallery',
  Authentication.ensureAuthenticated,
  Gallery.GetScreens
);

router.get(
  '/register',
  Authentication.ensureIsNotAuthenticated,
  Render.Register
).post('/register/',
  Authentication.ensureIsNotAuthenticated,
  HTTPValidation.UserController.create,
  User.Main.verifyEmailAvailability,
  User.Main.create);

/**
 * @Route('/login') POST;
 * Send Login Form
 */
router.get('/login',
  Authentication.ensureIsNotAuthenticated,
  Render.Login
).post('/login',
  // Authentication.ensureIsNotAuthenticated,
  // HTTPValidation.IndexController.login,
  // loginLimiter,
  Express.passportAuthentication,
  Render.Index
).post('/login/magic-link',
  Authentication.ensureIsNotAuthenticated,
  // HTTPValidation.UserController.ApiVerifyEmailAvailability,
  User.Main.SendMagicLinkLogin
).post('/login/magic-link/:key',
  Authentication.ensureIsNotAuthenticated,
  User.Main.MagicLinkLogin);

router.get('/logout',
  Authentication.ensureAuthenticated,
  Render.Logout);

router.get('/-:key', Gallery.getScreen);
router.post('/screens/save', Gallery.saveScreen);
router.post('/screens/delete/:key', Gallery.deleteScreen);
router.post('/screens/set/:privacy/:key', Gallery.SetScreenPrivacy);

/* router.post('/forgot', User.ensureNotAuthenticated, IndexController.postForgot);

router.get('/restore', User.ensureAuthenticated, IndexController.getRestore);

router.get('/reset/:token', User.ensureNotAuthenticated, IndexController.getResetPassword)
  .post('/reset/:token', User.ensureNotAuthenticated, IndexController.postResetPassword);

 */

module.exports = router;
