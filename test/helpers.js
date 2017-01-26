'use strict';

const jwt = require('jsonwebtoken');
const config = require('config');
const db = require('../api/database');

const accountValid = new db.Users({
  account: {
    password: "test",
    email: "test@test.test"
  },
});

exports.createAccount = (next) => {
  accountValid.save((err, account) => next(account));
};

exports.deleteAccount = (idAccount, next) => {
  db.Users.findByIdAndRemove(idAccount, () => next());
};
