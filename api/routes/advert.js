const express = require('express');
const advertHandler = require('../handlers/advert').Advert;
const visitHandler = require('../handlers/visit').Visit;
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

router.put('/:id/visit', (req, res) => {
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

router.post('/:id/comments', (req, res) => {
  commentAdvert.create(req.user.userId, req.params.id, req.body)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

router.get('/:id/comments', (req, res) => {
  commentAdvert.findByCommentsAdvert(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

router.put('/:id/comments/:idcomment', (req, res) => {
  commentAdvert.like(req.params.id, req.params.idcomment)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

// router.put('/:id/availability', (req, res) => {
//   advertHandler.setAvailability(req.user.userId, req.params.id, req.body)
//     .then(result => res.status(200).send(result))
//     .catch(error => res.status(500).send(error));
// });

module.exports = router;
