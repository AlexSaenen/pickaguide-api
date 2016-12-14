const express = require('express');
const accountHandler = require('../handlers/account').Account;

const router = express.Router();

router.post('/signup', (req, res) => {
  accountHandler.signup(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send({ err });
    });
});

router.post('/login', (req, res) => {
  accountHandler.authenticate(req.body.pseudo, req.body.password)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send({err});
    });
});

module.exports = router;
