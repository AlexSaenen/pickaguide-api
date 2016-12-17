const express = require('express');

const router = express.Router();
const accountHandler = require('../handlers/account').Account;

router.post('/sign-up', (req, res) => {
  accountHandler.signup(req.body)
    .then((result) => {
      res.status(201).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.post('/sign-in', (req, res) => {
  accountHandler.authenticate(req.body.email, req.body.password)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

module.exports = router;
