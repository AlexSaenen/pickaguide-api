const express = require('express');

const router = express.Router();
const accountHandler = require('../handlers/account').Account;

router.post('/signup', (req, res) => {
  accountHandler.signup(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((error) => {
      res.status(200).send({ error });
    });
});

router.post('/login', (req, res) => {
  accountHandler.authenticate(req.body.email, req.body.password)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((error) => {
      res.status(200).send({ error });
    });
});

module.exports = router;
