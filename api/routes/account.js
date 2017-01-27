const express = require('express');
const accountHandler = require('../handlers/account').Account;

const router = express.Router();

router.get('/', (req, res) => {
  accountHandler.findAll()
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send({ err });
    });
});

router.post('/signout', (req, res) => {
  accountHandler.disable(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send({ err });
    });
});

router.post('/logout', (req, res) => {
  res.status(200).send({ json: 'logout' });
});

router.get('/:id/resend-email', (req, res) => {
  accountHandler.resendEmail(req.params.id)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

module.exports = router;
