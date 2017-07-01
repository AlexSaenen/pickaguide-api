const express = require('express');
const userHandler = require('../../handlers/user').User;
const advertHandler = require('../../handlers/advert').Advert;

const router = express.Router();

router.get('/:id/isGuide', (req, res) => {
  userHandler.isGuide(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.get('/:id/proposals', (req, res) => {
  advertHandler.findAllFromHim(req.params.id)
    .then(result => res.status(200).send({ adverts: result }))
    .catch(error => res.status(500).send(error));
});


module.exports = router;
