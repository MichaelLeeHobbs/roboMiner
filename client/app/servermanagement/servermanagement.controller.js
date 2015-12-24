'use strict';

(function() {

  class ServerManagementController {

    constructor($http, $scope, socket) {
      this.$http = $http;
      this.servers = [];

      $http.get('/api/servers').then(response => {
        this.servers = response.data;
        console.log('server api test');
        console.log(this.servers);
        socket.syncUpdates('server', this.servers);
      });

      $scope.$on('$destroy', function() {
        socket.unsyncUpdates('server');
      });
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
