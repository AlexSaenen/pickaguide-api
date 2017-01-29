'use strict';

const jwt = require('jsonwebtoken');
const config = require('config');
const db = require('../api/database');

const userValid = new db.Users({
  'profile.firstName': 'userValid',
  'profile.lastName': 'test',
  'account.password': 'test',
  'account.email': 'test@test.test'
});

exports.createUser = (next) => {
  console.log('IN createUser')
  userValid.account.token = jwt.sign({ userId: userValid._id }, config.jwtSecret);
  userValid.save((err, user) => {
    console.log('IN SAVE')
    console.log(user);
    return next(user);
  });
};

exports.deleteUser = (idUser, next) => {
  db.Users.findByIdAndRemove(idUser, () => {
    return next();
  });
};
