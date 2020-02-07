module.exports = class Env {
  static get current () {
    return process.env.ENV
  }

  static get isTest () {
    return Env.current === 'test'
  }

  static get isLocal () {
    return Env.current === 'local'
  }

  static get isDev () {
    return Env.current === 'development'
  }

  static get isStaging () {
    return Env.current === 'staging'
  }

  static get isProd () {
    return Env.current === 'production'
  }
};