const paypal = require('../bin/paypal');
const stripe = require('../bin/stripe');

const User = require('../models/user');
const Screen = require('../models/screen');

const config = require('./../config/main');
const crypto = require('crypto');
const mailer = require('./../bin/mailer');
const fs = require('fs');
const IndexController = {};

IndexController.getIndex = (req, res) => {
  res.render('index');
};

IndexController.getRestore = (req, res) => {
    return res.render('index');
};

IndexController.getRegister = (req, res) => {
    return res.render('register');
};

IndexController.getLogin = (req, res) => {
    return res.render('login');
};

IndexController.changeLang = (req, res) => {
    res.cookie('anw_lang', req.params.lang, { maxAge: 900000, httpOnly: false });
    res.redirect('/');
};

IndexController.postSaveScreen = (req, res) => {
  try {
    // Decoding base-64 image
    // Source: http://stackoverflow.com/questions/20267939/nodejs-write-base64-image-file
    let decodeBase64Image = (dataString) => {
      let matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let response = {};

      if (matches.length !== 3)
        return res.status(200).json({state: 'Invalid input string'});

      response.type = matches[1];
      response.data = new Buffer(matches[2], 'base64');

      return response;
    };

    // Regular expression for image type:
    let imageTypeRegularExpression = /\/(.*?)$/;

    // Generate random string
    let seed = crypto.randomBytes(20);
    let uniqueSHA1String = crypto.createHash('sha1').update(seed).digest('hex');

    let imageBuffer = decodeBase64Image(req.body.base64);
    let userUploadedFeedMessagesLocation = 'public/assets/images/upload/';

    let uniqueRandomImageName = 'img-' + uniqueSHA1String;
    // This letiable is actually an array which has 5 values,
    // The [1] value is the real image extension
    let imageTypeDetected = imageBuffer.type
      .match(imageTypeRegularExpression);

    let userUploadedImagePath = userUploadedFeedMessagesLocation + uniqueRandomImageName + '.' + imageTypeDetected[1];

    // Save decoded binary image to disk
    try {
      fs.writeFile(userUploadedImagePath, imageBuffer.data, {encoding: 'base64'},
        err => {
          Screen.saveScreen({
            user: req.user,
            path: userUploadedImagePath
          }, result => {
            return res.status(200).json({state: 'saved', key: result});
          });
        });
    } catch (error) {
      return res.status(200).json({error});
    }
  } catch (error) {
    return res.status(200).json({error});
  }
};

IndexController.getScreen = (req, res) => {
  Screen.getScreenshot(req.params.key, result => {
    let viewScreenShot = () => {
      Screen.increaseViews(req.params.key, result.views, callback => {
        res.render('screen', {src: result.path.replace('public', '')});
      });
    };

    if (result === null) return res.redirect('/');
    if (result.private === 1) {
      if (req.user && req.user.id === result.uploadBy) {
        return viewScreenShot();
      } else {
        return res.redirect('/')
      }
    } else {
      return viewScreenShot();
    }
  });
};

IndexController.getHome = (req, res) => {
    return res.render('index', {layout: 'landing'});
};

IndexController.postRegister = (req, res) => {
    let email = req.body.email,
        password = req.body.password,
        repeatPass = req.body.passwordRepeat,
        ip = req.ip
    ;

    /*    req.checkBody('email', req.i18n_texts.register.error.EMPTY_MAIL).notEmpty();
        req.checkBody('email', req.i18n_texts.register.error.INVALID_MAIL).isEmail();
        req.checkBody('email', req.i18n_texts.register.error.MAIL_NOT_MATCHES).equals(repeatEmail);
        req.checkBody('password', req.i18n_texts.register.error.EMPTY_PASSWORD).notEmpty();
        req.checkBody('password', req.i18n_texts.register.error.PASSWORDS_NOT_MATCHES).equals(repeatPass);*/
    /*

        let errors = req.validationErrors();
    */

    /*if (errors) {
        return res.status(200).json({errors});
    } else {*/
    User.createUser({email, password, ip}, (result, key, err) => {
        if (!err && result) {
            res.redirect('login');
        }
    })
    // }
};

IndexController.postLogin = (req, res) => {
    res.redirect('/');
};

IndexController.getLogout = (req, res) => {
    req.logout();
    res.redirect('/');
};

IndexController.postForgot = (req, res) => {
    crypto.randomBytes(20, (err, buf) => {
        if (err) console.log(err);
        let token = buf.toString('hex');
        User.findOne({ email: req.body.email }, (err, user) => {
            if (err) console.log(err);
            if (!user) {
                req.flash('error_msg', 'No account with that email address exists.');
                return res.redirect('/forgot');
            }

            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            user.save((err) => {
                if (err) console.log(err);
                let text = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'https://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n';

                mailer(user.email, 'pus@no-reply.fr', 'Password Reset', text, (error, info) => {
                    console.log('http://' + req.headers.host + '/reset/' + token);
                    if (!error)
                    { req.flash('success_msg', 'An e-mail has been sent to ' + user.email + ' with further instructions.'); }
                    else
                    { req.flash('error_msg', 'An error occurred while sending you an email. Please retry.'); }

                    res.redirect('/?info=reset-password');
                });
            });
        });
    });
};

IndexController.getResetPassword = (req, res) => {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
        if (err) console.log(err);
        if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('users/reset');
    });
};

IndexController.postResetPassword = (req, res, next) => {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
        if (err) console.log(err);
        if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
        }

        user.password = req.body.password;

        User.resetPassword(user, () => {
            req.logIn(user, (err) => {
                if (!err) {
                    let text = 'Hello,\n\n' +
                        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n';
                    mailer(user.email, 'pus@no-reply.fr', 'Your password has been changed', text);
                    req.flash('success_msg', 'Your password has been successfully reset.');
                    res.redirect('/');
                }
            });
        })
    });
};

module.exports = IndexController;
