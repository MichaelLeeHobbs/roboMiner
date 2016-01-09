'use strict';

(function () {

  class ServerManagementController {
    var self = this;

    constructor($http, $scope, socket, Auth) {
      this.$http = $http;
      this.$scope = $scope;

      this.servers = [];
      this.serverAddons = [];
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
          self.injectButtons(server, self);
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

    injectButtons(server) {
      server.btn = {};
      server.btn.edit = {
        disabled: false,
        onClick : function (what) {
          server.btn.edit.disabled = true;
          server.btn.cancel.disabled = false;
          server.btn.save.disabled = false;
          self.isEditting = true;
          self.edittingServer = server._id;
          self.edittingItem = what;
        }
      }; // end server.btn.edit
      server.btn.cancel = {
        disabled: true,
        onClick : function () {
          server.btn.edit.disabled  = false;
          server.btn.cancel.disabled = true;
          server.btn.save.disabled  = true;
          self.isEditting = false;
          self.edittingServer = undefined;
          self.edittingItem = undefined;
        }
      }; // end server.btn.cancel
      server.btn.save = {
        disabled: true,
        onClick : function () {
          server.btn.edit.disabled  = false;
          server.btn.cancel.disabled = true;
          server.btn.save.disabled  = true;
          self.isEditting = false;
          self.edittingServer = undefined;
          self.edittingItem = undefined;
        }
      }; // end server.btn.save
      server.btn.host = {
        disabled: false,
        onClick: function () {
          // todo impliment host button
        }
      }; // end server.btn.host
      server.btn.port = {
        disabled: false,
        onClick: function () {
          // todo impliment port button
        }
      }; // end server.btn.port
    };



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
