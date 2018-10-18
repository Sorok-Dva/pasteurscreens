const i18n = require('i18n');

i18n.configure({
    directory: __dirname + '/i18n',
    cookie: 'pus_lang',
    browserEnable: true,
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    textsVarName: 'tr',
    queryParameter: 'lang',
    autoReload: true,
    api: {
        '__': 'tr'
    }
});

module.exports = (req, res, next) => {
    i18n.init(req, res);

    let current_locale = i18n.getLocale();

    return next();
};