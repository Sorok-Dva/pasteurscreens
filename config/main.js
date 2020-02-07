const chalk = require('chalk');

const killServer = () => {
  const e = 'Server killed, please resolve error and restart it.';
  console.log('%s %s', chalk.keyword('orange')('[WARN]'), chalk.hex('#000').bgKeyword('red')(e));
  process.exit();
};

module.exports = {
  roles: ['SuperAdmin', 'Admin'],
  __d: e => console.log('%s %s', chalk.yellow('[DEBUG]'), chalk.hex('#000').bgYellow(e)),
  __i: e => console.log('%s %s', chalk.green('[INFO]'), chalk.hex('#000').bgGreen(e)),
  __l: e => console.log('%s %s', chalk.cyan('[MySQL LOGGER]'), chalk.cyan(e)),
  __w: e => console.log('%s %s', chalk.keyword('orange')('[WARN]'), chalk.hex('#141414').bgKeyword('orange')(e)),
  __e: (e, kill) => {
    console.log('%s %s', chalk.red('[ERROR]'), chalk.hex('#000').bgRed(e));
    if (kill) killServer();
  }
};