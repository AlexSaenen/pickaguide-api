const express = require('express');
const userHandler = require('../handlers/user').User;
const profileHandler = require('../handlers/profile').Profile;

const router = express.Router();

router.post('/become-guide', (req, res) => {
  profileHandler.update(req.user.userId, { profile: req.body })
    .then((updatedUser) => {
      userHandler.becomeGuide(req.user.userId)
        .then((result) => {
          updatedUser.isGuide = result.isGuide;
          res.status(200).send(updatedUser);
        })
        .catch(error => res.status(500).send(error));
    })
    .catch(error => res.status(400).send(error));
});

router.get('/isBlocking', (req, res) => {
  userHandler.isBlocking(req.user.userId)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.post('/retire', (req, res) => {
  userHandler.retire(req.user.userId)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

module.exports = router;
