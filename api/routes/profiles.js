const express = require('express');
const profileHandler = require('../handlers/profile').Profile;

const router = express.Router();

router.post('/', (req, res) => {
  profileHandler.add(req.body)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send({ err });
    });
});

router.get('/', (req, res) => {
  profileHandler.find(req.headers)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send({ err });
    });
});

// router.get('/', (req, res) => {
//   profileHandler.findAll()
//     .then((result) => {
//       res.status(200).send(result);
//     })
//     .catch((err) => {
//       res.status(500).send({ err });
//     });
// });

router.get('/find', (req, res) => {
  profileHandler.find(req.query)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send({ err });
    });
});

module.exports = router;
