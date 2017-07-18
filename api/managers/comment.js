const db = require('../database');
const displayName = require('./profile').displayName;


const create = (userId, idAdvert, reqBody) => {
  return new Promise((resolve, reject) => {
    db.Adverts.findById(idAdvert).exec((err, advert) => {
      if (err) { return reject({ code: 1, message: err.message }); }
      if (advert === null) { return reject({ code: 2, message: 'No such advert' }); }

      reqBody.owner = userId;
      const newComment = new db.Comments(reqBody);
      advert.comments.push(newComment);
      advert.save((saveErr) => {
        if (saveErr) return reject({ code: 3, message: saveErr });

        resolve();
      });
    });
  });
};

const findByCommentsAdvert = (idAdvert) => {
  return new Promise((resolve, reject) => {
    db.Adverts
      .findById(idAdvert, 'comments')
      .populate({ path: 'comments.owner', select: 'profile.firstName profile.lastName' })
      .lean()
      .exec((err, commentsForAd) => {
        if (err) return reject({ code: 1, message: err.message });

        commentsForAd.comments.forEach((comment) => {
          if (comment.owner.displayName === undefined) {
            comment.owner.displayName = displayName(comment.owner.profile);
          }

          delete comment.owner.profile;
        });

        resolve(commentsForAd);
      });
  });
};

const like = (idAdvert, idComment) => {
  return new Promise((resolve, reject) => {
    db.Adverts
      .findById(idAdvert)
      .exec((err, advert) => {
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
};

const findByIdAndUpdate = (advertId, fields) => {
  return new Promise((resolve, reject) => {
    db.Adverts
      .findByIdAndUpdate(
        advertId,
        fields,
        { new: true },
        (err) => {
          if (err) { return reject({ code: 1, message: err.message }); }

          resolve();
        }
      );
  });
};


module.exports = { create, findByCommentsAdvert, like, findByIdAndUpdate };
