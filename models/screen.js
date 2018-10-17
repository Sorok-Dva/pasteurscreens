const mysql = require('./../bin/mysql');
const sha1 = require('sha1');
const md5 = require('md5');
const bcrypt = require('bcryptjs');
const shortid = require('shortid');
const config = require('../config/main');

const Screen = {};

Screen.saveScreen = async (screen, cb) => {
  let key = shortid.generate();
  mysql.insert({
    into: 'screens',
    data: {
      savedAsImg: true,
      base64: null,
      path: screen,
      shareKey: key
    }
  }).then(result => cb(key))
    .catch(error => {
      if (error.code === 'ER_DUP_ENTRY')
      { return cb(null) }
    });
};

Screen.getScreenshot = (key, callback) => {
    mysql.select({
        select: '*',
        from: 'screens',
        where: `\`shareKey\` = '${key}'`
    }).then(screen => callback(screen[0] || null))
        .catch(error => {
            throw new Error(error)
        });
};

Screen.getScreenshotById = (id, callback) => {
    mysql.select({
        select: '*',
        from: 'screens',
        where: `\`id\` = '${id}'`
    }).then(screen => callback(null, screen[0] || null))
        .catch(error => callback(error, null));
};

module.exports = Screen;