const express = require('express');
const advertHandler = require('../handlers/advert').Advert;
const visitHandler = require('../handlers/visit').Visit;
const commentAdvert = require('../handlers/commentAdvert').CommentAdvert;
const multer = require('multer');
const mime = require('mime-types');
const path = require('path');

const upload = multer({
  fileFilter(req, file, cb) {
    if (!mime.extension(file.mimetype).match(/^(jpeg|jpg|png|gif)$/)) {
      return cb(new Error(`The mimetype is not valid : ${file.mimetype}`));
    }

    cb(null, true);
  },
  dest: path.join(__dirname, '/../../assets/'),
});

const coverUpload = upload.single('cover');
const router = express.Router();

router.post('/', (req, res) => {
  advertHandler.create(req.user.userId, req.body)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

router.get('/', (req, res) => {
  advertHandler.findAllFrom(req.user.userId)
    .then(result => res.status(200).send({ adverts: result }))
    .catch(error => res.status(500).send(error));
});

router.put('/:id/toggle', (req, res) => {
  advertHandler.toggle(req.user.userId, req.params.id)
    .then(result => res.status(200).send({ adverts: result }))
    .catch(error => res.status(500).send(error));
});

router.post('/:id/visit', (req, res) => {
  visitHandler.create(req.user.userId, req.params.id, req.body)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

router.put('/:id', (req, res) => {
  advertHandler.update(req.user.userId, req.params.id, req.body)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

router.delete('/:id', (req, res) => {
  advertHandler.remove(req.user.userId, req.params.id)
    .then(result => res.status(200).send({ adverts: result }))
    .catch(error => res.status(500).send(error));
});

router.post('/:id/cover', (req, res) => {
  coverUpload(req, res, (err) => {
    if (err) return res.status(400).send({ code: 1, message: 'The mimetype is not valid must be jpeg|jpg|png|gif' });
    advertHandler.upload(req.params.id, req.user.userId, req.file)
      .then(() => res.status(200).send({ ok: true }))
      .catch(error => res.status(404).send(error));
  });
});

router.delete('/:id/cover', (req, res) => {
  advertHandler.deleteCover(req.params.id, req.user.userId)
    .then(() => res.status(200).send({ ok: true }))
    .catch(error => res.status(404).send(error));
});

router.get('/:id/comments', (req, res) => {
  commentAdvert.findByCommentsAdvert(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

router.post('/:id/comments', (req, res) => {
  commentAdvert.create(req.user.userId, req.params.id, req.body)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

router.put('/:id/comments/:idcomment', (req, res) => {
  commentAdvert.like(req.params.id, req.params.idcomment)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

router.delete('/:id/comments/:idcomment', (req, res) => {
  commentAdvert.remove(req.user.userId, req.params.id, req.params.idcomment)
    .then(result => res.status(200).send({ comments: result, _id: req.params.id }))
    .catch(error => res.status(500).send(error));
});

// router.put('/:id/availability', (req, res) => {
//   advertHandler.setAvailability(req.user.userId, req.params.id, req.body)
//     .then(result => res.status(200).send(result))
//     .catch(error => res.status(500).send(error));
// });

module.exports = router;
