const express = require('express');
const accountHandler = require('../../handlers/account').Account;

const router = express.Router();

/**
 * @api {get} /public/accounts/ Find All
 * @apiName findAll
 * @apiGroup Account
 * @apiVersion 0.3.2
 *
 * @apiSuccess {String[]} ids ObjectIds of the Accounts (in the same order as <code>accounts</code>).
 * @apiSuccess {Object[]} accounts Information of the Accounts.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "ids": ["59c3df242c257a8b65540282"],
 *       "accounts": [{ email: "john.doe@gmail.com" }]
 *     }
 *
 * @apiUse DatabaseError
 */
router.get('/', (req, res) => {
  accountHandler.findAll()
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.get('/:id/isConfirmed', (req, res) => {
  accountHandler.isConfirmed(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.get('/:ids/areConfirmed', (req, res) => {
  const accountIds = req.params.ids.split(',');
  accountHandler.areConfirmed(accountIds)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});


module.exports = router;
