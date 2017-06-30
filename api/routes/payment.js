const express = require('express');
const paymentService = require('../payment-service');
const userHandler = require('../handlers/user').User;


const router = express.Router();

router.post('/getInfos', (req, res) => {
	userHandler.find(req.user.userId, 'account', true)
		.then((account) => {
			if (account.account.paymentId == null) {
				paymentService.createUser(account)
				    .then((result) => {console.log(result);res.sendStatus(200)})
				    .catch((err) => {console.log(err);res.status(500).send(err)});
			} else {
				paymentService.getUser(account)
				    .then((result) => {console.log(result.sources.data);res.sendStatus(200)})
				    .catch((err) => {console.log(err);res.status(500).send(err)});
			}
		})
		.catch(error => res.status(404).send(error));
});

router.post('/addCard', (req, res) => {
	userHandler.find(req.user.userId, 'account', true)
		.then((account) => {
			paymentService.addCard(account.account.paymentId, req.body)//, 10, 2018, '4242 4242 4242 4242', 100)
			    .then((result) => {console.log(result);res.sendStatus(200)})
			    .catch((err) => {console.log(err);res.status(500).send(err)});
		})
		.catch(error => res.status(404).send(error));
});

router.post('/pay', (req, res) => {
	userHandler.find(req.user.userId, 'account', true)
		.then((account) => {
			paymentService.createPayment(account.account.paymentId, req.body)//"card_1AaTypLfhKZNuiQ3L2NfUH4h", 42, "eur", "Paiement pour la visite de boston")
			    .then((result) => {console.log(result);res.sendStatus(200)})
			    .catch((err) => {console.log(err);res.status(500).send(err)});
		})
		.catch(error => res.status(404).send(error));
});

router.get('/list', (req, res) => {
	userHandler.find(req.user.userId, 'account', true)
		.then((account) => {
			paymentService.listPaymentFromUser(account.account.paymentId)
			    .then((result) => {console.log(result);res.sendStatus(200)})
			    .catch((err) => {console.log(err);res.status(500).send(err)});
		})
})

module.exports = router;