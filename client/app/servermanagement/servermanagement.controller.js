'use strict';

(function () {

  class ServerManagementController {

    constructor($http, $scope, socket, Auth) {
      var self = this;
      this.$http = $http;
      this.$scope = $scope;

      this.servers = [];
      this.serverKeys = [];
      this.mcKeys = [];
      this.managerKeys = [];

      this.isEditting = false;
      this.edittingServer = undefined;
      this.edittingItem = undefined;

      this.disabledButtons = {};

      this.activePanelModel = -1;





      this.isLoggedIn = Auth.isLoggedIn;
      this.isAdmin = Auth.isAdmin;
      this.getCurrentUser = Auth.getCurrentUser;


      $http.get('/api/servers').then(response => {
        var servers = response.data;

        servers.forEach(function (server) {
          server.mineCraftProp['rconPassword'] = server.mineCraftProp.rcon.password;
          server.mineCraftProp['rconPort'] = server.mineCraftProp.rcon.port;
          server.mineCraftProp['queryPort'] = server.mineCraftProp.query.port;
          delete server.mineCraftProp.rcon;
          delete server.mineCraftProp.query;
        });

        this.mcKeys = Object.keys(servers[1].mineCraftProp);
        this.managerKeys = Object.keys(servers[1].msmProp);
        this.servers = servers;

        this.servers.forEach(server => {
          server.btnEdit = {
            disabled: true,
            onClick : function (what) {
              server.btnEdit.disabled = true;
              server.btnCancel.disabled = false;
              server.btnSave.disabled = false;
              self.isEditting = true;
              self.edittingServer = server._id;
              self.edittingItem = what;
            }
          };
          server.btnCancel = {
            disabled: true,
            onClick : function () {
              server.btnEdit.disabled  = false;
              server.btnCancel.disabled = true;
              server.btnSave.disabled  = true;
              self.isEditting = false;
              self.edittingServer = undefined;
              self.edittingItem = undefined;
            }
          };
          server.btnSave = {
            disabled: true,
            onClick : function () {
              server.btnEdit.disabled  = false;
              server.btnCancel.disabled = true;
              server.btnSave.disabled  = true;
              self.isEditting = false;
              self.edittingServer = undefined;
              self.edittingItem = undefined;
            }
          }; // end server.btnSave
        }); // end this.servers.forEach(server => {



        // sync disable as this breaks the panels
        //socket.syncUpdates('server', this.servers);
      }); // end $http.get('/api/servers').then(response => {

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

    updateServer(server, update) {
      if (update !== undefined){
        this.$http.put('/api/servers/' + server._id, update);
        return;
      }
      this.$http.put('/api/servers/' + server._id, server);
    }

    startServer(server) {
      this.$http.put('/api/servers/' + server._id + '/start');
    }
    stopServer(server) {
      this.$http.put('/api/servers/' + server._id + '/stop');
    }

    deleteServer(server) {
      //this.$http.delete('/api/servers/' + server._id);
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
