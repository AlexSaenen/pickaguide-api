const db = require('../database');


const findAllFrom = (idUser) => {
  return new Promise((resolve, reject) => {
    db.Notifications
      .find({ forWhom: idUser })
      .lean()
      .exec((err, notifs) => {
        if (err) { return reject({ code: 1, message: err.message }); }

        resolve(notifs);
      });
  });
};

const create = (forWhom, notifBody, by = null) => {
  return new Promise((resolve, reject) => {
    const newNotification = new db.Notifications({
      forWhom,
      by,
      title: notifBody.title,
      body: notifBody.body,
    });

    newNotification.save((err) => {
      if (err) {
        return reject({ code: 1, message: err.message });
      }

      resolve({ code: 0, message: 'Notification created' });
    });
  });
};

const read = (idNotif, idUser) => {
  return new Promise((resolve, reject) => {
    db.Notifications
      .findOneAndUpdate({ _id: idNotif, forWhom: idUser, readAt: null }, { readAt: Date.now() }, (err, notif) => {
        if (err) { return reject({ code: 1, message: err.message }); }
        if (notif === null) { return reject({ code: 2, message: 'No such notification to be read' }); }

        resolve();
      });
  });
};

const readAll = (idUser) => {
  return new Promise((resolve, reject) => {
    db.Notifications
      .update({ forWhom: idUser, readAt: null }, { readAt: Date.now() }, { multi: true }, (err, notif) => {
        if (err) { return reject({ code: 1, message: err.message }); }
        if (notif === null) { return reject({ code: 2, message: 'No such notifications to be read' }); }

        resolve();
      });
  });
};

const hasUnread = (idUser) => {
  return new Promise((resolve, reject) => {
    db.Notifications
      .find({ forWhom: idUser, readAt: null }, '_id')
      .lean()
      .exec((err, notifs) => {
        if (err) { return reject({ code: 1, message: err.message }); }

        resolve({ forWhom: idUser, hasUnread: notifs.length > 0 });
      });
  });
};

module.exports = { create, read, readAll, findAllFrom, hasUnread };
