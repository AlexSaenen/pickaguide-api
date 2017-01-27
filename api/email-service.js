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
  subject: '{{subject}}',
  html: 'Bonjour {{firstname}} {{lastname}}<br><br>' +
  '<a href="{{url}}">{{urlName}}</a>'
}, {
  from: 'equipe@pickaguide.fr',
});

let sendEmail = (account, subject, url, urlName) => {
  return new Promise((resolve, reject) => {
    send({
      to: account.email,
    },{
      subject: subject,
      firstname: account.firstName,
      lastname: account.lastName,
      url: url,
      urlName: urlName
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
  const subject = 'Confirmation email Pickaguide';
  const url = config.host + '/public/verify/' + account._id;
  const urlName = 'Cliquez pour confirmer votre adresse email';
  return new Promise((resolve, reject) => {
    sendEmail(account, subject, url, urlName)
      .then((result) => {
        resolve({
          code: 0,
          message: result
        });
      })
      .catch((err) => {
        reject({
          code: 1,
          message: err
        });
      });
  });
};

exports.sendEmailPasswordReset = (account) => {
  const subject = 'Reset password Pickaguide';
  const url = config.host + '/public/reset/' + account.resetPasswordToken;
  const urlName = 'Cliquez pour changer votre mot de passe';
  return new Promise((resolve, reject) => {
    sendEmail(account, subject, url, urlName)
      .then((result) => {
        resolve({
          code: 0,
          message: result
        });
      })
      .catch((err) => {
        reject({
          code: 1,
          message: err
        });
      });
  });
};