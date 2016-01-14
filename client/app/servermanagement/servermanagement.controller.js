'use strict';

(function () {

  class ServerManagementController {

    constructor($http, $scope, socket, Auth) {
      console.log("constructor");
      this.$http = $http;
      this.$scope = $scope;

      this.serverAddons = [];
      this.serverKeys = [];
      this.mcKeys = [];
      this.managerKeys = [];

      this.isEditting = false;
      this.edittingServer = undefined;
      this.edittingItem = undefined;

      this.btns = {
        data: {
          editing: false,
          editingServer: undefined,
        }
      };


      this.activePanelModel = -1;

      this.isLoggedIn = Auth.isLoggedIn;
      this.isAdmin = Auth.isAdmin;
      this.getCurrentUser = Auth.getCurrentUser;

      $http.get('/api/servers').then(response => {
        console.log(response.data);
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

    updateServer(server) {
      var update = _.clone(server, true);
      update.mineCraftProp.rcon = {};
      update.mineCraftProp.rcon.password = server.mineCraftProp.rconPassword;
      delete update.mineCraftProp.rconPassword;
      delete update.mineCraftProp.rconPort;
      delete update.mineCraftProp.queryPort;
      delete update.mineCraftProp['server-port'];
      delete update.btn;

      this.$http.put('/api/servers/' + server._id, update);
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

    injectButtons(server) {
      let self = this;
      console.log(self)
      console.log("injecting buttons into " + server._id);
      let srvrId = server._id;
      this.btns.data[srvrId] = {
        startServer: { disabled: false },
        stopServer: { disabled: false },
        edit: { disabled: false },
        cancel: { disabled: true },
        save: { disabled: true },
        host: { disabled: false },
        port: { disabled: false },
        restartOnFailure: { disabled: false },
      };
      console.log(this.btns.data);

      server.btn = {
        startServer: {
          onClick() {
            self.$http.put('/api/servers/' + srvrId + '/start');
            self.btns.data[srvrId].startServer.disabled = true;
            self.btns.data[srvrId].stopServer.disabled = true;

            _.delay(()=> {
              self.btns.data[srvrId].stopServer.disabled = false;
            }, 60000);
          },
          isDisabled() {
            return self.btns.data[srvrId].startServer.disabled;
          }
        },
        stopServer: {
          onClick() {
            self.$http.put('/api/servers/' + srvrId + '/stop');
            self.btns.data[srvrId].startServer.disabled = true;
            self.btns.data[srvrId].stopServer.disabled = true;


            _.delay(()=> {
              self.btns.data[srvrId].startServer.disabled = false;
            }, 60000);
          },
          isDisabled() {
            return self.btns.data[srvrId].stopServer.disabled;
          }
        },
        edit: {
          onClick() {
            // save unedited items so that we can restore them
            let server = _.find(self.servers, {'_id': srvrId});
            self.btns.data[srvrId].data = {
              name: server.name,
              info: server.info,
              visibility: server.visibility,
              shouldRestart: server.shouldRestart,
              msmProp: _.clone(server.msmProp),
              mineCraftProp: _.clone(server.mineCraftProp)
            };
            self.btns.data[srvrId].edit.disabled = true;
            self.btns.data[srvrId].cancel.disabled = false;
            self.btns.data[srvrId].save.disabled = false;
            self.btns.data.isEditting = true;
            self.btns.data.edittingServer = server._id;
          },
          isDisabled() {
            return self.btns.data[srvrId].edit.disabled;
          }
        },
        cancel: {
          onClick() {
            // restore unedit server data
            let server = _.find(self.servers, {'_id': srvrId});
            _.merge(server, self.btns.data[srvrId].data);
            _.merge(server.msmProp, self.btns.data[srvrId].data.msmProp);
            _.merge(server.mineCraftProp, self.btns.data[srvrId].data.mineCraftProp);
            delete self.btns.data[srvrId].data;
            self.btns.data[srvrId].edit.disabled = false;
            self.btns.data[srvrId].cancel.disabled = true;
            self.btns.data[srvrId].save.disabled = true;
            self.btns.data.isEditting = false;
            self.btns.data.edittingServer = undefined;
          },
          isDisabled(){
            return self.btns.data[srvrId].cancel.disabled;
          }
        },
        save: {
          onClick() {
            let server = _.find(self.servers, {'_id': srvrId});
            self.updateServer(server);
            self.btns.data[srvrId].edit.disabled = false;
            self.btns.data[srvrId].cancel.disabled = true;
            self.btns.data[srvrId].save.disabled = true;
            self.btns.data.isEditting = false;
            self.btns.data.edittingServer = undefined;
            //self.$scope().$apply();
          },
          isDisabled() {
            return self.btns.data[srvrId].save.disabled;
          }
        },
        host: {
          onClick(){

          },
          isDisabled(){
            return self.btns.data[srvrId].host.disabled;
          }
        },
        port: {
          onClick(){

          },
          isDisabled(){
            return self.btns.data[srvrId].host.disabled;
          }
        },
        restartOnFailure: {
          get: function() {
            return server.shouldRestart;
          },
          onClick(boolean){
            if (!self.btns.data.isEditting || self.btns.data.edittingServer !== server._id) {
              return server.shouldRestart;
            }
            return server.shouldRestart = boolean;
          },
          isDisabled(){
            return self.btns.data[srvrId].restartOnFailure.disabled;
          },
          style(){
            if (!self.btns.data.isEditting || self.btns.data.edittingServer != server._id) {
              return {
                "cursor": "not-allowed",
                "pointer-events": "none !important",
                "background-color": "#EEEEEE"
              }
            }
            return {}
          }
        }
      };
    }
  }

  angular.module('roboMinerApp')
    .controller('ServerManagementCtrl', ServerManagementController);

})();
