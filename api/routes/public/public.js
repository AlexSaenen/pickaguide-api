const express = require('express');

const router = express.Router();
// const accountHandler = require('../../handlers/account').Account;

router.post('/sign-up', function handler(req, res) {
  res.status(200).send({ json: 'fuck you' });
  // accountHandler.signup(req.body)
  //   .then(function(result) { res.status(201).send(result); })
  //   .catch(function(error) { res.status(400).send(error); });
});

router.post('/sign-in', function handler(req, res) {
  res.status(200).send({ json: 'fuck you' });
  // accountHandler.authenticate(req.body.email, req.body.password)
  //   .then(function(result) { res.status(200).send(result); })
  //   .catch(function(error) { res.status(400).send(error); });
});

router.get('/verify/:id', function handler(req, res) {
  res.status(200).send({ json: 'fuck you' });
  // accountHandler.verifyEmailAccount(req.params.id)
  //   .then(function(result) { res.status(200).send(result); })
  //   .catch(function(error) { res.status(404).send(error); });
});

router.post('/forgot', function handler(req, res) {
  res.status(200).send({ json: 'fuck you' });
  // accountHandler.sendResetPassword(req.body.email)
  //   .then(function(result) { res.status(200).send(result); })
  //   .catch(function(error) { res.status(404).send(error); });
});

router.get('/reset/:token', function handler(req, res) {
  res.status(200).send({ json: 'fuck you' });
  // accountHandler.validateToken(req.params.token)
  //   .then(function(result) { res.status(200).send(result); })
  //   .catch(function(error) { res.status(404).send(error); });
});

router.post('/reset/:token', function handler(req, res) {
  res.status(200).send({ json: 'fuck you' });
  // accountHandler.resetPassword(req.params.token, req.body.password)
  //   .then(function(result) { res.status(200).send(result); })
  //   .catch(function(error) { res.status(404).send(error); });
});

module.exports = router;
