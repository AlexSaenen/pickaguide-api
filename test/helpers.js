'use strict';

const jwt = require('jsonwebtoken');
const config = require('config');
const db = require('../api/database');

const accountValid = new db.Accounts({
  firstName: "accountValid",
  lastName: "test",
  password: "test",
  email: "test@test.test"
});

exports.createAccount = (next) => {
  accountValid.token = jwt.sign({ userId: accountValid._id }, config.jwtSecret);
  accountValid.save((err, account) => {
    return next(account);
  });
};

exports.deleteAccount = (idAccount, next) => {
  db.Accounts.findByIdAndRemove(idAccount, () => {
    return next();
  });
};