'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const config = require('config');
const db = require('./api/database/database');
const morgan = require('morgan');

const app = express();
let server;

const run = (next) => {
  db.init()
    .then((err) => {
      if (err) console.error('Could not connect to mongo db', err);
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({extended: false}));

      app.use(morgan('dev'));

      app.use('/public', require('./api/routes/public'));
      app.use('/', require('./api/middleware-service'));
      app.use('/profiles', require('./api/routes/profiles'));
      app.use('/account', require('./api/routes/accounts'));

      app.set('port', config.port);
      server = app.listen(app.get('port'), () => {
        console.log('Express server listening on %d, in %s mode', app.get('port'), app.get('env'));
        return (next ? next(app) : null);
      });
    });
};

if (require.main === module) {
  run();
}

const stop = (next) => {
    if (server) {
        server.close(next);
    }
};

module.exports.start = run;
module.exports.stop = stop;
