var request = require('supertest');

var expect = require('chai').expect;
var server = require('../index');

describe('Public', function () {

  var app;

  before(function (done) {
    server.start(function (_app) {
      app = _app;
      done();
    });
  });

  after(function (done) {
    server.stop(done);
  });

  describe('GET /', function () {
    it('should return json', function (done) {
      request(app)
        .get('/')
        .expect(200, function (err, res) {
          expect(res.body.json).to.equal('json');
          done(err);
        });

    });
  });

});