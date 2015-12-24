var MSM = require('../../libraries/msm.js/server.js');
export default class ServerManager {
  constructor(pollInterval) {
    this.servers = [];
    this.pollInterval = pollInterval || 5000;
    this.intervalID;
  }

  addServer(server) {
    // server names must be unique
    this.servers.find(function (ele) {
      if (server.name === ele.name) {
        return false;
      }
    });
    this.servers.push(server);
    // todo tell msm to create a new server
  }

  deleteServer(server) {
    var found = false;
    this.servers.find(function (ele, i, arr) {
      if (server.name === ele.name) {
        arr.splice(i, 1);
        found = true;
      }
    });
    var next = function (err, result) {
      if (!err) {
        console.log('Result of stopping server: ' + result);
        return;
      }
      console.log('Error stopping server: ' + err);
    };
    var now = true;
    MSM.stop(server.name, next, now);
    // todo tell msm to delete the server
  }

  getServer(server) {
    return this.servers.find(ele => {
      if (server.name === ele.name) {
        return ele;
      }
    });
  }

  updateServer(server) {
    this.servers.find(function (ele) {
      if (server.name === ele.name) {
        ele = server;
      }
    })
  }

  updateServerKey(server, key, value) {
    this.servers.find(function (ele) {
      if (server.name === ele.name) {
        ele[key] = value;
      }
    })
  }

  updateServers() {
    var self = this;
    MSM.list(function (err, servers) {
      servers.forEach(function (ele) {
        console.log('updateing ' + ele.name);
        var server = self.getServer(ele);
        if (server) {
          server.status = ele.status;
          server.state = (ele.message !== 'Everything is OK!') ? 'running' : 'error';
        } else {
          console.log('adding ' + ele.name)
          self.addServer(ele);
        }
      })
    })
  }

  restartServer(server) {
    var next = function (err, result) {
      if (err) {
        // todo
        console.log(server + ' failed restarted');
      } else {
        console.log(server + ' was successful restarted');
      }
    };
    var now = true;
    console.log('restarting ' + server.name);
    MSM.restart(server.name, next, now);
  }

  startMonitor() {
    console.log('Starting Server Monitor.');
    var self = this;
    this.intervalID = setInterval(function () {
      self.updateServers();
      console.log('servers: ');
      console.log(self.servers);

      self.servers.forEach(function (server) {
        console.log('a server from self.servers');
        console.log(server);
        console.log('Server Monitor: Checking: ' + server['name'] + ' is Status: ' + server['status'] + ' State: ' + server['state']);
        if (server['state'] === 'error' || server['status'] === 'INACTIVE') {
          self.restartServer(server);
        }
      });
    }, self.pollInterval);
  }

  stopMonitor() {
    clearInterval(this.intervalID);
  }
}

