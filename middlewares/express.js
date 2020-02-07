const _ = require('lodash');
const path = require('path');
const conf = require('dotenv').config().parsed;
const Env = require('../config/env');
const Sentry = require('../config/sentry');
const config = require('../orm/config/config.js')[Env.current];
const csurf = require('csurf');
const session = require('express-session');
const exphbs = require('express-handlebars');
const MySQLStore = require('express-mysql-session')(session);
const methodOverride = require('method-override');
const compress = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const passport = require('passport');
const helmet = require('helmet');
const logger = require('morgan');
const handlebars = require('../helpers/handlebars').register(require('handlebars'));
const i18n = require('i18n-express');

const sessionStore = new MySQLStore({
  host: config.host,
  user: config.username,
  password: config.password,
  database: config.database
});

module.exports = {
  compress: compress({
    filter: (req, res) => {
      return (/json|text|javascript|css|image\/svg\+xml|application\/x-font-ttf/).test(res.getHeader('Content-Type'));
    },
    level: 9
  }),
  cookieParser: cookieParser(),
  csurf: csurf({ cookie: true }),
  cors: cors({
    origin: 'http://localhost:8080',
    credentials: true
  }),
  exphbs: exphbs({
    extname: 'hbs',
    defaultLayout: 'default',
    layoutsDir: path.join(__dirname, '../views/layouts'),
    partialsDir: path.join(__dirname, '../views/partials')
  }),
  flash: flash(),
  helmet: helmet(), // secure apps by setting various HTTP headers
  i18n: i18n({
    translationsPath: path.join(__dirname, '../i18n'),
    cookieLangName: 'pus_lang',
    browserEnable: true,
    defaultLang: 'fr',
    siteLangs: ['fr', 'en'],
    textsVarName: 'tr'
  }),
  loggerDev: logger('dev'),
  methodOverride: methodOverride(),
  passportInit: passport.initialize(),
  passportSession: passport.session(),
  passportAuthentication: passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }),
  readOnlySessionForImpersonation: (req, res, next) => {
    if (req.session && req.session.originalUser) {
      const isBORoute = req.url.split('back-office').length - 1 !== 0;
      if (req.session.readOnly && !isBORoute && req.method !== 'GET') {
        return res.status(403).json('Operation not allowed, session is in read only mode.')
      }
      next();
    } else next();
  },
  sentryErrorHandler: Sentry.Handlers.errorHandler(),
  sentryRequestHandler: Sentry.Handlers.requestHandler(),
  sentryUnhandledRejection: (reason) => Sentry.captureMessage(reason),
  setLocals: (req, res, next) => {
    if (req.url.search('static') !== -1) return next();
    if (req.get('host') === 'purs.tk' && !req.originalUrl.includes('/-'))
    { return res.redirect(`https://pasteurscreens.tk${req.originalUrl}`); }
    res.locals.readOnly = req.session.readOnly ? 'lock' : 'unlock';
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    res.locals.session = req.session || null;
    res.locals.csrfToken = req.csrfToken();
    res.locals.usingPurs = !!(req.get('host') === 'purs.tk');
    if (!Env.isTest && !Env.isStaging && !_.isNil(req.user)) {
      Sentry.configureScope((scope) => {
        scope.setUser(req.user);
      });
    }

    next();
  },
  session: session({
    secret: conf.SECRET,
    saveUninitialized: true,
    store: sessionStore,
    resave: true
  })
};