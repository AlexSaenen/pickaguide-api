const db = require('../database');
const validator = require('validator');


const validateToken = (token) => {
  return new Promise((resolve, reject) => {
    db.Users.findOne({ 'account.resetPasswordToken': token }, (err, user) => {
      if (err || user === null) {
        reject({ code: 1, message: 'Password reset token is invalid' });
      } else {
        resolve({ code: 0, message: 'Password reset token is valid' });
      }
    });
  });
};

const resetPassword = (token, password) => {
  return new Promise((resolve, reject) => {
    db.Users.findOne({ 'account.resetPasswordToken': token }, (err, user) => {
      if (err || user === null) {
        reject({ code: 1, message: 'Password reset token is invalid' });
      } else {
        if (!validator.isLength(password, { min: 4, max: undefined })) { return reject({ code: 3, message: 'Invalid new Password' }); }
        user.hash(password, (hashed) => {
          user.account.password = hashed;
          user.account.resetPasswordToken = null;
          user.save((saveErr) => {
            if (saveErr) {
              reject({ code: 2, message: saveErr.message });
            } else {
              resolve({ code: 0, message: 'Password reset token is valid' });
            }
          });
        });
      }
    });
  });
};


module.exports = { validateToken, resetPassword };
