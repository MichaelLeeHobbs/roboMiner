'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var hostCtrlStub = {
  index: 'hostCtrl.index',
  show: 'hostCtrl.show',
  create: 'hostCtrl.create',
  update: 'hostCtrl.update',
  destroy: 'hostCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var hostIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './host.controller': hostCtrlStub
});

describe('Host API Router:', function() {

  it('should return an express router instance', function() {
    hostIndex.should.equal(routerStub);
  });

  describe('GET /api/hosts', function() {

    it('should route to host.controller.index', function() {
      routerStub.get
        .withArgs('/', 'hostCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/hosts/:id', function() {

    it('should route to host.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'hostCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/hosts', function() {

    it('should route to host.controller.create', function() {
      routerStub.post
        .withArgs('/', 'hostCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/hosts/:id', function() {

    it('should route to host.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'hostCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/hosts/:id', function() {

    it('should route to host.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'hostCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/hosts/:id', function() {

    it('should route to host.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'hostCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
