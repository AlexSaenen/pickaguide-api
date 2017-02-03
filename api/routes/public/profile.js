const express = require('express');
const profileHandler = require('../../handlers/profile').Profile;

const router = express.Router();

router.get('/', (req, res) => {
  profileHandler.findAll()
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

module.exports = router;
