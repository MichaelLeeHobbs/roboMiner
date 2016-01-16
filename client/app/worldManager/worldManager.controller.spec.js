'use strict';

describe('Controller: WorldManagerCtrl', function () {

  // load the controller's module
  beforeEach(module('roboMinerApp'));

  var WorldManagerCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    WorldManagerCtrl = $controller('WorldManagerCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
