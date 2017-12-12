'use strict';

const paymentService = require('../payment-service');
const paymentManager = require('../managers/payment')
const userManager = require('../managers/user');
const _ = require('lodash');


class Payment {
  static createUser(user) {
    return new Promise((resolve, reject) => {
      paymentService.createUser(user)
        .then(result => resolve(result))
        .catch(error => reject(error));
    });
  }

  static getUser(user) {
    return new Promise((resolve, reject) => {
      paymentService.getUser(user)
        .then(result => resolve(result))
        .catch(error => reject(error));
    });
  }

  static addCard(paymentId, reqBody) {
    return new Promise((resolve, reject) => {
      paymentService.addCard(paymentId, reqBody)
        .then(result => resolve(result))
        .catch(error => reject(error));
    });
  }

  static createPayment(user, reqBody) {
    return new Promise((resolve, reject) => {
      userManager
        .find(reqBody.destination)
        .then((userDestination) => {
          return paymentManager
            .create(user, userDestination, reqBody.amount, reqBody.amount, reqBody.idVisit)
            .catch(error => reject(error));
        })
        .catch(error => reject(error))
        .then((paymentDb) => {
          paymentService.createPayment(user.account.paymentId, reqBody)
            .then((result) => {
              return paymentManager
                  .paymentPayed(paymentDb, result.id)
                  .then(() => resolve(result))
                  .catch(error => reject(error));
            });
        })
      .catch(error => reject(error));
    });
  }

  static getAllPayments(user) {
    return new Promise((resolve, reject) => {
      paymentManager.getPayments(user)
        .then(result => resolve(result))
        .catch(error => reject(error));
    });

  }
    static getPayment(paymentId) {
      return new Promise((resolve, reject) => {
        paymentService.getPayment(paymentId)
        .then(result => resolve(result))
        .catch(error => reject(error))
      })
    }

    static getRefounds(user, refounded) {
    return new Promise((resolve, reject) => {
      paymentManager.getRefounds(user, refounded)
        .then(result => resolve(result))
        .catch(error => reject(error));
    });
  }

    static postRefounds(user, body) {
    return new Promise((resolve, reject) => {
      paymentManager.getRefounds(user, false)
        .then((payments) => {
          console.log(payments);
          const totalAmount = payments.Payments.reduce((sum, x) => {
            return sum + x.amountBeneficiary;
          }, 0);
          if (totalAmount <= 0)
            reject("no payment to refound")
          console.log(totalAmount);
          paymentService.createRefound(user, body, totalAmount)
            .then((result) => {
              Promise.all(payments.Payments.map((x) => {
                return paymentManager
                  .paymentRefounded(x, result.id)
              }))
              .then(() => resolve(result))
              .catch(error => reject(error))
            })
            .catch(error => reject(error))
        })
        .catch(error => reject(error));
    });
  }

  static deleteCard(user, idCard) {
    return new Promise((resolve, reject) => {
      paymentService.deleteCard(user, idCard)
      .then(result => resolve(result))
      .catch(error => reject(error));
    });
  }


}

exports.Payment = Payment;
