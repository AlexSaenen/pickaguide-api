'use strict';

const express = require('express');
const config = require('config');

const app = express();
let server;

const publicRoutes = require('./api/routes/public');

const run = (next) => {
    app.use('/', publicRoutes);

    app.set('port', config.port);
    server = app.listen(app.get('port'), () => {
        console.log(`Express server listening on ${app.get('port')}`);
        return (next ? next(app) : null);
    });
};

if (require.main === module) {
    run();
}

const stop = (next) => {
    if (server) {
        console.log('Stop server');
        server.close(next);
    }
};

module.exports.start = run;
module.exports.stop = stop;
