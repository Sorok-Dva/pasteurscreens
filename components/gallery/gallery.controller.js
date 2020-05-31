const __ = process.cwd();
const _ = require('lodash');
const { BackError } = require(`${__}/helpers/back.error`);
const Models = require(`${__}/orm/models`);
const shortid = require('shortid');
const Buffer = require('safe-buffer').Buffer;
const crypto = require('crypto');
const fs = require('fs');
const Gallery = {};

Gallery.GetScreens = (req, res, next) => {
  const { id } = req.user;

  Models.Screen.findAll({
    where: { uploadBy: id, deletedAt: null },
    order: [['createdAt', 'DESC']]
  }).then(captures => {
    return res.render('gallery', { captures });
  }).catch(error => next(new BackError(error)));
};

Gallery.saveScreen = (req, res, next) => {
  if (req.body.size > 10485760) {
    return res.status(200).json({ state: 'Screenshot too large, limited to 10mo' });
  }
  // Decoding base-64 image
  // Source: http://stackoverflow.com/questions/20267939/nodejs-write-base64-image-file
  const decodeBase64Image = (dataString) => {
    const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const response = {};

    if (matches.length !== 3) {
      return res.status(200).json({ state: 'Invalid input string' });
    }

    response.type = matches[1];
    response.data = new Buffer.alloc(parseInt(req.body.size), matches[2], 'base64');

    return response;
  };
  // Regular expression for image type:
  const imageTypeRegularExpression = /\/(.*?)$/;
  // Generate random string
  const seed = crypto.randomBytes(20);
  const uniqueSHA1String = crypto.createHash('sha1').update(seed).digest('hex');
  const imageBuffer = decodeBase64Image(req.body.base64);
  const userUploadedFeedMessagesLocation = 'public/assets/images/upload/';
  const uniqueRandomImageName = 'img-' + uniqueSHA1String;
  // This letiable is actually an array which has 5 values,
  // The [1] value is the real image extension
  const imageTypeDetected = imageBuffer.type.match(imageTypeRegularExpression);
  const userUploadedImagePath = userUploadedFeedMessagesLocation + uniqueRandomImageName + '.' + imageTypeDetected[1];

  // Save decoded binary image to diskcon
  fs.writeFile(userUploadedImagePath, imageBuffer.data, { encoding: 'base64' }, err => {
    if (err) return next(new BackError(err));
    Models.Screen.create({
      uploadBy: req.user ? req.user.id : -1,
      private: req.body.privacy,
      title: req.body.title || 'Untitled',
      savedAsImg: true,
      path: userUploadedImagePath.replace('public/', ''),
      shareKey: shortid.generate(),
      size: req.body.size,
      views: 0
    }).then(screen => {
      return res.status(200).json(screen);
    }).catch(error => next(new BackError(error)));
  });
};

Gallery.getScreen = (req, res, next) => {
  if (_.isNil(req.params.key)) return next(new BackError('No key provided', 403));
  Models.Screen.findOne({
    where: {
      shareKey: req.params.key
    }
  }).then(screen => {
    if (_.isNil(screen)) return next(new BackError('Screen not found', 404));
    if (screen.path === null && screen.deletedAt !== null) {
      return res.redirect('/')
    }

    const viewScreenShot = () => {
      screen.views += 1;
      screen.save();
      res.render('screen', { screen, src: screen.path.replace('public', '') });
    };

    if (screen.private === true) {
      if (req.user && req.user.id === screen.uploadBy) {
        return viewScreenShot();
      } else {
        return res.redirect('/')
      }
    } else {
      return viewScreenShot();
    }
  });
};

Gallery.deleteScreen = (req, res, next) => {
  if (_.isNil(req.params.key)) return next(new BackError('No key provided', 403));
  Models.Screen.findOne({
    where: {
      shareKey: req.params.key,
      uploadBy: req.user.id
    }
  }).then(screen => {
    if (_.isNil(screen)) return next(new BackError('Screen not found', 404));

    fs.unlink(`${__}/public/${screen.path}`, err => {
      screen.path = null;
      screen.deletedAt = new Date();
      screen.save().then(() => res.status(200).json({ state: 'deleted' }))
        .catch(error => next(new BackError(error)));
    });
  });
};

Gallery.SetScreenPrivacy = (req, res, next) => {
  if (_.isNil(req.params.key)) return next(new BackError('No key provided', 403));
  if (req.params.privacy !== 'public' && req.params.privacy !== 'private')
  { return next(new BackError('Bad parameters', 403)); }
  Models.Screen.findOne({
    where: {
      shareKey: req.params.key,
      uploadBy: req.user.id
    }
  }).then(screen => {
    if (_.isNil(screen)) return next(new BackError('Screen not found', 404));

    screen.private = req.params.privacy === 'private' ? 1 : 0;
    screen.save().then(() => res.status(200).json({ state: 'privacy updated' }))
      .catch(error => next(new BackError(error)));
  });
};

module.exports = Gallery;
