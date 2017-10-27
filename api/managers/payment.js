const db = require('../database');
const _ = require('lodash');
const displayName = require('./profile').displayName;



const create = (payerIdx, beneficiaryIdx, amountPayerx, amountBeneficiaryx) => {
  return new Promise((resolve, reject) => {
    const newPayment = new db.Payments({
      payerId: payerIdx,
      beneficiaryId: beneficiaryIdx,
      amountPayer: amountPayerx,
      amountBeneficiary: amountBeneficiaryx,
    });

    newPayment.save((err) => {
      if (err) {
        let message;
        if (err.code === 11000) { message = 'This payment already exists'; } else { message = 'Invalid data'; }
        return reject({ code: 1, message });
      }
      resolve({ code: 0, message: 'Payment requested' });
    });
  });
};

const getRefounds = (user) => {
  return new Promise((resolve, reject) => {
    db.Payments
      .find({ beneficiaryId: user})
      .lean()
      .exec((err, Payments) => {
        if (err) { return reject({ code: 1, message: err.message }); }
        if (Payments == null) { return reject({ code: 2, message: 'You don\'t have any refound' }); }

        resolve({ Payments });
      });
  });
};


module.exports = { create, getRefounds};
