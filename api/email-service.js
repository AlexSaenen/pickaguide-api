'use strict';

const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const config = require('config');

const auth = {
  auth: {
    api_key: config.mailgun.apiKey,
    domain: 'mg.pickaguide.fr'
  }
};

const nodemailerMailgun = nodemailer.createTransport(mg(auth));
let send = nodemailerMailgun.templateSender({
  subject: 'Confirmation email Pickaguide',
  html: 'Bonjour {{firstname}} {{lastname}}<br><br>' +
  '<a href="{{url}}">Cliquez pour confirmer votre adresse email</a>'
}, {
  from: 'equipe@pickaguide.fr',
});

let sendEmail = (account, url) => {
  return new Promise((resolve, reject) => {
    send({
      to: account.email,
    },{
      firstname: account.firstName,
      lastname: account.lastName,
      url: url
    }, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
};

exports.sendEmailConfirmation = (account) => {
  let url = config.host + '/public/verify/' + account._id;
  sendEmail(account, url)
    .then((result) => {
      console.log('Confirmation email has been sent')
    })
    .catch((err) => {
      console.log('Error :', err);
    });
};