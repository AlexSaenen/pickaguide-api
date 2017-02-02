const express = require('express');
const accountHandler = require('../handlers/account').Account;

const router = express.Router();

router.get('/:id', (req, res) => {
  accountHandler.find(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.get('/', (req, res) => {
  accountHandler.findAll()
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.put('/', (req, res) => {
  accountHandler.update(req.userId, { account: req.body })
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.post('/signout', (req, res) => {
  accountHandler.remove(req.body)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.post('/logout', (req, res) => {
  accountHandler.logout(req.user.userId)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.get('/:id/resend-email', (req, res) => {
  accountHandler.resendEmail(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(err => res.status(500).send(err));
});

module.exports = router;
