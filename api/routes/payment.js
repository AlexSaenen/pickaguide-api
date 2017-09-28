const express = require('express');
const paymentService = require('../payment-service');
const userManager = require('../managers/user');


const router = express.Router();

router.get('/getInfos', (req, res) => {
  userManager.find(req.user.userId, 'account', true)
    .then((account) => {
      if (account.account.paymentId == null) {
        paymentService.createUser(account)
          .then((result) => {console.log(result);res.status(200).send(result)})
          .catch((err) => {console.log(err);res.status(500).send(err)});
      } else {
        paymentService.getUser(account)
          .then((result) => {console.log(result.sources.data);res.status(200).send(result)})
          .catch((err) => {console.log(err);res.status(500).send(err)});
      }
    })
    .catch(error => res.status(404).send(error));
});

router.post('/addCard', (req, res) => {
  userManager.find(req.user.userId, 'account', true)
    .then((account) => {
      paymentService.addCard(account.account.paymentId, req.body) // 10, 2018, '4242 4242 4242 4242', 100)
        .then((result) => {console.log(result);res.status(200).send(result)})
        .catch((err) => {console.log(err);res.status(500).send(err)});
    })
    .catch(error => res.status(404).send(error));
});

router.post('/pay', (req, res) => {
  userManager.find(req.user.userId, 'account', true)
    .then((result) => {
      req.body.currency = 'eur';
      req.body.description = 'Gratification visite PickaGuide';
      paymentService.createPayment(result.account.paymentId, req.body) // "card_1AaTypLfhKZNuiQ3L2NfUH4h", 42, "eur", "Paiement pour la visite de boston")
        .then((result) => {console.log(result);res.status(200).send({ ok: true }) })
        .catch((err) => {console.log(err);res.status(500).send(err)});
    })
    .catch(error => res.status(404).send(error));
});

router.get('/list', (req, res) => {
  userManager.find(req.user.userId, 'account', true)
    .then((account) => {
      paymentService.listPaymentFromUser(account.account.paymentId)
        .then((result) => {console.log(result);res.status(200).send({ ok: true }) })
        .catch((err) => {console.log(err);res.status(500).send(err)});
    })
})

module.exports = router;
