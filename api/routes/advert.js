const express = require('express');
const advertHandler = require('../handlers/advert').Advert;

const router = express.Router();

router.post('/', (req, res) => {
  advertHandler.create(req.user.userId, req.body)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

router.get('/', (req, res) => {
  advertHandler.findAllFrom(req.user.userId)
    .then(result => res.status(200).send({ adverts: result }))
    .catch(error => res.status(500).send(error));
});

module.exports = router;
