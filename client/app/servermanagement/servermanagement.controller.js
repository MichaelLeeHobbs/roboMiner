'use strict';

(function() {

  class ServerManagementController {

    constructor($http, $scope, socket) {
      this.$http = $http;
      this.servers = [];
      this.serverKeys = [];
      this.mcKeys = [];
      this.managerKeys = [];

      $http.get('/api/servers').then(response => {
        this.servers = response.data;
        console.log('server api test');
        console.log(this.servers);
        this.mcKeys = Object.keys(this.servers[1].mineCraftProp);
        this.managerKeys = Object.keys(this.servers[1].msmProp);


        console.log(this.mcKeys);
        socket.syncUpdates('server', this.servers);
      });

      $http.get('/api/servers/keys').then(response => {
        this.serverKeys = response.data;
      });

      $scope.$on('$destroy', function() {
        socket.unsyncUpdates('server');
      });
    }

    cleanProperty(prop) {
      prop = prop.replace('msm-', '');
      prop = prop.replace('message', 'msg');
      prop = prop.replace('-', ' ');
      return prop;
    }

    addServer() {
      if (this.newServer) {
        this.$http.post('/api/servers', { name: this.newServer });
        this.newServer = '';
      }
    }

    deleteServer(server) {
      this.$http.delete('/api/servers/' + server._id);
    }

    restartServer(server) {
      this.$http.put('/api/servers/' + server.name + '/restart')
        .then(function (result){
          console.log('result');
          console.log(result);
        })
    }
  }

  angular.module('roboMinerApp')
    .controller('ServerManagementCtrl', ServerManagementController);

})();
