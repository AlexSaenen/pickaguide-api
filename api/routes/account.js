const express = require('express');
const accountHandler = require('../handlers/account').Account;

const router = express.Router();

//Tous les gens connecter pourront savoir l'address email de tout le monde??
router.get('/:id', (req, res) => {
  accountHandler.find(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(404).send(error));
});

router.put('/mail', (req, res) => {
  accountHandler.updateMail(req.user.userId, req.body)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.put('/password', (req, res) => {
  accountHandler.updatePassword(req.user.userId, req.body)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.post('/signout', (req, res) => {
  accountHandler.remove(req.body)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.put('/logout', (req, res) => {
  accountHandler.logout(req.user.userId)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.get('/:id/resend-email', (req, res) => {
  accountHandler.resendEmail(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(err => res.status(500).send(err));
});

module.exports = router;
