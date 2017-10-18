const express = require('express');
const notificationHandler = require('../handlers/notification').Notification;

const router = express.Router();

// TODO with infiniteScroll
router.get('/', (req, res) => {
  notificationHandler.findAllFrom(req.user.userId)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.get('/hasUnread', (req, res) => {
  notificationHandler.hasUnread(req.user.userId)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.get('/unread', (req, res) => {
  notificationHandler.getUnread(req.user.userId)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.put('/read', (req, res) => {
  notificationHandler.readAll(req.user.userId)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.put('/:id/read', (req, res) => {
  notificationHandler.read(req.params.id, req.user.userId)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});

module.exports = router;
