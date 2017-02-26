const express = require('express');
const profileHandler = require('../handlers/profile').Profile;
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: __dirname + '/../../public/uploads/' });

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

router.post('/upload/profile', upload.single('profile'), (req, res) => {
  console.log(req)
  return;
});

module.exports = router;
