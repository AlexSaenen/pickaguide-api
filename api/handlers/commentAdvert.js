'use strict';

const db = require('../database');
const Handler = require('./_handler').Handler;
const Profile = require('./profile').Profile;


class CommentAdvert extends Handler {

  static create(userId, idAdvert, reqBody) {
    return new Promise((resolve, reject) => {
      db.Adverts.findById(idAdvert).exec((err, advert) => {
        if (err) { return reject({ code: 1, message: err.message }); }
        if (advert === null) { return reject({ code: 2, message: 'No such advert' }); }

        reqBody.owner = userId;
        const newComment = new db.Comments(reqBody);
        advert.comments.push(newComment);
        advert.save((saveErr) => {
          if (saveErr) return reject({ code: 3, message: saveErr });
          resolve(newComment);
        });
      });
    });
  }

  static findByCommentsAdvert(idAdvert) {
    return new Promise((resolve, reject) => {
      db.Adverts
        .findById(idAdvert, 'comments')
        .populate({ path: 'comments.owner', select: 'profile.firstName profile.lastName' })
        .lean()
        .exec((err, commentsForAd) => {
          if (err) return reject({ code: 1, message: err.message });

          commentsForAd.comments.forEach((comment) => {
            comment.owner.displayName = Profile._displayName(comment.owner.profile);
            delete comment.owner.profile;
          });

          resolve(commentsForAd);
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

        const comment = advert.comments.id(idComment);
        comment.like += 1;

        advert.save((saveErr) => {
          if (saveErr) return reject({ code: 3, message: saveErr });
          resolve(comment);
        });
      });
    });
  }

  /*
  Unlike and delete
   */
}


exports.CommentAdvert = CommentAdvert;
