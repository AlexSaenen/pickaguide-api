const express = require('express');
const multer = require('multer');
const mime = require('mime-types');
const path = require('path');
const advertHandler = require('../handlers/advert').Advert;
const visitHandler = require('../handlers/visit').Visit;
const commentAdvert = require('../handlers/commentAdvert').CommentAdvert;

const upload = multer({
  fileFilter(req, file, cb) {
    if (!mime.extension(file.mimetype).match(/^(jpeg|jpg|png|gif)$/)) {
      return cb(new Error(`The mimetype is not valid : ${file.mimetype}`));
    }

    cb(null, true);
  },
  dest: path.join(__dirname, '/../../assets/'),
});

const filesUpload = upload.any();
const router = express.Router();


/**
 * @api {post} /adverts/ Create Advert
 * @apiName create
 * @apiGroup Advert
 * @apiVersion 0.3.2
 *
 * @apiHeader {String} Authorization The jsonwebtoken given on <code>/public/sign-in</code> preceded by <code>Bearer</code>
 * @apiParam {String} title The title of the advert
 * @apiParam {String} country The country where the advert places the visit
 * @apiParam {String} city The city for the visit
 * @apiParam {String} description The description of the advert
 * @apiParam {String} photoUrl The web url to the cover for the advert
 *
 * @apiSuccess {Number} code Code representing the status of the request.
 * @apiSuccess {String} message A message to indicate if the Advert has been created.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "code": 0,
 *       "message": "Advert created"
 *     }
 *
 * @apiUse DatabaseError
 * @apiUse UserNotFound
 */
router.post('/', (req, res) => {
  filesUpload(req, res, (err) => {
    if (err) return res.status(400).send({ code: 1, message: 'The mimetype is not valid must be jpeg|jpg|png|gif' });
    advertHandler.create(req.user.userId, JSON.parse(req.body.proposalForm), req.files)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
  });
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
  filesUpload(req, res, (err) => {
    if (err) return res.status(400).send({ code: 1, message: 'The mimetype is not valid must be jpeg|jpg|png|gif' });
    let form = req.body.proposalForm;

    if (typeof form === 'string') {
      form = JSON.parse(form);
    }

    advertHandler.update(req.user.userId, req.params.id, form, req.files)
      .then(result => res.status(200).send(result))
      .catch(error => res.status(500).send(error));
  });
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

router.get('/geo/:distance', (req, res) => {
  advertHandler.findNear(req.user.userId, req.params.distance)
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
