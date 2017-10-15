const express = require('express');
const accountHandler = require('../handlers/account').Account;

const router = express.Router();

/**
 * @apiDefine UserNotFound
 * @apiError (400) UserNotFound Could not find the concerned user with the given information.
 */


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

/**
 * @api {post} /accounts/signout Signout
 * @apiName signout
 * @apiGroup Account
 * @apiVersion 0.3.2
 *
 * @apiHeader {String} Authorization The jsonwebtoken given on <code>/public/sign-in</code> preceded by <code>Bearer</code>
 * @apiParam {String} email The email of the user
 * @apiParam {String} password The password of the user
 *
 * @apiSuccess {Number} code Code representing the status of the request.
 * @apiSuccess {String} message A message to indicate if the Account has been deleted.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "code": 0,
 *       "message": "Account deleted"
 *     }
 *
 * @apiUse DatabaseError
 * @apiUse UserNotFound
 */
router.post('/signout', (req, res) => {
  accountHandler.remove(req.user.userId, req.body)
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
