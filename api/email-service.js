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

let sendEmail = (to, message, subject) => {
  return new Promise((resolve, reject) => {
    nodemailerMailgun.sendMail({
      from: 'equipe@pickaguide.fr',
      to: to,
      subject: subject,
      text: message,
    }, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve('Response: ' + info);
      }
    });
  });
};

module.exports.sendEmailConfirmation = (to) => {
  const message = 'Confirmez votre compte avec ce lien.';
  const subject = 'Confirmation email Pickaguide.fr';
  sendEmail(to, message, subject)
    .then((result) => {
      console.log('Confirmation email has been sent')
    })
    .catch((err) => {
    console.log('Error :', err);
    });
};

this.sendEmailConfirmation('ph.gousse@gmail.com');