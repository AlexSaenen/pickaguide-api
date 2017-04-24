const express = require('express');
const userHandler = require('../../handlers/user').User;

const router = express.Router();

router.get('/:id/isGuide', (req, res) => {
  userHandler.isGuide(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});


module.exports = router;
