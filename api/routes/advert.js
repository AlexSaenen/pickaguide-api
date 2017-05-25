const express = require('express');
const advertHandler = require('../handlers/advert').Advert;
const commentAdvert = require('../handlers/commentAdvert').CommentAdvert;

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

router.post('/:id/comments', (req, res) => {
  commentAdvert.create(req.user.userId, req.params.id, req.body)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
})

module.exports = router;
