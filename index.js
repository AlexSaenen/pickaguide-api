'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const expressJwt = require('express-jwt');
const config = require('config');
const morgan = require('morgan');
const cors = require('cors');
const db = require('./api/database');

const app = express();
let server;

const run = (next) => {
  db.init()
    .then(() => {
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({extended: false}));

      app.use(morgan('dev'));

      app.use(cors());
      app.use('/public', require('./api/routes/public'));

      app.use('/', expressJwt({secret: config.jwtSecret}).unless({ path: ['/public'] }));
      app.use((err, req, res, next) => {
        if (err.name === 'UnauthorizedError') { res.status(401).send('invalid token.'); }
      });

      app.use('/', require('./api/handlers/account').Account.isAuthorise);
      app.use('/profile', require('./api/routes/profile'));
      app.use('/account', require('./api/routes/account'));

      app.set('port', config.port);
      server = app.listen(app.get('port'), () => {
        console.log('Express server listening on %d, in %s mode', app.get('port'), app.get('env'));
        if (next) next(null, app);
      });
    })
    .catch((err) => {
      console.error('Could not init the database:', Object.keys(err));
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
