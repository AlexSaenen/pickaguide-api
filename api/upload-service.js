'use strict';

const fs = require('fs');
const db = require('./database');
const mime = require('mime-types');
const path = require('path');
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
        if (err) return reject({ code: 1, message: err });
        resolve(file._id);
      }));
    });
  });
};

exports.downloadImage = (idImage) => {
  return new Promise((resolve, reject) => {
    const gfs = Grid(db.conn.db);
  
    gfs.files.find({_id: idImage}).toArray((err, files) => {
      if (files.length == 0 || err) return reject({ code: 1, message: err});
      
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

exports.deleteImage = (idImage) => {
  return new Promise((resolve, reject) => {
    const gfs = Grid(db.conn.db);
    
    gfs.remove({
      _id: idImage
    }, (err) => {
      if (err) return reject({ code: 1, message: err});
      
      resolve();
    });
  });
};