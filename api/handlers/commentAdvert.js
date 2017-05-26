'use strict';

const db = require('../database');
const Handler = require('./_handler').Handler;


class CommentAdvert extends Handler {
  
  static create(userId, idAdvert, reqBody) {
    return new Promise((resolve, reject) => {
      db.Adverts.findById(idAdvert).exec((err, advert) => {
        if (err) { return reject({ code: 1, message: err.message }); }
        if (advert === null) { return reject({ code: 2, message: 'No such advert' }); }
        
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
  
  static findByCommentsAdvert(idAdvert) {
    return new Promise((resolve, reject) => {
      db.Adverts.findById(idAdvert, 'comments').exec((err, comments) => {
        if (err) return reject({ code:1, message: err.message});
        resolve(comments);
      });
    });
  }
  
  /*
  Need to store the list of users who liked a post
   */
  static like(idAdvert, idComment) {
    return new Promise((resolve, reject) => {
      db.Adverts.findById(idAdvert).exec((err, advert) => {
        if (err) { return reject({ code: 1, message: err.message }); }
        if (advert === null) { return reject({ code: 2, message: 'No such advert' }); }
        
        let comment = advert.comments.id(idComment);
        comment.like++;
        
        advert.save((err) => {
          if (err) return reject({ code: 2, message: err });
          resolve(comment);
        });
      });
    });
  }
}


exports.CommentAdvert = CommentAdvert;