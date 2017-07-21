const db = require('../database');

const add = (fields) => {
  return new Promise((resolve, reject) => {
    const newBlacklist = new db.Blacklists(fields);

    newBlacklist.save((err) => {
      if (err) {
        let message;
        console.log(err);
        if (err.code === 11000) { message = 'This blacklist already exists'; } else { message = 'Invalid data'; }
        return reject({ code: 1, message });
      }

      resolve(newBlacklist);
    });
  });
};

const findByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.Blacklists
      .findOne({ email })
      .lean()
      .exec((err, blacklist) => {
        if (err) { return reject({ code: 1, message: err.message }); }

        resolve(blacklist);
      });
  });
};


module.exports = { add, findByEmail };
