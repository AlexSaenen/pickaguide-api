const express = require('express');
const profileHandler = require('../handlers/profile').Profile;

const router = express.Router();

router.get('/:id', (req, res) => {
  profileHandler.find(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.get('/', (req, res) => {
  profileHandler.findAll()
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.put('/', (req, res) => {
  profileHandler.update(req.userId, { profile: req.body })
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

module.exports = router;
