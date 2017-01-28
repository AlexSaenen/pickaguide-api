const express = require('express');
const profileHandler = require('../handlers/profile').Profile;

const router = express.Router();

router.put('/', (req, res) => {
  profileHandler.update(req.body, req.userId)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.get('/', (req, res) => {
  profileHandler.find(req.userId)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.get('/find', (req, res) => {
  profileHandler.find(req.query)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

module.exports = router;
