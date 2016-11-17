const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const config = require('config');
const _ = require('lodash');


router.use(function(req, res, next) {

  var bearerToken = _.split(req.headers.authorization, ' ', 2);

  if (_.startsWith(bearerToken[0], 'Bearer')) {
    jwt.verify(bearerToken[1], config.jwtSecret, function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
});

module.exports = router;