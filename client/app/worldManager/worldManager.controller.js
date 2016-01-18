'use strict';

angular.module('roboMinerApp')
  .controller('WorldManagerCtrl', function ($scope, Upload, $timeout) {


    $scope.$watch('files', function () {
      $scope.upload($scope.files);
    });
    $scope.$watch('file', function () {
      if ($scope.file != null) {
        $scope.files = [$scope.file];
      }
    });
    $scope.log = '';

    let splitPath = function(filePath) {
      var splitPathArr = undefined
      // *nix/mac
      if (filePath.match(/\//g)) {
        splitPathArr = filePath.split("/");
      }
      // likely windows
      else if (filePath.match(/\\/g)) {
        splitPathArr = filePath.split("\\");
      }
      return splitPathArr;
    };

    let contains = function(search) {
      return function(ele) {
        return ele === search
      }
    };

    $scope.upload = function (files) {
      if (files === undefined) {
        return
      }

      // list of acceptable zip file types
      // .7z, .Z .ar .bz2 .cbz .cpio .ear .gz .lzo .taz.Z .tar.bz2 .tar.gz .tar.lz .tar.lzma .tar.lzo .tar.xz .xz .zip
      // but for now we will only support .zip
      // todo support more zip types
      console.debug(files);
      // get the folder to zip
      let folders = [];
      let zipFiles = [];
      files.forEach((file) => {
        console.debug(file)
        if (file.path.match(/^[\s\S]*\.zip$/g)) {
          if (!zipFiles.some(contains(file.path))) {
            zipFiles.push(file.path);
          }
        }
        else {
          let folder = splitPath(file.path);
          if (!folders.some(contains(folder[0]))) {
            folders.push(folder[0]);
          }
        }
      });
      console.log(folders);
      console.log(zipFiles);

      let zip = new JSZip();
      folders.forEach((ele) => {

        JSZipUtils.getBinaryContent(ele, function(err, data) {
          if(err) {
            throw err; // or handle err
          }
          if (!ele.match(/^[\s\S]*\.zip$/g)) {
            console.log(ele)
            zip = new JSZip(data);
          }


        });
      });
      console.debug(zip)


      return
      if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          if (!file.$error) {
            Upload.upload({
              url: '/api/worlds',
              data: {
                username: $scope.username,
                file: file
              }
            }).then(function (resp) {
              $timeout(function() {
                $scope.log = 'file: ' +
                  resp.config.data.file.name +
                  ', Response: ' + JSON.stringify(resp.data) +
                  '\n' + $scope.log;
              });
            }, null, function (evt) {
              var progressPercentage = parseInt(100.0 *
                evt.loaded / evt.total);
              $scope.log = 'progress: ' + progressPercentage +
                '% ' + evt.config.data.file.name + '\n' +
                $scope.log;
            });
          }
        }
      }
    };
  });

/*
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



 var OSName="Unknown OS";
 if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
 if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
 if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
 if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";
 console.log(OSName)
 */
