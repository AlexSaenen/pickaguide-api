'use strict';

const fs = require('fs');
const db = require('./database');
const mime = require('mime-types');
const path = require('path');
const Grid = require('gridfs-stream');

const MAX_FILE_SIZE = 5242880;
const MAX_FILE_SIZE_STR = '5mb';

Grid.mongo = db.mongo;

exports.maxFileSize = () => {
  return { size: MAX_FILE_SIZE, label: MAX_FILE_SIZE_STR };
};

exports.uploadImage = (pathFile, fileName, mimetype, willUnlink = true) => {
  return new Promise((resolve, reject) => {
    const gfs = Grid(db.conn.db);

    const writestream = gfs.createWriteStream({
      filename: fileName,
      content_type: mimetype,
    });
    fs.createReadStream(pathFile).pipe(writestream);
    writestream.on('close', (file) => {
      if (willUnlink) {
        fs.unlink(pathFile, ((err) => {
          if (err) return reject({ code: 1, message: err });
          resolve(file._id);
        }));
      } else {
        resolve(file._id);
      }
    });
  });
};

exports.downloadImage = (idImage) => {
  return new Promise((resolve, reject) => {
    const gfs = Grid(db.conn.db);

    gfs.files.find({ _id: idImage }).toArray((err, files) => {
      if (files.length === 0 || err) return reject({ code: 1, message: err });

      const name = `${idImage}_${Date.now()}.${mime.extension(files[0].contentType)}`;
      const fsWriteStream = fs.createWriteStream(path.join(path.join(__dirname, '/../assets/'), name));
      const readstream = gfs.createReadStream({
        _id: idImage,
      });

      readstream.pipe(fsWriteStream);
      fsWriteStream.on('close', () => {
        resolve(path.resolve(path.join(path.join(__dirname, '/../assets/'), name)));
      });
    });
  });
};

exports.deleteImage = (idImage) => {
  return new Promise((resolve, reject) => {
    const gfs = Grid(db.conn.db);

    gfs.remove({
      _id: idImage,
    }, (err) => {
      if (err) return reject({ code: 1, message: err });

      resolve();
    });
  });
};
