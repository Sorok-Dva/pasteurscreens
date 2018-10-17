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
      uploadBy: screen.user ? screen.user.id : -1,
      private: !!screen.user,
      uploadAt: new Date(),
      savedAsImg: true,
      base64: null,
      path: screen.path.replace('public/', ''),
      shareKey: key
    }
  }).then(result => cb({key, private: !!screen.user}))
    .catch (error => {
      console.log(error);
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

Screen.getMyCaptures = (userId, callback) => {
  mysql.select({
    select: '*',
    from: 'screens',
    where: `\`uploadBy\` = '${userId}'`
  }).then(screens => callback(null, screens || null))
    .catch(error => callback(error, null));
};

Screen.increaseViews = (key, views, callback) => {
  mysql.update({
    update: 'screens',
    where: `\`shareKey\` = '${key}'`,
    data: { views: views + 1 }
  }).then(result => callback(result || null))
    .catch(error => callback(null));
};

module.exports = Screen;