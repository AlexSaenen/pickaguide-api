'use strict';

const config = require('config');
const stripePackage = require('stripe');

const stripe = stripePackage(config.stripe.apiKey);


exports.createUser = (user) => {
  return new Promise((resolve, reject) => {
    stripe.customers
      .create({
        email: user.account.email,
      })
      .then((customer) => {
        user.account.paymentId = customer.id;

        user.save((saveErr) => {
          if (saveErr) {
            return reject(saveErr);
          }
          resolve(customer);
        });
      })
      .catch(err => reject(err));
  });
};

exports.getUser = (user) => {
  return new Promise((resolve, reject) => {
    stripe.customers
      .retrieve(user.account.paymentId)
      .then(customer => resolve(customer))
      .catch(err => reject(err));
  });
};

exports.addCard = (idUser, body) => {
  return new Promise((resolve, reject) => {
    stripe.customers
      .createSource(idUser, {
        source: {
          object: 'card',
          exp_month: body.expirationMonth,
          exp_year: body.expirationYear,
          number: body.number,
          cvc: body.cvc,
        },
      })
      .then(card => resolve(card))
      .catch(err => reject(err));
  });
};

exports.createPayment = (idUser, body) => {
  return new Promise((resolve, reject) => {
    stripe.charges
      .create({
        amount: body.amount * 100,
        currency: body.currency,
        customer: idUser,
        source: body.idCard,
        description: body.description,
        metadata: body.meta,
      })
      .then(payment => resolve(payment))
      .catch(error => reject(err));
  });
};

exports.getAllPayments = (idUser) => {
  return new Promise((resolve, reject) => {
    if (idUser === null) {
      return resolve({ data: [] });
    }

    stripe.charges
      .list({
        customer: idUser,
        limit: 100,
      })
      .then(payments => resolve(payments))
      .catch(err => reject(err));
  });
};

exports.getPayment = (idPayment) => {
  return new Promise((resolve, reject) => {
    if (idPayment === null) {
      return resolve({ data: [] });
    }

    stripe.charges
      .retrieve(idPayment)
      .then(payment => resolve(payment))
      .catch(err => reject(err));
  });
};