const express = require('express');
const accountHandler = require('../handlers/account').Account;

const router = express.Router();

router.get('/', (req, res) => {
  accountHandler.findAll()
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.post('/signout', (req, res) => {
  accountHandler.remove(req.body)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.get('/logout', (req, res) => {
  res.status(200).send({ json: 'logout' });
});

module.exports = router;
