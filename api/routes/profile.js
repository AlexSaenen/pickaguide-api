const express = require('express');
const profileHandler = require('../handlers/profile').Profile;
const multer  = require('multer');
const upload = multer({ dest: __dirname + '/../../assets/' });

const router = express.Router();

router.get('/:id', (req, res) => {
  profileHandler.find(req.params.id)
    .then(result => res.status(200).send(result))
    .catch(error => res.status(400).send(error));
});

router.put('/', (req, res) => {
  profileHandler.update(req.user.userId, { profile: req.body })
    .then(result => res.status(200).send({ profile: result.profile }))
    .catch(error => res.status(400).send(error));
});

router.post('/avatar', upload.single('avatar'), (req, res) => {
  profileHandler.upload(req.user.userId, req.file)
    .then(result => res.sendStatus(200))
    .catch(error => res.status(500).send(error));
  
});

router.get('/:id/avatar', (req, res) => {
  const gfs = Grid(db.conn.db);
//write content to file system
  var fs_write_stream = fs.createWriteStream(__dirname + '/../../assets/' + req.params.id + '/write.jpeg');

//read from mongodb
  var readstream = gfs.createReadStream({
    filename: 'mongo_file.jpeg'
  });
  readstream.pipe(fs_write_stream);
  fs_write_stream.on('close', function () {
    console.log('file has been written fully!');
    res.sendStatus(200);
  });
});

module.exports = router;