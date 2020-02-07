const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
const Env = require('./env');
const Mailer = {};

const apiInstance = new SibApiV3Sdk.SMTPApi();
apiKey.apiKey = process.env.SIB_API_KEY;

Mailer.sendEmail = (opts, callback) => {
  if (Env.isTest) return false;

  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  let attachment;
  if (opts.attachment) attachment = opts.attachment;

  sendSmtpEmail = {
    to: typeof opts.to === 'object' ? opts.to : [{ email: opts.to }],
    templateId: opts.templateId,
    params: opts.context,
    attachment
  };

  apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
    console.log('[MAIL_INFO]', JSON.stringify({ data, opts }));
    if (callback) return callback(data);
  }, function (error) {
    console.log('[MAIL_ERROR]', JSON.stringify(error));
    if (callback) return callback(null);
  });
};

module.exports = Mailer;
