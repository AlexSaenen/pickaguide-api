const express = require('express');
const visitHandler = require('../handlers/visit').Visit;

const router = express.Router();


router.get('/', (req, res) => {
  visitHandler.findAllFrom(req.user.userId)
    .then(visits => visits.filter(visit => visit.hasEnded))
    .then(visits => res.status(200).send(visits))
    .catch(error => res.status(500).send(error));
});


module.exports = router;
