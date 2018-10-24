const conf = require('dotenv').config().parsed;
const User = require('../models/user');
const Config = require('../config/main');
const bcrypt = require('bcryptjs');
const Socket = require('../routes/socket');
const CryptoJS = require('crypto-js');

const ApiController = {};

ApiController.authenticate = (req, res) => {
  if (req.body.email && req.body.password) {
    User.findOne({email: req.body.email}, (err, user) => {
      if(err) throw err;
      if(!user) {
        res.status(401).json({ success: false, message: 'Authentication failed. User not found.' });
      } else {
        if(bcrypt.compareSync(req.body.password, user.password)) {
          let token = jwt.sign(user.toObject(), conf.SECRET, {
            expiresIn: 60 * 60 * 24
          });
          res.status(200).json({ success: true, token: 'JWT ' + token });
        } else {
          res.status(401).json({ success: false, message: 'Authentication failed. User not found.' });
        }
      }
    });
  }
};

module.exports = ApiController;