'use strict';

const notificationManager = require('../managers/notification');


class Notification {

  static findAllFrom(idUser) {
    return notificationManager.findAllFrom(idUser);
  }

  static hasUnread(idUser) {
    return notificationManager.hasUnread(idUser);
  }

  static read(idNotif, idUser) {
    return new Promise((resolve, reject) => {
      notificationManager.read(idNotif, idUser)
        .then(() => notificationManager.findAllFrom(idUser))
        .then(notifications => resolve({ notifications }))
        .catch(err => reject(err));
    });
  }

  static readAll(idUser) {
    return new Promise((resolve, reject) => {
      notificationManager.readAll(idUser)
        .then(() => notificationManager.findAllFrom(idUser))
        .then(notifications => resolve({ notifications }))
        .catch(err => reject(err));
    });
  }

}

exports.Notification = Notification;
