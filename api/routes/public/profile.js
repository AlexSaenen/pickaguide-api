const express = require('express');
const profileHandler = require('../../handlers/profile').Profile;
const fs = require('fs');

const router = express.Router();

router.get('/', (req, res) => {
  profileHandler.findAll()
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.get('/:id', (req, res) => {
  profileHandler.findPublic(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.get('/:id/avatar', (req, res) => {
  profileHandler.download(req.params.id)
    .then((result) => {
      res.sendFile(result, (err) => {
        if (err) res.status(500).send(err);
        fs.unlink(result, (unlinkErr) => {
          if (unlinkErr) {
            console.log('Encountered an error unlinking a file:', unlinkErr);
          }
        });
      });
    })
    .catch(error => res.status(404).send(error));
});

router.get('/:id/avatar/available', (req, res) => {
  profileHandler.hasAvatar(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

module.exports = router;
