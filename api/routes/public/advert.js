const express = require('express');
const advertHandler = require('../../handlers/advert').Advert;
const commentAdvert = require('../../handlers/commentAdvert').CommentAdvert;

const router = express.Router();


router.get('/:id', (req, res) => {
  advertHandler.find(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

router.get('/:id/comments', (req, res) => {
  commentAdvert.findByCommentsAdvert(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

module.exports = router;
