'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const config = require('config');
const morgan = require('morgan');
const cors = require('cors');
const db = require('./api/database');

const app = express();
let server;

const run = (next) => {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));

  app.use(morgan('dev'));

  app.use(cors());
  app.use('/public', require('./api/routes/public'));
  app.use('/', require('./api/middleware-service'));
  // app.use('/profile', require('./api/routes/profile'));
  // app.use('/account', require('./api/routes/account'));

  app.set('port', config.port);
  server = app.listen(app.get('port'), () => {
    console.log('Express server listening on %d, in %s mode', app.get('port'), app.get('env'));
    if (next) next(null, app);
  });
};

if (require.main === module) {
  db.init()
    .then(() => {
      run();
    })
    .catch((excep) => {
      console.log(`Could not init the database: ${excep}`);
    });
}

const stop = (next) => {
  if (server) {
    server.close(next);
  }
};

module.exports.start = run;
module.exports.stop = stop;
