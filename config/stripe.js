const env = require('dotenv').config().parsed;
const stripe = require('stripe')(env.STRIPE_SK_LIVE); // live
const mysql = require('../bin/mysql');
const config = require('./main');

exports.createPay = async (payment, req) => {
  console.log(payment);
  return new Promise((resolve, reject) => {
    stripe.customers.create({
      email: 'user@hotmail.fr',
      source: payment.source
    }).then(customer => {
      console.log(customer);
      stripe.charges.create({
        amount: payment.amount * 100,
        description: payment.description,
        currency: 'eur',
        customer: customer.id
      }).then(charge => {
        console.log(charge);
        return resolve(charge);
      });
    }).catch(error => {
      console.log(error);
      return reject(error);
    });
  });
};