const express = require('express');
const visitHandler = require('../../handlers/visit').Visit;

const router = express.Router();


router.get('/:id', (req, res) => {
  visitHandler.find(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});


module.exports = router;
