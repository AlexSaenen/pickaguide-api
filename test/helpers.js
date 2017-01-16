'use strict';

const jwt = require('jsonwebtoken');
const config = require('config');

module.exports.generateToken = () => {
  return jwt.sign({test: "test"}, config.jwtSecret);
};