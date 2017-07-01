const express = require('express');
const paymentService = require('../../payment-service');

const router = express.Router();

// router.post('/a', (req, res) => {
// paymentService.createUser("vivien.pradelles@gmail.com")
//     .then((result) => {console.log(result);res.sendStatus(200)})
//     .catch((err) => {console.log(err);res.status(500).send(err)});
// });

// router.post('/b', (req, res) => {
// paymentService.createCard("cus_Aw35sYXobUhipB", 10, 2018, '4242 4242 4242 4242', 100)
//     .then((result) => {console.log(result);res.sendStatus(200)})
//     .catch((err) => {console.log(err);res.status(500).send(err)});
// });

// router.post('/c', (req, res) => {
// paymentService.pay("cus_Aw35sYXobUhipB", 10000, 'eur', "card_1AaBJMLfhKZNuiQ34g344hj1", "paiement")
//     .then((result) => {console.log(result);res.sendStatus(200)})
//     .catch((err) => {console.log(err);res.status(500).send(err)});
// });


module.exports = router;