'use strict';

angular.module('roboMinerApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('worldManager', {
        url: '/worldManager',
        templateUrl: 'app/worldManager/worldManager.html',
        controller: 'WorldManagerCtrl'
      });
  });
