'use strict';

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
