'use strict';
let zipObject = undefined;

class ZipTools {

  constructor(){
    if (zipObject) { return zipObject; }
    zipObject = this;

    // list of acceptable zip file types and their regex matcher - this will match a file path or file
    // .7z, .Z .ar .bz2 .cbz .cpio .ear .gz .lzo .taz.Z .tar.bz2 .tar.gz .tar.lz .tar.lzma .tar.lzo .tar.xz .xz .zip
    // but for now we only support .zip
    this.zipTypes = [
      {key: 'zip', value: /^[\s\S]*\.zip/g},
      {key: '7z', value: /^[\s\S]*\.7z/g},
      {key: 'Z', value: /^[\s\S]*\.Z/g},
      {key: 'ar', value: /^[\s\S]*\.ar/g},
      {key: 'bz2', value: /^[\s\S]*\.bz2/g},
      {key: 'gz', value: /^[\s\S]*\.gz/g},
      {key: 'lzo', value: /^[\s\S]*\.lzo/g},
      {key: 'tar.Z', value: /^[\s\S]*\.tar\.Z/g},
      {key: 'tar.bz2', value: /^[\s\S]*\.tar\.bz2/g},
      {key: 'tar.gz', value: /^[\s\S]*\.tar\.gz/g},
      {key: 'tar.lz', value: /^[\s\S]*\.tar\.lz/g},
      {key: 'tar.lzma', value: /^[\s\S]*\.tar\.lzma/g},
      {key: 'tar.lzo', value: /^[\s\S]*\.tar\.lzo/g},
      {key: 'tar.xz', value: /^[\s\S]*\.tar\.xz/g},
      {key: 'xz', value: /^[\s\S]*\.xz/g},
      {key: 'cbz', value: /^[\s\S]*\.cbz/g},
      {key: 'cpio', value: /^[\s\S]*\.cpio/g},
      {key: 'ear', value: /^[\s\S]*\.ear/g}
      ];
  }

  getFileReader() {
    let reader = undefined;
    return (function () {
      if (!reader) {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
          reader = new FileReader();
        } else {
          alert('The File APIs are not fully supported by your browser. You should REALLY consider upgrading your browser!');
          return undefined
        }
      }
      return reader;
    })()
  }
  readFileAsArrayBuffer(file) {
    let reader = this.getFileReader();
    if (reader === undefined || file === undefined) { return undefined; }

    return new Promise((resolve, reject) => {
      reader.onloadend = function (event) {
        resolve(event.target.result)
      };

      reader.onerror = function (error) {
        reject(error);
      };

      return reader.readAsArrayBuffer(file);
    });
  }

  getZipType(file) {
    let zipType = this.zipTypes.find((type) => {
      return file.name.match(type.value)
    });
    if (zipType){
      return zipType.key
    }
    return undefined
  }

  getZipFolder (file, zipFile){
    let pathArr = this.splitPath(file.path);
    let zipFldr = zipFile;
    for (let i = 0; i < pathArr.length - 1; i++) {
      zipFldr = zipFldr.folder(pathArr[i]);
    }
    return zipFldr;
  };

  splitPath (filePath) {
    let splitPathArr = undefined;
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

  zipFolders(folders) {
    let zipFiles = [];
    let promoiseCollection = [];
    let self = this;

    for (let folder in folders) {
      let zipFile = new JSZip();
      zipFile.name = folder;
      zipFiles.push(zipFile);

      folders[folder].forEach((file) => {
        let promise = self.readFileAsArrayBuffer(file)
        .then((data) => {
          let zipFolder = self.getZipFolder(file, zipFile);
          zipFolder.file(file.name, data);
        });
        promoiseCollection.push(promise);
      });
    }

    return new Promise((resolve, reject) => {
      let results = [];
      Promise.all(promoiseCollection).then(() => {
        zipFiles.forEach((zipFile) => {
          console.log(zipFiles)
          let blob =  zipFile.generate({type: 'blob', compression: "DEFLATE"});
          blob.name = zipFile.name;
          blob.lastModifiedDate = new Date();
          results.push({ name: zipFile.name, blob: blob })
          console.log(results);
        });
      }).then(()=>{
        console.log(results);
        resolve(results);
      });
    })
  }


}

//module.exports = ZipTools;
