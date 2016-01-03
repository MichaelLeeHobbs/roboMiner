'use strict';

(function () {

  class ServerManagementController {

    constructor($http, $scope, socket, Auth) {
      this.$http = $http;

      this.servers = [];
      this.serverKeys = [];
      this.mcKeys = [];
      this.managerKeys = [];

      this.activePanel = -1;
      this.activePanelModel = -1;

      this.panels = {};
      this.panels.activePanel = -1;
      this.$scope = $scope;

      var self = this;

      this.isLoggedIn = Auth.isLoggedIn;
      this.isAdmin = Auth.isAdmin;
      this.getCurrentUser = Auth.getCurrentUser;


      $http.get('/api/servers').then(response => {
        var servers = response.data;


        console.log(this.servers);

        servers.forEach(function (server) {
          console.log(server);
          server.mineCraftProp['rconPassword'] = server.mineCraftProp.rcon.password;
          server.mineCraftProp['rconPort'] = server.mineCraftProp.rcon.port;
          server.mineCraftProp['queryPort'] = server.mineCraftProp.query.port;
          delete server.mineCraftProp.rcon;
          delete server.mineCraftProp.query;
          console.log(server);
        });

        this.mcKeys = Object.keys(servers[1].mineCraftProp);
        this.managerKeys = Object.keys(servers[1].msmProp);
        this.servers = servers;



        // sync disable as this breaks the panels
        //socket.syncUpdates('server', this.servers);
      });

      $http.get('/api/servers/keys').then(response => {
        this.serverKeys = response.data;
      });

      $scope.$on('$destroy', function () {
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
        this.$http.post('/api/servers', {name: this.newServer});
        this.newServer = '';
      }
    }

    deleteServer(server) {
      this.$http.delete('/api/servers/' + server._id);
    }

    restartServer(server) {
      this.$http.put('/api/servers/' + server.name + '/restart')
        .then(function (result) {
          console.log('result');
          console.log(result);
        })
    }
  }

  angular.module('roboMinerApp')
    .controller('ServerManagementCtrl', ServerManagementController);

})();
