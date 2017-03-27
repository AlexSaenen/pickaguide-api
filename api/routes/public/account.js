const express = require('express');
const accountHandler = require('../../handlers/account').Account;

const router = express.Router();

router.get('/', (req, res) => {
  accountHandler.findAll()
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.get('/:id/isConfirmed', (req, res) => {
  accountHandler.isConfirmed(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});


module.exports = router;
