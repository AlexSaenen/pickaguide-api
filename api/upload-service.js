'use strict';

const fs = require('fs');
const db = require('./database');
const mime = require('mime-types');
const path = require('path');
const Grid = require('gridfs-stream');

const MAX_FILE_SIZE = 2097151;
const MAX_FILE_SIZE_STR = '2mb';

exports.maxFileSize = () => {
  return { size: MAX_FILE_SIZE, label: MAX_FILE_SIZE_STR };
};

exports.uploadImage = (pathFile, fileName, mimetype, willUnlink = true) => {
  return new Promise((resolve, reject) => {
    const gfs = Grid(db.conn.db, db.mongo);

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
    const gfs = Grid(db.conn.db, db.mongo);

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

exports.findFileId = (imageName, hash) => {
  return new Promise((resolve, reject) => {
    const gfs = Grid(db.conn.db, db.mongo);

    gfs.files.find({ filename: imageName, md5: hash }).toArray((err, files) => {
      if (files.length === 0 || err) return reject({ code: 1, message: err });

      resolve(files[0]._id);
    });
  });
};

exports.deleteImage = (idImage) => {
  return new Promise((resolve, reject) => {
    const gfs = Grid(db.conn.db, db.mongo);

    gfs.remove({
      _id: idImage,
    }, (err) => {
      if (err) return reject({ code: 1, message: err });

      resolve();
    });
  });
};
