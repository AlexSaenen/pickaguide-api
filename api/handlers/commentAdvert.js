'use strict';

const commentManager = require('../managers/comment');


class CommentAdvert {

  static create(userId, idAdvert, reqBody) {
    return commentManager
      .create(userId, idAdvert, reqBody)
      .then(() => CommentAdvert.findByCommentsAdvert(idAdvert));
  }

  static findByCommentsAdvert(idAdvert) {
    return commentManager.findByCommentsAdvert(idAdvert);
  }

  /*
  Need to store the list of users who liked a post
   */
  static like(idAdvert, idComment) {
    return commentManager.like(idAdvert, idComment);
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

  /*
  Unlike
  */

}


exports.CommentAdvert = CommentAdvert;
