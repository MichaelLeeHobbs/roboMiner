'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var worldCtrlStub = {
  index: 'worldCtrl.index',
  show: 'worldCtrl.show',
  create: 'worldCtrl.create',
  update: 'worldCtrl.update',
  destroy: 'worldCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var worldIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './world.controller': worldCtrlStub
});

describe('World API Router:', function() {

  it('should return an express router instance', function() {
    worldIndex.should.equal(routerStub);
  });

  describe('GET /api/worlds', function() {

    it('should route to world.controller.index', function() {
      routerStub.get
        .withArgs('/', 'worldCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/worlds/:id', function() {

    it('should route to world.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'worldCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/worlds', function() {

    it('should route to world.controller.create', function() {
      routerStub.post
        .withArgs('/', 'worldCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/worlds/:id', function() {

    it('should route to world.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'worldCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/worlds/:id', function() {

    it('should route to world.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'worldCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/worlds/:id', function() {

    it('should route to world.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'worldCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
