const db = require('../database');
const _ = require('lodash');
const displayName = require('./profile').displayName;



const create = (payerIdx, beneficiaryIdx, amountPayerx, amountBeneficiaryx, idVisitx) => {
  return new Promise((resolve, reject) => {
    const newPayment = new db.Payments({
      payerId: payerIdx,
      beneficiaryId: beneficiaryIdx,
      amountPayer: amountPayerx,
      amountBeneficiary: amountBeneficiaryx,
      idVisit: idVisitx,
    });

    newPayment.save((err, payment) => {
      if (err) {
        let message;
        if (err.code === 11000) { message = 'This payment already exists'; } else { message = 'Invalid data'; }
        return reject({ code: 1, message });
      }
      resolve(payment);
      // resolve({ code: 0, message: 'Payment requested' });
    });
  });
};

const getRefounds = (user, refoundedx = false) => {
  return new Promise((resolve, reject) => {
  db.Payments
    .find({ beneficiaryId: user, refounded: refoundedx, payed: true})
    .exec((err, Payments) => {
      if (err) { return reject({ code: 1, message: err.message }); }
      if (Payments == null) { return reject({ code: 2, message: 'You don\'t have any refound' }); }

      resolve({ Payments });
    });      
  });
};

const getPayments = (user, payedx = false) => {
  return new Promise((resolve, reject) => {
  db.Payments
    .find({ payerId: user, payed: payedx})
    .lean()
    .exec((err, Payments) => {
      if (err) { return reject({ code: 1, message: err.message }); }
      if (Payments == null) { return reject({ code: 2, message: 'You don\'t have any payment' }); }

      resolve({ Payments });
    });      
  });
};

const paymentPayed = (payment, paymentId) => {
  return new Promise ((resolve, reject) => {
    payment.payed = true;
    payment.idPayment = paymentId
    payment.save((saveErr, updatedPayment) => {
      if (saveErr) { return reject({ code: 1, saveErr }); }
      if (updatedPayment === null) { return reject({ code: 2, message: 'Failed to update payment' }); }

      resolve({ visit: updatedPayment });
    });
  })
};

const paymentRefounded = (payment, paymentId) => {
  console.log(payment);
  return new Promise ((resolve, reject) => {
    payment.refounded = true;
    payment.idRefound = paymentId
    payment.save((saveErr, updatedPayment) => {
      if (saveErr) { return reject({ code: 1, saveErr }); }
      if (updatedPayment === null) { return reject({ code: 2, message: 'Failed to update payment' }); }

      resolve({ visit: updatedPayment });
    });
  })
};

module.exports = { create, getRefounds, getPayments, paymentPayed, paymentRefounded};
