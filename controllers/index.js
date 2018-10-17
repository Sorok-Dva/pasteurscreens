const paypal = require('../bin/paypal');
const stripe = require('../bin/stripe');
const mysql = require('../bin/mysql');

const User = require('../models/user');
const Screen = require('../models/screen');

const config = require('./../config/main');
const request = require('request');
const mailer = require('./../bin/mailer');
const fs = require('fs');
const IndexController = {};

IndexController.getIndex = (req, res) => {
    if (req.user) {
        res.redirect('/home');
    } else {
        return res.render('index', {layout: 'landing'});
    }
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
  console.log(req.user);
    try
    {
        // Decoding base-64 image
        // Source: http://stackoverflow.com/questions/20267939/nodejs-write-base64-image-file
        let decodeBase64Image = (dataString) =>
        {
            var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            var response = {};

            if (matches.length !== 3)
            {
                return new Error('Invalid input string');
            }

            response.type = matches[1];
            response.data = new Buffer(matches[2], 'base64');

            return response;
        }

        // Regular expression for image type:
        // This regular image extracts the "jpeg" from "image/jpeg"
        var imageTypeRegularExpression      = /\/(.*?)$/;

        // Generate random string
        var crypto                          = require('crypto');
        var seed                            = crypto.randomBytes(20);
        var uniqueSHA1String                = crypto
            .createHash('sha1')
            .update(seed)
            .digest('hex');

        var imageBuffer                      = decodeBase64Image(req.body.base64);
        var userUploadedFeedMessagesLocation = 'public/assets/images/upload/';

        var uniqueRandomImageName            = 'img-' + uniqueSHA1String;
        // This variable is actually an array which has 5 values,
        // The [1] value is the real image extension
        var imageTypeDetected                = imageBuffer
            .type
            .match(imageTypeRegularExpression);

        var userUploadedImagePath            = userUploadedFeedMessagesLocation +
            uniqueRandomImageName +
            '.' +
            imageTypeDetected[1];

        // Save decoded binary image to disk
        try
        {
            require('fs').writeFile(userUploadedImagePath, imageBuffer.data, {encoding: 'base64'},
                function(err)
                {
                    console.log(err);
                    console.log('DEBUG - feed:message: Saved to disk image attached by user:', userUploadedImagePath);
                    Screen.saveScreen({
                      user: req.user,
                      path: userUploadedImagePath
                    }, result => {
                      return res.status(200).json({state: 'saved', key: result});
                    });
                });
        }
        catch(error)
        {
            console.log('ERROR:', error);
        }

    }
    catch(error)
    {
        console.log('ERROR:', error);
    }
};

IndexController.getScreen = (req, res) => {
  Screen.getScreenshot(req.params.key, result => {
    if (result === null) return res.redirect('/');
    if (result.private === 1) {
      if (req.user && req.user.id === result.uploadBy) {
        Screen.increaseViews(req.params.key, result.views, callback => {
          res.render('screen', {src: result.path.replace('public', '')});
        });
      } else {
        return res.redirect('/')
      }
    } else {
      Screen.increaseViews(req.params.key, result.views, callback => {
        res.render('screen', {src: result.path.replace('public', '')});
      });
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
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n';

                mailer(user.email, 'utravel@no-reply.fr', 'Password Reset', text, (error, info) => {
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
                    mailer(user.email, 'utravel@no-reply.fr', 'Your password has been changed', text);
                    req.flash('success_msg', 'Your password has been successfully reset.');
                    res.redirect('/game');
                }
            });
        })
    });
};


IndexController.postShop = (req, res) => {
    let pack = req.body.pack;
    let method = req.body.paymentMethod;
    let price;
    let cristals;
    let bonus = 0;
    let stripePayment = {
                email: 'mail@mail.fr',
                source: req.body.stripeToken,
                amount: 100.00,
                description: 'Buy',
                cristals: 50
            };
    console.log(stripePayment);
    stripe.createPay(stripePayment, req).then(transaction => {
        console.log(transaction);
        if (transaction) {
                                    req.flash('success_msg', 'Payment successfully executed, cristals is added to your account.');
                                    res.redirect('/home');
                                } else {
                                    req.flash('error_msg', 'An error has occurred with your transaction.');
                                    res.redirect('/billing/cancel');
                                }
    }).catch((err) => {
        res.redirect('/billing/cancel');
    });
};


module.exports = IndexController;
