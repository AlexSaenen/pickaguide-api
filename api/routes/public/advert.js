const express = require('express');
const advertHandler = require('../../handlers/advert').Advert;
const fs = require('fs');

const router = express.Router();


router.get('/', (req, res) => {
  advertHandler.findAll()
    .then(result => res.status(200).send({ adverts: result }))
    .catch(error => res.status(500).send(error));
});

router.get('/:id/cover', (req, res) => {
  advertHandler.download(req.params.id)
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

router.get('/:id/cover/available', (req, res) => {
  advertHandler.hasCover(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
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
