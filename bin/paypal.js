const paypal = require('paypal-rest-sdk');
const mysql = require('./mysql');
const config = require('../config/main');

/*
* allods.nova@gmail.com :   'client_id': 'AUSGSVNqHVC2KLFaGqHH1yIVbWi0kDtbT-e92tnx50VuTvnlE_pinpMtti629eiPwetENQBYve04LoXo',
*                           'client_secret': 'EF0qnfDhtNo51Y7tweNhS67mxfTeWvG7EnjYeczVVpVXmKFKqtdgKsyMxljTdHCMSfSVIMta5Ut8VxJN'
* allodsnovapp@gmail.com :  'client_id': 'AfbKQg_pH9JjBWtmVViptALQrDSHCaXae92wxTj8-mxgrQvVwV7jIuhqrhSEfShIbMqkdHZbdRDG3VVq',
*                           'client_secret': 'EMPfZpmxUVsmRIIBXGqPkBzaTdNOsyLYnT1a4_puwkdagx0IWj1S2GeIXyMPxHxlfNJeCYrJdKeMLUCm'
* allodsnovapp+pp@gmail.com :  'client_id': 'AZ8wMJ0a_SHAgEG_mvojvAfXe44BIgst_ypFHPdjBQ_Lyj15a0lZXWq1cHBX-7NGDzBjFfgNmlcLWGwS',
*                           'client_secret': 'EPNQJJjLudHhIYeYG4PMonOLoP2dxLI1DFcrmj0N5dvgzoWWvpTaJEa5YlVw4DAWNtpUSyurZwgpDXwb'
* */
paypal.configure({
    'mode': 'live', // sandbox or live
    'client_id': 'AZ8wMJ0a_SHAgEG_mvojvAfXe44BIgst_ypFHPdjBQ_Lyj15a0lZXWq1cHBX-7NGDzBjFfgNmlcLWGwS',
    'client_secret': 'EPNQJJjLudHhIYeYG4PMonOLoP2dxLI1DFcrmj0N5dvgzoWWvpTaJEa5YlVw4DAWNtpUSyurZwgpDXwb'
});

exports.createPay = async (payment, req) => {
    return new Promise((resolve, reject) => {
        paypal.payment.create(payment, function (err, payment) {
            if (err) {
                config.__w(err);
                reject(err);
            }
            else {
                mysql.get('site', (err, con) => {
                    config.__w(err);
                    let data = {
                        nickname: req.user.identifier,
                        paymentId: payment.id,
                        state: payment.state,
                        paymentMethod: payment.payer.payment_method,
                        amount: payment.transactions[0].amount.total,
                        date: new Date()
                    };
                    con.query('INSERT INTO shop_transactions SET ?', data, (err, result) => {
                        con.release();
                        resolve(payment);
                    });
                });
            }
        });
    });
};

exports.executePay = async (payerId, paymentId) => {
    return new Promise((resolve, reject) => {
        mysql.get('site', (err, con) => {
            if (err) config.__w(error);
            con.query('SELECT * FROM shop_transactions WHERE ?', {paymentId}, (err, result) => {
                con.release();
                const execute_payment_json = {
                    'payer_id': payerId,
                    'transactions': [{
                        'amount': {
                            'currency': 'EUR',
                            'total': result[0].amount
                        }
                    }]
                };
                paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
                    if (error) {
                        config.__w(error);
                        if (error.response.name === 'PAYMENT_ALREADY_DONE') resolve('Ok');
                        else resolve(false);
                    }
                    return resolve(payment);
                });
            });
        })
    });
};

exports.getTransactionsLogs = async (nickname, callback) => {
    mysql.get('site', (err, con) => {
        if (err) config.__w(err);
        con.query('SELECT * FROM shop_transactions WHERE ? ORDER BY date ASC', {nickname}, (err, result) => {
            con.release();
            return callback(result);
        });
    })
};

exports.updateTransactions = async (paymentId, data, callback) => {
    mysql.get('site', (err, con) => {
        con.query('UPDATE shop_transactions SET ? WHERE paymentId = "' + paymentId + '"', data, (e, r) => {
            con.release();
            return callback(r);
        });
    });
};

exports.cancelTransaction = async (user, callback) => {
    mysql.get('site', (err, con) => {
        con.query('UPDATE shop_transactions SET ? WHERE nickname = "' + user + '" AND state = "created"', {state: 'Canceled'}, (e, r) => {
            console.log(e,r);
            con.release();
            return callback(r);
        });
    });
};

