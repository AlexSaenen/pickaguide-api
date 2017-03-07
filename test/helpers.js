'use strict';

const jwt = require('jsonwebtoken');
const config = require('config');
const db = require('../api/database');

const account = { password: 'test', email: 'test@test.test' };
const profile = { firstName: 'userValid', lastName: 'test' };

const userValid = new db.Users({account, profile});

exports.createUser = (next) => {
  userValid.hash(userValid.account.password, (hashed) => {
    userValid.account.token = jwt.sign({ userId: userValid._id }, config.jwtSecret);
    userValid.account.password = hashed;
    
    userValid.save((err, user) => {
      return next(user);
    });
  });
};

exports.deleteUser = (idUser, next) => {
  db.Users.findByIdAndRemove(idUser, () => {
    return next();
  });
};