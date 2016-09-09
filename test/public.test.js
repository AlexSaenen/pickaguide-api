'use strict';

const request = require('supertest');

const expect = require('chai').expect;
const server = require('../index');

describe('Public', () => {
    let app;

    before((done) => {
        server.start((_app) => {
            app = _app;
            done();
        });
    });

    after((done) => {
        server.stop(done);
    });

    describe('GET /', () => {
        it('should return json', (done) => {
            request(app)
            .get('/')
            .expect(200, (err, res) => {
                expect(res.body.json).to.equal('json');
                done(err);
            });
        });
    });
});
