'use strict';

const fs = require('fs');
const db = require('./database');
const mime = require('mime-types');
var path = require('path');
const Grid = require('gridfs-stream');
Grid.mongo = db.mongo;

exports.uploadImage = (pathFile, fileName, mimetype) => {
  return new Promise((resolve, reject) => {
    const gfs = Grid(db.conn.db);
    const writestream = gfs.createWriteStream({
      filename: fileName,
      content_type: mimetype
    });
    fs.createReadStream(pathFile).pipe(writestream);
    writestream.on('close', function (file) {
      fs.unlink(pathFile, (err => {
        if (err) reject({ code: 1, message: err });
        resolve(file._id);
      }));
    });
  });
};

exports.downloadImage = (idImage) => {
  return new Promise((resolve, reject) => {
    const gfs = Grid(db.conn.db);
  
    gfs.files.find({_id: idImage}).toArray(function (err, files) {
      if (err) reject({ code: 1, message: err});
      let name = idImage + '.' + mime.extension(files[0].contentType);
      let fs_write_stream = fs.createWriteStream(__dirname + '/../assets/' + name);
      const readstream = gfs.createReadStream({
        _id: idImage
      });
      readstream.pipe(fs_write_stream);
      fs_write_stream.on('close', function () {
        resolve(path.resolve(__dirname + '/../assets/' + name))
      });
    });
  });
};