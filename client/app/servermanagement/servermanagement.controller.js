'use strict';

(function () {

  class ServerManagementController {

    constructor($http, $scope, socket, Auth) {
      console.log("constructor");
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

      this.btnData = {};

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

        console.log("calling injectButtons")
        this.servers.forEach((server) => {
          this.injectButtons(server);
        }); // end this.servers.forEach(server => {

        // todo sync disable as this breaks the panels
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
      var self = this;
      console.log(self);
      server.btn = {};
      // a space for buttons to share data
      server.btn.data = {};
      server.btn.startServer = {
        disabled: false,
        onClick: function () {
          var self = this;
          console.log('start server');
          self.$http.put('/api/servers/' + server._id + '/start');
          // disable the buttons for 60 seconds to prevent the user from spaming the server with stop/restart
          server.btn.stopServer.disabled = true;
          server.btn.startServer.disabled = true;
          _.delay(()=> {self.server.btn.stopServer.disabled = false;}, 60000);
        } // end func
      }; // end server.btn.startServer
      server.btn.stopServer = {
        disabled: false,
        onClick: function () {
          console.log('stop server');
          self.$http.put('/api/servers/' + server._id + '/stop');
          // disable the buttons for 60 seconds to prevent the user from spaming the server with stop/restart
          self.btn.stopServer.disabled = true;
          self.btn.startServer.disabled = true;
          _.delay(()=> {self.server.btn.startServer.disabled = false;}, 60000);
        }
      }; // end server.btn.stopServer
      server.btn.edit = {
        disabled: false,
        onClick: function (what) {
          // save uneditable items so that we can restore them
          self.btnData[server._id] = {
            name: server.name,
            info: server.info,
            visibility: server.visibility,
            shouldRestart: server.shouldRestart,
            msmProp: _.clone(server.msmProp),
            mineCraftProp: _.clone(server.mineCraftProp)
          };
          server.btn.edit.disabled = true;
          server.btn.cancel.disabled = false;
          server.btn.save.disabled = false;
          self.isEditting = true;
          self.edittingServer = server._id;
          self.edittingItem = what;
        } // end func
      }; // end server.btn.edit
      server.btn.cancel = {
        disabled: true,
        onClick: function () {
          // restore unedit server data
          console.log(self.btnData[server._id].mineCraftProp);
          _.merge(server, self.btnData[server._id]);
          _.merge(server.msmProp, self.btnData[server._id].msmProp);
          _.merge(server.mineCraftProp, self.btnData[server._id].mineCraftProp);
          delete self.btnData[server._id];
          server.btn.edit.disabled = false;
          server.btn.cancel.disabled = true;
          server.btn.save.disabled = true;
          self.isEditting = false;
          self.edittingServer = undefined;
          self.edittingItem = undefined;
        } // end func
      }; // end server.btn.cancel
      server.btn.save = {
        disabled: true,
        onClick: function () {

          switch (self.edittingItem) {
            case 'settings':
              self.updateSettings(server);
              break;
            case 'messages':
              self.updateMessages(server);
              break;
            case 'properties':
              self.updateProperties(server);
              break;
            case 'msm':
              self.updateMsm(server);
              break;
          }// end switch
          server.btn.edit.disabled = false;
          server.btn.cancel.disabled = true;
          server.btn.save.disabled = true;
          self.isEditting = false;
          self.edittingServer = undefined;
          self.edittingItem = undefined;
        } // end function
      }; // end server.btn.save
      server.btn.host = {
        disabled: false,
        onClick: function () {
          // todo impliment host button
        } // end func
      }; // end server.btn.host
      server.btn.port = {
        disabled: false,
        onClick: function () {
          // todo impliment port button
        } // end func
      }; // end server.btn.port
      console.log("test:");
      console.log(server.btn)
    };

    updateSettings(server) {
      console.log(this);
      let update = {
        name: server.name,
        info: server.info,
        visibility: server.visibility,
        shouldRestart: server.shouldRestart,
        msmProp: {
          'msm-stop-delay': server.msmProp['msm-stop-delay'],
          'msm-restart-delay': server.msmProp['msm-restart-delay']
        } // end msmProp
      };// end update
      this.updateServer(server, update);
    }

    updateMessages(server) {
      let update = {
        msmProp: {
          'msm-message-stop': server.msmProp['msm-message-stop'],
          'msm-message-stop-abort': server.msmProp['msm-message-stop-abort'],
          'msm-message-restart': server.msmProp['msm-message-restart'],
          'msm-message-restart-abort': server.msmProp['msm-message-restart-abort'],
          'msm-message-world-backup-started': server.msmProp['msm-message-world-backup-started'],
          'msm-message-world-backup-finished': server.msmProp['msm-message-world-backup-finished'],
          'msm-message-complete-backup-started': server.msmProp['msm-message-complete-backup-started'],
          'msm-message-complete-backup-finished': server.msmProp['msm-message-complete-backup-finished']
        } // end msmProp
      }; // end update
      updatedServer(server, update);
    }

    updateProperties(server) {
      let update = {
        mineCraftProp: server.mineCraftProp
      };
      update.mineCraftProp.rcon = {};
      update.mineCraftProp.rcon.password = server.mineCraftProp.rconPassword;
      delete update.mineCraftProp.rconPassword;
      delete update.mineCraftProp.rconPort;
      delete update.mineCraftProp.queryPort;
      delete update.mineCraftProp['server-port'];
      updatedServer(server, update);
    }

    updateMsm(server) {
      let update = {
        msmProp: server.msmProp
      };
      updatedServer(server, update);
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
      if (update !== undefined) {
        this.$http.put('/api/servers/' + server._id, update);
        return;
      }
      this.$http.put('/api/servers/' + server._id, server);
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
