'use strict';

angular.module('roboMinerApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('servermanagement', {
        url: '/servermanagement',
        templateUrl: 'app/servermanagement/servermanagement.html',
        controller: 'ServermanagementCtrl'
      });
  });
