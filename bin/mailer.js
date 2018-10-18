const nodemailer = require('nodemailer');
const env = require('dotenv').config().parsed;
const Mailer = {};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.GMAIL_EMAIL,
        pass: env.GMAIL_PASS
    }
});

Mailer.sendEmail = (to, subject, text)  => {
    transporter.sendMail({
        from: `"${env.SITE_TITLE}" \<${env.GMAIL_EMAIL}\>`,
        to, subject, html: putText2Template(subject, text)
    }, (error, info) => {
        if (error) {
            console.log(error);
        }
    });
};

Mailer.sendValidationMail = (nickname, to, key)  => {
    let text = ``;

    transporter.sendMail({
        from: `"${env.SITE_TITLE}" \<${env.GMAIL_EMAIL}\>`,
        to, subject: '', html: putText2Template('', text)
    }, (error, info) => {
        if (error) {
           console.log('Mailer error :' + error, info);
        }
    });
};

const putText2Template = (title, text) => {
    return `<table width="650" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #725939; background-color: black; color: white; margin:0 10px"><tbody><tr><td width="650" height="20"></td></tr><tr><td width="650" align="center"><div align="center" style="text-align:center"><a href="https://pasteurscreens.tk" target="_blank"><h2 style="color:goldenrod;">${title}</h2></a></div></td></tr><tr><td width="650" height="30"></td></tr><tr><td width="740"><table width="640" cellpadding="0" cellspacing="0" border="0"><tbody><tr><td width="30"></td><td width="580"><table width="580" cellpadding="0" cellspacing="0" border="0"><tbody><tr><td width="580"><div align="left"><p>${text}</p></i><br><br/><br/><u></u></div></td></tr><tr><td width="580" height="10"></td></tr></tbody></table><u></u><u></u></td><td width="30"></td></tr></tbody></table></td></tr><tr><td width="640" height="15"></td></tr><tr><td width="640"><table width="640" cellpadding="0" cellspacing="0" border="0"><tbody><tr><td width="30"></td><td width="360" height="15"></td><td width="60"></td><td width="160"></td><td width="30"></td></tr></tbody></table></td></tr><tr><td width="640" height="60"></td></tr></tbody></table>`;
};

module.exports = Mailer;
