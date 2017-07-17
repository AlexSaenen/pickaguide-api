const db = require('../database');


exports.findInIds = (userIds, selectFields = '', updatable = false) => {
  return new Promise((resolve, reject) => {
    let query = db.Users.find()
      .where('_id')
      .in(userIds)
      .select(selectFields);

    if (updatable === false) {
      query = query.lean();
    }

    query.exec((err, users) => {
      if (err) { return reject({ code: 1, message: err.message }); }

      resolve(users);
    });
  });
};
