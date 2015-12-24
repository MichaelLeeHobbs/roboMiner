'use strict';

angular.module('roboMinerApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('srvrManagement', {
        url: '/servermanagement',
        templateUrl: 'app/servermanagement/servermanagement.html',
        controller: 'ServerManagementCtrl',
        controllerAs: 'srvrManagement'
      });
  });
