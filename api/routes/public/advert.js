const express = require('express');
const fs = require('fs');
const advertHandler = require('../../handlers/advert').Advert;

const router = express.Router();


router.get('/forMe/:userId', (req, res) => {
  advertHandler.findAll(req.params.userId)
    .then(result => res.status(200).send({ adverts: result }))
    .catch(error => res.status(500).send(error));
});

router.get('/', (req, res) => {
  advertHandler.findAll()
    .then(result => res.status(200).send({ adverts: result }))
    .catch(error => res.status(500).send(error));
});

router.get('/main/:userId', (req, res) => {
  advertHandler.findMain(req.params.userId)
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

router.get('/:id/image/:hook', (req, res) => {
  advertHandler.downloadImageByHook(req.params.id, req.params.hook)
    .then((result) => {
      res.status(200).sendFile(result, (err) => {
        if (err) console.log('Sending file failed');

        fs.unlink(result, (unlinkError) => {
          if (unlinkError) console.log('Cleaning up file failed');
        });
      });
    })
    .catch(error => res.status(500).send(error));
});

router.get('/:id/image', (req, res) => {
  advertHandler.downloadImage(req.params.id)
    .then((result) => {
      res.status(200).sendFile(result, (err) => {
        if (err) console.log('Sending file failed');

        fs.unlink(result, (unlinkError) => {
          if (unlinkError) console.log('Cleaning up file failed');
        });
      });
    })
    .catch(error => res.status(500).send(error));
});

router.get('/:id/imageHooks', (req, res) => {
  advertHandler.getImageHooks(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});


module.exports = router;
