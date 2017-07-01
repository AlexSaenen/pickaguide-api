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

          CommentAdvert.findByCommentsAdvert(idAdvert)
            .then(res => resolve(res))
            .catch(error => reject(error));
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
            if (comment.owner.displayName === undefined) {
              comment.owner.displayName = Profile._displayName(comment.owner.profile);
            }

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

  static remove(userId, advertId, commentId) {
    return new Promise((resolve, reject) => {
      CommentAdvert.findByCommentsAdvert(advertId)
        .then((res) => {
          const comment = res.comments.find(nextComment => String(nextComment._id) === commentId && String(nextComment.owner._id) === userId);

          if (comment) {
            const index = res.comments.indexOf(comment);
            res.comments.splice(index, 1);

            db.Adverts
              .findByIdAndUpdate(
                advertId,
                { comments: res.comments },
                { new: true },
                (err) => {
                  if (err) { return reject({ code: 1, message: err.message }); }

                  resolve(res.comments);
                }
              );
          } else {
            return reject({ code: 2, message: 'No such comment' });
          }
        })
        .catch(error => reject(error));
    });
  }

  /*
  Unlike
  */

}


exports.CommentAdvert = CommentAdvert;
