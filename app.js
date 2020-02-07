const Env = require('./config/env');
const { ErrorHandler, Express } = require('./middlewares');
const express = require('express');
const path = require('path');
const logger = require('morgan');

const app = express();

app.set('env', Env.current);
app.set('trust proxy', true);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', Express.exphbs);
app.use(logger('dev'));

// ------ Express
app.use(Express.cors);
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ extended: true, limit: '150mb' }));
app.use(Express.cookieParser);
app.use(Express.compress);
app.use(Express.methodOverride);
app.use(Express.helmet);
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(Express.csurf);
app.use(Express.session);
app.use(Express.i18n);
app.use(Express.passportInit);
app.use(Express.passportSession);
app.use(Express.flash);
app.use(Express.setLocals);

// mount all routes on / path
app.use('/', require('./routes/index'));

app.use(ErrorHandler.notFoundError);
if (!Env.isTest && !Env.isStaging) app.use(Express.sentryErrorHandler);
app.use(ErrorHandler.converter);
app.use(ErrorHandler.client);
app.use(ErrorHandler.log);
app.use(ErrorHandler.api);

module.exports = app;
