'use strict';

var app = require('../..');
import request from 'supertest';

var newHost;

describe('Host API:', function() {

  describe('GET /api/hosts', function() {
    var hosts;

    beforeEach(function(done) {
      request(app)
        .get('/api/hosts')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          hosts = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      hosts.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/hosts', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/hosts')
        .send({
          name: 'New Host',
          info: 'This is the brand new host!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newHost = res.body;
          done();
        });
    });

    it('should respond with the newly created host', function() {
      newHost.name.should.equal('New Host');
      newHost.info.should.equal('This is the brand new host!!!');
    });

  });

  describe('GET /api/hosts/:id', function() {
    var host;

    beforeEach(function(done) {
      request(app)
        .get('/api/hosts/' + newHost._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          host = res.body;
          done();
        });
    });

    afterEach(function() {
      host = {};
    });

    it('should respond with the requested host', function() {
      host.name.should.equal('New Host');
      host.info.should.equal('This is the brand new host!!!');
    });

  });

  describe('PUT /api/hosts/:id', function() {
    var updatedHost;

    beforeEach(function(done) {
      request(app)
        .put('/api/hosts/' + newHost._id)
        .send({
          name: 'Updated Host',
          info: 'This is the updated host!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedHost = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedHost = {};
    });

    it('should respond with the updated host', function() {
      updatedHost.name.should.equal('Updated Host');
      updatedHost.info.should.equal('This is the updated host!!!');
    });

  });

  describe('DELETE /api/hosts/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/hosts/' + newHost._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when host does not exist', function(done) {
      request(app)
        .delete('/api/hosts/' + newHost._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
