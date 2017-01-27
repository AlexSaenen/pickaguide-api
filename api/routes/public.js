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

router.get('/verify/:id', (req, res) => {
  accountHandler.sendConfirmEmailAccount(req.params.id)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});

router.post('/forgot', (req, res) => {
  accountHandler.sendResetPassword(req.body.email)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});

router.get('/reset/:token', (req, res) => {
  accountHandler.validateToken(req.params.token)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
});

router.post('/reset/:token', (req, res) => {
  accountHandler.resetPassword(req.params.token, req.body.password)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500);
    });
});

module.exports = router;
