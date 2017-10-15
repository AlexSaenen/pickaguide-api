const express = require('express');
const paymentService = require('../payment-service');
const userManager = require('../managers/user');


const router = express.Router();

/**
 * @apiDefine UserNotConnected
 * @apiError (400) UserNotConnected The user is not logged in.
 */

/**
 * @apiDefine StripeError
 * @apiError (400) StripeError Encountered an error with Stripe, probably a bad request.
 */

router.use((req, res, next) => { // middleware to get the account for every request
  if (req.user) {
    userManager.find(req.user.userId, 'account', true)
      .then((user) => {
        req.loadedUser = user;
        next();
      })
      .catch(error => res.status(500).send(error));
  } else {
    res.status(400).send({ code: 1, message: 'You need to be logged in' });
  }
});

/**
 * @api {get} /payment/ Find Stripe User
 * @apiName getUser
 * @apiGroup Payment
 * @apiVersion 0.3.2
 *
 * @apiHeader {String} Authorization The jsonwebtoken given on <code>/public/sign-in</code> preceded by <code>Bearer</code>
 *
 * @apiSuccess {Object} customer A Stripe Customer object <a>https://stripe.com/docs/api/node#customer_object</a>.
 * @apiUse DatabaseError
 * @apiUse UserNotConnected
 * @apiUse StripeError
 */
router.get('/', (req, res) => {
  const user = req.loadedUser;

  if (user.account.paymentId == null) {
    paymentService.createUser(user)
      .then(result => res.status(200).send(result))
      .catch(err => res.status(400).send(err));
  } else {
    paymentService.getUser(user)
      .then(result => res.status(200).send(result))
      .catch(err => res.status(400).send(err));
  }
});

/**
 * @api {post} /payment/card Add Card
 * @apiName addCard
 * @apiGroup Payment
 * @apiVersion 0.3.2
 *
 * @apiHeader {String} Authorization The jsonwebtoken given on <code>/public/sign-in</code> preceded by <code>Bearer</code>
 * @apiParam {Number} expirationMonth The expiration month of the card
 * @apiParam {Number} expirationYear The expiration year of the card
 * @apiParam {String} number The card number
 * @apiParam {String} cvc The security code of the card (3 numbers behind the card)
 *
 * @apiSuccess {Object} source The newly created Bank Account object <a>https://stripe.com/docs/api/node#customer_create_bank_account</a>.
 * @apiUse DatabaseError
 * @apiUse UserNotConnected
 * @apiUse StripeError
 */
router.post('/card', (req, res) => {
  const user = req.loadedUser;

  paymentService.addCard(user.account.paymentId, req.body)
    .then(result => res.status(200).send(result))
    .catch(err => res.status(400).send(err));
});

/**
 * @api {post} /payment/pay Create Payment
 * @apiName createPayment
 * @apiGroup Payment
 * @apiVersion 0.3.2
 *
 * @apiHeader {String} Authorization The jsonwebtoken given on <code>/public/sign-in</code> preceded by <code>Bearer</code>
 * @apiParam {Number} amount Amount in currency units (for instance <code>23</code> as in <code>$23</code>)
 * @apiParam {String} idCard The id of the card used for this payment
 * @apiParam {String} description A description to explain the reason of this payment
 *
 * @apiSuccess {Object} charge The newly created Charge object for the selected Card Source <a>https://stripe.com/docs/api/node#create_charge</a>.
 * @apiUse DatabaseError
 * @apiUse UserNotConnected
 * @apiUse StripeError
 */
router.post('/pay', (req, res) => {
  const user = req.loadedUser;
  req.body.currency = 'eur';

  paymentService.createPayment(user.account.paymentId, req.body)
    .then(payment => res.status(200).send(payment))
    .catch(err => res.status(400).send(err));
});

/**
 * @api {get} /payment/pay Get Payments
 * @apiName getAllPayments
 * @apiGroup Payment
 * @apiVersion 0.3.2
 *
 * @apiHeader {String} Authorization The jsonwebtoken given on <code>/public/sign-in</code> preceded by <code>Bearer</code>
 *
 * @apiSuccess {Object[]} payments All Payments made by this User <a>https://stripe.com/docs/api/node#list_charges</a>.
 * @apiUse DatabaseError
 * @apiUse UserNotConnected
 * @apiUse StripeError
 */
router.get('/pay', (req, res) => {
  const user = req.loadedUser;

  paymentService.getAllPayments(user.account.paymentId)
    .then(payments => res.status(200).send(payments.data))
    .catch(err => res.status(400).send(err));
});

module.exports = router;
