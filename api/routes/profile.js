const express = require('express');
const profileHandler = require('../handlers/profile').Profile;
const multer = require('multer');
var mkdirp = require('mkdirp');
const fs = require('fs');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, next) {
    console.log(req)
    console.log(file)
    mkdirp(__dirname + '/../../assets/' + req.user.userId + '/', function (err) {
      if (err) next(err);
      next(null, __dirname + '/../../assets/' + req.user.userId + '/')
    });
  },
  filename: function (req, file, next) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    next(null, file.fieldname + '.' + extension)
  }
});

const upload = multer({ storage: storage});

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

router.post('/avatar', upload.single('avatar'), (req, res) => {
  console.log(req);
  profileHandler.update(req.user.userId, { profile: { photoUrl: req.file.filename } })
    .then(result => res.sendStatus(201))
    .catch(error => res.status(404).send(error));
});

router.get('/:id/avatar', (req, res, next) => {
  
  var options = {
    root: __dirname + '/../../assets/' + req.params.id + '/',
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  };
  
  res.sendFile('avatar.jpeg', options, function (err) {
    if (err) {
      console.log(err);
      next(err);
    } else {
      console.log('Sent:');
    }
  });
});

module.exports = router;
