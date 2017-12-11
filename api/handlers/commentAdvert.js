'use strict';

const commentManager = require('../managers/comment');
const advertManager = require('../managers/advert');
const notifManager = require('../managers/notification');


class CommentAdvert {

  static create(userId, idAdvert, reqBody) {
    return commentManager
      .create(userId, idAdvert, reqBody)
      .then(() => advertManager.find(idAdvert))
      .then((result) => {
        if (String(result.advert.owner._id) !== userId) {
          notifManager.create(result.advert.owner._id, {
            title: 'You got a comment !',
            body: ` left a comment on your advert '${result.advert.title}'`,
          }, userId);
        }
      })
      .then(() => CommentAdvert.findByCommentsAdvert(idAdvert));
  }

  static findByCommentsAdvert(idAdvert) {
    return commentManager.findByCommentsAdvert(idAdvert);
  }

  static toggleLike(idUser, idAdvert, idComment) {
    return commentManager
      .toggleLike(idUser, idAdvert, idComment)
      .then(() => CommentAdvert.findByCommentsAdvert(idAdvert));
  }

  static remove(userId, advertId, commentId) {
    return new Promise((resolve, reject) => {
      commentManager
        .findByCommentsAdvert(advertId)
        .then((res) => {
          const comment = res.comments.find(nextComment => String(nextComment._id) === commentId && String(nextComment.owner._id) === userId);

          if (comment) {
            const index = res.comments.indexOf(comment);
            res.comments.splice(index, 1);

            commentManager
              .findByIdAndUpdate(advertId, { comments: res.comments })
              .then(() => resolve(res.comments))
              .catch(err => reject(err));
          } else {
            return reject({ code: 2, message: 'No such comment' });
          }
        })
        .catch(error => reject(error));
    });
  }

}


exports.CommentAdvert = CommentAdvert;
