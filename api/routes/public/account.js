const express = require('express');
const accountHandler = require('../../handlers/account').Account;

const router = express.Router();

router.get('/', function(req, res) {
  accountHandler.findAll()
    .then(function(result) {res.status(200).send(result);})
    .catch(function(error) {res.status(400).send(error);});
});

module.exports = router;
