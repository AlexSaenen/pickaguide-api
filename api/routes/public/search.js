const express = require('express');
const profileHandler = require('../../handlers/profile').Profile;
const accountHandler = require('../../handlers/account').Account;
const advertHandler = require('../../handlers/advert').Advert;

const router = express.Router();

router.get('/filter/:userId/:search', (req, res) => {
  Promise.all([
    profileHandler.search(req.params.search, req.params.userId),
    advertHandler.search(req.params.search, req.params.userId),
  ])
    .then(results =>
      accountHandler.areConfirmed(results[0].ids)
        .then((areConfirmedRes) => {
          areConfirmedRes.ids = areConfirmedRes.ids.map(String);
          const orderedAreConfirmed = results[0].ids.map(String).map(id =>
            areConfirmedRes.areConfirmed[areConfirmedRes.ids.indexOf(id)]
          );

          res.status(200).send({
            profiles: results[0].profiles,
            ids: results[0].ids,
            adverts: results[1],
            areConfirmed: orderedAreConfirmed,
          });
        })
    )
    .catch(error => res.status(400).send(error));
});

router.get('/filter/:search', (req, res) => {
  Promise.all([
    profileHandler.search(req.params.search),
    advertHandler.search(req.params.search),
  ])
    .then(results =>
      accountHandler.areConfirmed(results[0].ids)
        .then((areConfirmedRes) => {
          areConfirmedRes.ids = areConfirmedRes.ids.map(String);
          const orderedAreConfirmed = results[0].ids.map(String).map(id =>
            areConfirmedRes.areConfirmed[areConfirmedRes.ids.indexOf(id)]
          );

          res.status(200).send({
            profiles: results[0].profiles,
            ids: results[0].ids,
            adverts: results[1],
            areConfirmed: orderedAreConfirmed,
          });
        })
    )
    .catch(error => res.status(400).send(error));
});

module.exports = router;
