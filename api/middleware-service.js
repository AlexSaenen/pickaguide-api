'use strict';

exports.errorsTokenMissing = function errorsTokenMissing(err, req, res) {
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
  if (req.headers['content-type'] !== 'application/json') {
    return res.status(415).send({
      code: 1,
      message: 'Missing "Content-Type" header set to "application/json"',
    });
  }

  next();
};
