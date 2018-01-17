const express = require('express');
const fs = require('fs');
const visitHandler = require('../handlers/visit').Visit;
const multer = require('multer');
const mime = require('mime-types');
const path = require('path');

const router = express.Router();

const upload = multer({
  fileFilter(req, file, cb) {
    if (!mime.extension(file.mimetype).match(/^(jpeg|jpg|png|gif)$/)) {
      return cb(new Error(`The mimetype is not valid : ${file.mimetype}`));
    }

    cb(null, true);
  },
  dest: path.join(__dirname, '/../../assets/'),
});

const filesUpload = upload.any();

router.get('/', (req, res) => {
  visitHandler.findAllFrom(req.user.userId)
    .then(visits => visits.filter(visit => visit.hasEnded))
    .then(visits => res.status(200).send(visits))
    .catch(error => res.status(500).send(error));
});

router.put('/:id', (req, res) => {
  filesUpload(req, res, (err) => {
    if (err) return res.status(400).send({ code: 1, message: 'The mimetype is not valid must be jpeg|jpg|png|gif' });

    visitHandler.update(req.user.userId, req.params.id, req.files)
      .then(result => res.status(200).send(result))
      .catch(error => {console.log(error);res.status(500).send(error)});
  });
});

router.get('/:id/image/:hook', (req, res) => {
  visitHandler.downloadImageByHook(req.params.id, req.params.hook)
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
  visitHandler.getImageHooks(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

module.exports = router;
