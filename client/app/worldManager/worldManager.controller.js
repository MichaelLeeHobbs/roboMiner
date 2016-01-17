'use strict';

angular.module('roboMinerApp')
  .controller('WorldManagerCtrl', function ($scope, Upload) {
    $scope.message = 'Hello';

    $scope.uploadFile = function($files) {
      //$files: an array of files selected, each file has name, size, and type.
      for (var i = 0; i < $files.length; i++) {
        var $file = $files[i];
        Upload.upload({
          url: 'api/worlds',
          file: $file,
          progress: function(e){}
        }).then(function(data, status, headers, config) {
          // file is uploaded successfully
          console.log(data);
        });
      }
    }
  });
