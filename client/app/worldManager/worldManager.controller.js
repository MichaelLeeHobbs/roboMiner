'use strict';

//let ZipTools = require('../libraries/zipTools.js');

/**
 * Check for the various File API support.
 */
var reader
function checkFileAPI() {
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    reader = new FileReader();
    return true;
  } else {
    alert('The File APIs are not fully supported by your browser. Fallback required.');
    return false;
  }
}

/**
 * read text input
 */
function readText(filePath, callback) {
  var output = ""; //placeholder for text output
  if(filePath) {
    reader.onload = function (e) {
      output = e.target.result;
      console.log(output)
      callback(output)
      //displayContents(output);
    };//end onload()
    reader.readAsBinaryString(filePath);
  }//end if html5 filelist support
  else if(ActiveXObject && filePath) { //fallback to IE 6-8 support via ActiveX
    try {
      reader = new ActiveXObject("Scripting.FileSystemObject");
      var file = reader.OpenTextFile(filePath, 1); //ActiveX File Object
      output = file.ReadAll(); //text contents of file
      file.Close(); //close file "input stream"
      displayContents(output);
    } catch (e) {
      if (e.number == -2146827859) {
        alert('Unable to access local files due to browser security settings. ' +
          'To overcome this, go to Tools->Internet Options->Security->Custom Level. ' +
          'Find the setting for "Initialize and script ActiveX controls not marked as safe" and change it to "Enable" or "Prompt"');
      }
    }
  }
  else { //this is where you could fallback to Java Applet, Flash or similar
    return false;
  }
  return true;
}

function getNewReader() {
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    return new FileReader();
  } else {
    alert('The File APIs are not fully supported by your browser. You should REALLY consider upgrading your browser!');
    return undefined
  }
}

function readFileAsBinaryString(file) {
  let reader = getNewReader();
  if (reader === undefined || file === undefined) { return undefined; }

  return new Promise((resolve, reject) => {
    reader.onload = function (e) {
      resolve(e.target.result)
    };
    return reader.readAsBinaryString(file);
  });
}

angular.module('roboMinerApp')
  .controller('WorldManagerCtrl', function ($scope, Upload, $timeout) {
    let zipTools = new ZipTools();


    $scope.$watch('files', function () {
      $scope.upload($scope.files);
    });
    $scope.$watch('file', function () {
      if ($scope.file != null) {
        $scope.files = [$scope.file];
      }
    });
    $scope.log = '';

    $scope.upload = function (files) {
      if (files === undefined) {
        return
      }


      // todo support more zip types
      console.debug(files);
      // get the folder to zip
      let folders = {};
      let zipFiles = [];
      files.forEach((file, i, arr) => {
        console.debug(file);

        // if zip then put it in our zip file collection to be handled separately
        if (zipTools.getZipType(file) === 'zip') {
          zipFiles.push({name: file.name, blob: file});
          delete arr[i];
        }

        // if file has path then it is in a folder
        else if (file.path) {
          let folder = zipTools.splitPath(file.path)[0];
          if (folders[folder] !== undefined) {
            folders[folder].push(file);
          } else {
            folders[folder] = [];
            folders[folder].push(file);
          }
        }
        // else alert user this file/object is unhandled as we expect only folders and zip files
        else {
          // todo alert use
        }
      });

      zipTools.zipFolders(folders).then((zipObjects) => {
        console.log(zipObjects);
        let uploads = zipObjects.concat(zipFiles);
        console.log(uploads);
        uploads.forEach((uploadObj) =>{
          Upload.upload({
            url: '/api/worlds',
            data: {
              username: $scope.username,
              file: uploadObj.blob
            }
          }).then(function (resp) {
            $timeout(function () {
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
        })

      });
    }
  });
