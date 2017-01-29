'use strict';

exports.errorsTokenMissing = function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).send({
      code: 1,
      message: err.message
    });
  }
  return res.status(500).send({
    code: 1,
    message: err
  });
};