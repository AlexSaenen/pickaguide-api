'use strict';

const db = require('../database');
const Handler = require('./_handler').Handler;


class CommentAdvert extends Handler {
  
  static create(userId, idAdvert, reqBody) {
    return new Promise((resolve, reject) => {
      db.Adverts.findById(idAdvert).exec((err, advert) => {
        if (!advert || err) {
          return reject({ code: 1, message: err });
        }
        
        reqBody.owner = userId;
        const newComment = new db.Comments(reqBody);
        advert.comments.push(newComment);
        advert.save((err) => {
          if (err) return reject({ code: 2, message: err });
          resolve(newComment);
        });
      });
    });
  }
}


exports.CommentAdvert = CommentAdvert;