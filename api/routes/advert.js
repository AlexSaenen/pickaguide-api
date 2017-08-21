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

// router.put('/:id/comments/:idcomment', (req, res) => {
//   commentAdvert.edit(req.user.userId, req.params.id, req.params.idcomment)
//     .then(result => res.status(200).send(result))
//     .catch(error => res.status(500).send(error));
// });

router.delete('/:id/comments/:idcomment', (req, res) => {
  commentAdvert.remove(req.user.userId, req.params.id, req.params.idcomment)
    .then(result => res.status(200).send({ comments: result, _id: req.params.id }))
    .catch(error => res.status(500).send(error));
});

router.put('/:id/comments/:idcomment/likes', (req, res) => {
  commentAdvert.toggleLike(req.user.userId, req.params.id, req.params.idcomment)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

// router.put('/:id/occupied', (req, res) => {
//   advertHandler.addOccupied(req.user.userId, req.params.id, req.body)
//     .then(result => res.status(200).send(result))
//     .catch(error => res.status(500).send(error));
// });
//
// router.delete('/:id/occupied', (req, res) => {
//   advertHandler.removeOccupied(req.user.userId, req.params.id, req.body)
//     .then(result => res.status(200).send(result))
//     .catch(error => res.status(500).send(error));
// });
//
// router.get('/:id/occupied', (req, res) => {
//   advertHandler.getOccupied(req.user.userId, req.params.id)
//     .then(result => res.status(200).send(result))
//     .catch(error => res.status(500).send(error));
// });

module.exports = router;
