'use strict';

const userManager = require('./managers/user');

exports.errorsTokenMissing = function errorsTokenMissing(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).send({
      code: 1,
      message: err.message,
    });
  }

  return res.status(500).send({
    code: 1,
    message: err,
  });
};

exports.checkContentTypeHeader = (err, req, res, next) => {
  if (['PUT', 'POST'].indexOf(req.method) !== -1 && req.url.indexOf('avatar') === -1) {
    if (req.headers['content-type'] !== 'application/json') {
      return res.status(415).send({
        code: 1,
        message: 'Missing "Content-Type" header set to "application/json"',
      });
    }
  }

  next();
};

exports.trimForm = function trimForm(req, res, next) {
  if (req.body) {
    const keys = Object.keys(req.body);
    keys.forEach((key) => {
      const value = req.body[key];
      if (typeof value === 'string') {
        req.body[key] = value.trim();
      }
    });
  }

  next();
};

exports.checkUserIsBlocked = function checkUserIsBlocked(req, res, next) {
  const whitelisted = [
    new RegExp(/^\/users\/isBlocking$/),
    new RegExp(/^\/accounts\/logout$/),
    new RegExp(`^/accounts/${req.user.userId}`),
    new RegExp(`^/profiles/${req.user.userId}`),
    new RegExp(/^\/proposals\/[a-z0-9]{24}\/comments/),
    new RegExp(/^\/payment\//),
    new RegExp(/^\/visits\/review$/),
    new RegExp(/^\/visits\/[a-z0-9]{24}\/review$/),
  ];

  if (whitelisted.reduce((a, b) => a || RegExp(b).test(req.url), false) === false) {
    userManager.isBlocking(req.user.userId)
      .then((user) => {
        if (user.isBlocking) {
          return res.status(403).send({
            code: 1,
            message: 'Your account is blocked, please review all visits first',
          });
        }

        next();
      })
      .catch(err => res.status(500).send(err));
  } else {
    next();
  }
};
