const express = require('express');
const userHandler = require('../handlers/user').User;
const profileHandler = require('../handlers/profile').Profile;
const visitHandler = require('../handlers/visit').Visit;
const advertHandler = require('../handlers/advert').Advert;
const commentAdvert = require('../handlers/commentAdvert').CommentAdvert;



const router = express.Router();


router.get('/', (req, res) => {
  visitHandler.findAllFrom(req.user.userId)
    .then(result => result.filter(visite => visite.hasEnded))
    .then(result => res.status(200).send(result))
    .catch(error => res.status(500).send(error));
});


module.exports = router;