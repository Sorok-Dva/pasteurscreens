const express = require('express');
const session = require('express-session');
const compress = require('compression');
const MySQLStore = require('express-mysql-session')(session);
const expressValidator = require('express-validator');
const exphbs = require('express-handlebars');
const fileUpload = require('express-fileupload');
const path = require('path');
const chalk = require('chalk');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const handlebars = require('./helpers/index').register(require('handlebars'));
const flash = require('connect-flash');
const passport = require('passport');
const helmet = require('helmet');
const i18n = require('i18n-express');
const conf = require('dotenv').config().parsed;
const app = require('express')();
// ------
const mysql = require('./bin/mysql');
const config = require('./config/main');

app.use(require('helmet')());
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({extended: false, limit: '150mb'}));
app.use(bodyParser.json({limit: '150mb'}));
app.use('/static', express.static(path.join(__dirname, 'public/assets')));
app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'hbs');

// -- MYSQL DATABASE =================================
mysql.connect(err => {
  if (err) {
    console.log('%s An error has occured while connecting to Mysql database.', chalk.red('x'));
  } else {
    console.log('%s Mysql server is connected to the application. (host: %s)', chalk.green('✓'), conf.MYSQL_DATABASE_URL);
  }
});
// -- Express Session configuration
let sessionStore = new MySQLStore({
  host: conf.MYSQL_DATABASE_URL,
  user: conf.MYSQL_DATABASE_USER,
  password: conf.MYSQL_DATABASE_PASS,
  database: conf.MYSQL_DATABASE_NAME
});
// -- Express Config
app.engine('hbs', exphbs({
  extname         :'hbs',
  defaultLayout   : 'default',
  layoutsDir      : path.join(__dirname, '/public/views/layouts'),
  partialsDir     : path.join(__dirname, '/public/views/partials')
}));
app.use(cookieParser());
app.use(session({
  secret: conf.SECRET,
  saveUninitialized: true,
  store: sessionStore,
  resave: true
}));

app.use(i18n({
  translationsPath: path.join(__dirname, 'i18n'),
  cookieLangName: 'pus_lang',
  browserEnable: true,
  defaultLang: 'fr',
  siteLangs: ['fr', 'en'],
  textsVarName: 'tr'
}));
app.use(helmet());
app.use(fileUpload());

app.use(express.static(path.join(__dirname, 'public')));
app.use(compress({
  filter: function (req, res) {
    return (/json|text|javascript|css|image\/svg\+xml|application\/x-font-ttf/).test(res.getHeader('Content-Type'));
  },
  level: 9
}));

app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    let namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// -- Global Vars
app.use((req, res, next) => {
  if (req.get('host') === 'purs.tk' && !req.originalUrl.includes('/-'))
  { return res.redirect(`https://pasteurscreens.tk${req.originalUrl}`); }
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  res.locals.session = req.user || null;
  res.locals.usingPurs = !!(req.get('host') === 'purs.tk');
  res.locals.admin = !!(req.user && config.roles.includes(req.user.role));
  next();
});
app.set('env', conf.ENV);
app.set('trust proxy', true);

if (app.get('env') === 'development') {
  config.__i('Application in DEVELOPMENT mode.');
  process.on('unhandledRejection', (reason, p) => {
    console.log(`Unhandled Rejection detected at: Promise`, p, reason);
  });

  process.on('uncaughtException', err => {
    let stack = err.stack;
    config.__e(`Uncaught Exception detected ${stack.substring(0, stack.indexOf(')') + 1)}`, true);
  });

  process.on('exit', code => {
    config.__e(`About to exit with code: ${code}`, true);
  });

  process.on('error', (e, p) => {
    config.__e('blabla process error');
    console.log(e, p);
    // application specific logging, throwing an error, or other logic here
  });
} else {
  config.__i('Application in PRODUCTION mode.');
}

// ------ ROUTES
app.use('/', require('./routes/index'));
app.use('/user', require('./routes/user'));

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;