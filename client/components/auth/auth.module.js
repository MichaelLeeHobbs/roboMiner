'use strict';

angular.module('roboMinerApp.auth', [
  'roboMinerApp.constants',
  'roboMinerApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
