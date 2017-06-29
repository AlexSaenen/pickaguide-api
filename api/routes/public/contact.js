const express = require('express');
const emailService = require('../../email-service');

const router = express.Router();


router.post('/', (req, res) => {
  emailService.contactUs(req.body)
    .then(result => res.sendStatus(200))
    .catch(error => res.status(500).send(error));
});

module.exports = router;