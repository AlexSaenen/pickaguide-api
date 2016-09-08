var express = require('express');
var config = require('config');

var app = express();
var server;

function run(next) {

  app.use('/', require('./api/routes/public'));

  app.set('port', config.port);
  server = app.listen(app.get('port'), function () {
    console.log('Express server listening on %d', app.get('port'));
    if (next) return next(app);
  });
}

if (require.main === module) {
  run();
}

var stop = function (next) {
  if (server) {
    console.log('Stop server');
    server.close(next);
  }
};

module.exports.start = run;
module.exports.stop = stop;