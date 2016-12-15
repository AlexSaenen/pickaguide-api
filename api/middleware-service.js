const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('config');
const _ = require('lodash');

const router = express.Router();

router.use((req, res, next) => {
  const bearerToken = _.split(req.headers.authorization, ' ');

  if (_.startsWith(bearerToken[0], 'Bearer')) {
    jwt.verify(bearerToken[1], config.jwtSecret, (err, decoded) => {
      if (err) {
        return res.json({ success: false, message: `Failed to authenticate token: ${err}` });
      }

      req.decoded = decoded;
      req.userId = decoded.userId;
      next();
    });
  } else {
    return res.status(403).send({
      success: false,
      message: 'No token provided.',
    });
  }
});

module.exports = router;
