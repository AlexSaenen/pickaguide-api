'use strict';
//import stripePackage from 'stripe';
const stripePackage = require('stripe');
const userHandler = require('./handlers/user').User;

const stripe = stripePackage('sk_test_LsvsnxVyCIQplUZ7oZioWvcL');

// exports.createUserCharge = () => {
//   return new Promise((resolve, reject) => {
//     stripe.customers.create({
//       email: 'toto@example.com'
//     })
//     .then(function(customer){
//       return stripe.customers.createSource(customer.id, {
//         source: {
//            object: 'card',
//            exp_month: 10,
//            exp_year: 2018,
//            number: '4242 4242 4242 4242',
//            cvc: 100
//         }
//       });
//     }).then(function(source) {
//         stripe.charges.create({
//         amount: 1650,
//         currency: 'eur',
//         customer: source.customer
//       }).then(function(charge) {
//         // New charge created on a new customer
//         resolve(charge);
//       }).catch(function(err) {
//         // Deal with an error
//         reject(err);
//       });
//     });
//   });
// }

exports.createUser = (user) => {
  return new Promise((resolve, reject) => {
    stripe.customers.create({
      email: user.account.email,
    }).then(function(customer) {
      user.account.paymentId = customer.id;
      user.account.save((saveErr, updatedUser) => {
        if (saveErr) {
          return reject(saveErr);
        }
        resolve(customer);
      });
    }).catch(function(err) {
      reject(err);
    })
  });
}

exports.getUser = (user) => {
  return new Promise((resolve, reject) => {
    stripe.customers.retrieve(
      user.account.paymentId
    ).then(function(customer) {
      resolve(customer);
    }).catch(function(err) {
      reject(err);
    })
  });
}

exports.addCard = (idUser, body) => {// exp_month, exp_year, number, cvc) => {
    return new Promise((resolve, reject) => {
    stripe.customers.createSource(idUser, {
      source: {
         object: 'card',
         exp_month: body.exp_month,
         exp_year: body.exp_year,
         number: body.number,
         cvc: body.cvc
      }
    }).then(function(card) {
      resolve(card);
    }).catch(function(err) {
      reject(err);
    })
  });
}

exports.createPayment = (idUser, body) => {// idCard, amount, currency, description) => {
  return new Promise((resolve, reject) => {
    stripe.charges.create({
      amount: body.amount * 100,
      currency: body.currency,
      customer: idUser,
      source: body.idCard,
      description: body.description
    }).then(function(payment) {
      resolve(payment);
    }).catch(function(err) {
      reject(err);
    })
  });
}

exports.listPaymentFromUser = (idUser) => {
  return new Promise((resolve, reject) => {
    stripe.charges.list({
      customer: idUser,
      limit: 100
    }).then(function(payments) {
      resolve(payments);
    }).catch(function(err) {
      reject(err);
    })
  })
}

// exports.createCard = (userId, exp_month, exp_year, number, cvc) => {
//   return new Promise((resolve, reject) => {
//     stripe.customers.createSource(userId, {
//       source: {
//          object: 'card',
//          exp_month: exp_month,
//          exp_year: exp_year,
//          number: number,
//          cvc: cvc
//       }
//     }).then(function(card) {
//       resolve(card);
//     }).catch(function(err) {
//       reject(err);
//     })
//   });
// }

// exports.pay = (userId, amount, currency, source, description) => {
//   return new Promise((resolve, reject) => {
//     stripe.charges.create({
//       amount: amount,
//       currency: currency,
//       customer: userId,
//       source: source,
//       description: description
// //      metadata: meta
//     }).then(function(payment) {
//       resolve(payment);
//     }).catch(function(err) {
//       reject(err);
//     })
//   });
// }
