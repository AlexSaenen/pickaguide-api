const express = require('express');
const advertHandler = require('../../handlers/advert').Advert;

const router = express.Router();


router.get('/', (req, res) => {
  advertHandler.findAll()
    .then(result => res.status(200).send({ adverts: result }))
    .catch(error => res.status(500).send(error));
});

router.get('/main', (req, res) => {
  advertHandler.findMain()
    .then(result => res.status(200).send({ adverts: result }))
    .catch(error => res.status(500).send(error));
});

router.get('/:id', (req, res) => {
  advertHandler.find(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

module.exports = router;
