const express = require('express');
const profileHandler = require('../handlers/profile').Profile;
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

const avatarUpload = upload.single('avatar');
const router = express.Router();

router.post('/geo', (req, res) => {
  profileHandler.addGeo(req.user.userId, req.body)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

router.get('/geo/:distance', (req, res) => {
  profileHandler.findNear(req.user.userId, req.params.distance)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

router.get('/:id', (req, res) => {
  profileHandler.find(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.put('/', (req, res) => {
  profileHandler.update(req.user.userId, { profile: req.body })
    .then(result => res.status(200).send({ profile: result.profile }))
    .catch(error => res.status(400).send(error));
});

router.post('/avatar', (req, res) => {
  avatarUpload(req, res, (err) => {
    if (err) return res.status(400).send({ code: 1, message: 'The mimetype is not valid must be jpeg|jpg|png|gif' });
    profileHandler.upload(req.user.userId, req.file)
      .then(() => res.status(200).send({ ok: true }))
      .catch(error => res.status(404).send(error));
  });
});

router.delete('/avatar', (req, res) => {
  profileHandler.deleteAvatar(req.user.userId)
    .then(() => res.status(200).send({ ok: true }))
    .catch(error => res.status(404).send(error));
});

module.exports = router;
