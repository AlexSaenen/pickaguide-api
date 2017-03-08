'use strict';

const fs = require('fs');
const db = require('./database');
const Grid = require('gridfs-stream');
Grid.mongo = db.mongo;

exports.uploadImage = (pathFile, fileName) => {
  return new Promise((resolve, reject) => {
    const gfs = Grid(db.conn.db);
    const writestream = gfs.createWriteStream({
      filename: fileName
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