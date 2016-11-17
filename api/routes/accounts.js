const express = require('express');
const accountHandler = require('../handlers/account').Account;

const router = express.Router();

router.get('/', (req,res) => {
  accountHandler.findAll()
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send({err});
    });
});

router.post('/signout', (req, res) => {
    res.status(200).send({ json: 'signout' });
});

router.post('/logout', (req, res) => {
    res.status(200).send({ json: 'logout' });
});

router.post('/findByPseudo', (req, res) => {
    accountHandler.findByPseudo(req.body)
    .then((result) => {
        res.status(200).send(result);
    })
    .catch((err) => {
        res.status(500).send({ err });
    });
});

router.get('/find', (req, res) => {
  accountHandler.find(req.query)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send({err});
    })
});

module.exports = router;
