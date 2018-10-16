const mysql = require('./../bin/mysql');
const sha1 = require('sha1');
const md5 = require('md5');
const bcrypt = require('bcryptjs');

const config = require('../config/main');

const Screen = {};

Screen.saveBlobScreen = async (screen, cb) => {
  mysql.insert({
    into: 'screens',
    data: {
      savedAsImg: false,
      base64: null,
      blobData: screen.blobData,
      shareKey: 'test'
    }
  }).then(result => cb(result, null))
    .catch(error => {
      if (error.code === 'ER_DUP_ENTRY')
      { return cb(null, null, error) }
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