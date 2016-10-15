'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const config = require('config');
const db = require('./api/database');

const app = express();
let server;

const publicRoutes = require('./api/routes/public');
const accountRoutes = require('./api/routes/account');

const run = (next) => {
    app.use(bodyParser.json());

    app.use('/', publicRoutes);
    app.use('/account', accountRoutes);

    app.set('port', config.port);
    server = app.listen(app.get('port'), () => {
        console.log(`Express server listening on ${app.get('port')}`);
        return (next ? next(app) : null);
    });
};

if (require.main === module) {
    db.init()
    .then(() => {
        run();
    });
}

const stop = (next) => {
    if (server) {
        server.close(next);
    }
};

module.exports.start = run;
module.exports.stop = stop;
