const natural = require('natural');

const TfIdf = natural.TfIdf;


const matchAdverts = (interests, adverts) => {
  const tf = new TfIdf();

  adverts.forEach((advert) => {
    tf.addDocument(advert.description);
  });

  const measures = [];

  tf.tfidfs(interests, (i, measure) => {
    measures.push({ index: i, measure });
  });

  measures.sort((a, b) => {
    return a.measure - b.measure;
  });

  const sortedAdverts = [];

  measures.forEach((el) => {
    sortedAdverts.push(adverts[el.index]);
  });

  return sortedAdverts;
};

const matchUsers = (interests, users) => {
  const tf = new TfIdf();

  users.forEach((user) => {
    tf.addDocument(user.profile.description);
  });

  const measures = [];

  tf.tfidfs(interests, (i, measure) => {
    measures.push({ index: i, measure });
  });


  measures.sort((a, b) => {
    return b.measure - a.measure;
  });

  const sortedUsers = [];

  measures.forEach((el) => {
    sortedUsers.push(users[el.index]);
  });

  console.log(sortedUsers);

  return sortedUsers;
};

module.exports = { matchAdverts, matchUsers };
