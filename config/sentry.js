const Env = require('./env');
const packageJson = require('../package');
const Sentry = require('@sentry/node');

if (!Env.isTest && !Env.isStaging) {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      release: `${packageJson.name}@${packageJson.version}`,
      attachStacktrace: true,
      environment: Env.current
    });
  }
}

module.exports = Sentry;