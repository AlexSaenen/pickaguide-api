const express = require('express');
const visitHandler = require('../handlers/visit').Visit;

const router = express.Router();


router.get('/', (req, res) => {
  visitHandler.findAllFrom(req.user.userId)
    .then(result => res.status(200).send({ visits: result }))
    .catch(error => res.status(500).send(error));
});

router.put('/:id/cancel', (req, res) => {
  visitHandler.cancel(req.user.userId, req.params.id, req.body)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

router.put('/:id/deny', (req, res) => {
  visitHandler.deny(req.user.userId, req.params.id, req.body)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

router.put('/:id/accept', (req, res) => {
  visitHandler.accept(req.user.userId, req.params.id, req.body)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

router.put('/:id/finish', (req, res) => {
  visitHandler.finish(req.user.userId, req.params.id, req.body)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});


module.exports = router;
