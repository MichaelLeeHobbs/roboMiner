var MSM = require('../../libraries/msm.js/server.js');
import _ from 'lodash';

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function saveUpdates(updates) {
  return function (entity) {
    var updated = _.merge(entity, updates);
    return updated.saveAsync()
      .spread(updated => {
        return updated;
      });
  };
}

function handleError(msg) {
  return function (err) {
    console.log(msg);
    console.log(err);
  }
}



export default class ServerManager {
  constructor(mongoServer, maxRestartAttempts, restartTime, pollInterval) {
    this.mongoServer = mongoServer;
    this.servers = {};
    this.serversMap = {};
    this.pollInterval = pollInterval || 5000;
    this.intervalID = -1;
    this.maxRestartAttempts = maxRestartAttempts || 5;
    this.restartTime = restartTime || 60;
  }

  // server = server.model.js object
  addServer(server) {
    console.log("adding " +server.name);
    if (this.servers.hasOwnProperty(server._id)) {
      // we already have a server with that name
      return false;
    }
    // add the server
    this.servers[server._id] = server;
    this.serversMap[server.name] = server._id;

    // update its msm config as msm sees it
    this.updateMsmPropsFromServer(server);
    // update its mc config as msm sees it
    this.updateMcPropsFromServer(server);

  }
  updateMcPropsFromServer(server) {
    var self = this;
    var failedToFind = "";
    var failedToGet = 'Failed to get mcConfig for: ';
    return MSM.server(server.name).config.getMc()
      .then(function(mcConfig) {
        self.mongoServer.findByIdAsync(server._id)
        //todo .then(handleEntityNotFound)
        .then(aServer => aServer.mcProp = mcConfig);
        // todo .catch(handleError);
      })
      .catch(handleError(failedToGet + server.name));
  }
  updateMsmPropsFromServer(server) {
    var self = this;
    var failedToFind = "";
    var failedToGet = 'Failed to get msmConfig for: ';
    return MSM.server(server.name).config.getMsm()
      .then(function(mcConfig) {
        self.mongoServer.findByIdAsync(server._id)
          //todo .then(handleEntityNotFound)
          .then(aServer => aServer.msmProp = mcConfig);
        // todo .catch(handleError);
      })
      .catch(handleError(failedToGet + server.name));
  }
  createServer(server) {
    // todo
    console.log('todo: implement createServer ' + server);
  }

  deleteServer(server) {
    // todo
    //MSM.server(server.name).stop(now=true);
    console.log('todo: implement deleteServer ' + server);
  }

  updateServersStatus() {
    var self = this;
    MSM.global.listServers()
      .then(function (servers) {
        servers.forEach(function (ele) {
          if (self.serversMap.hasOwnProperty(ele.name)) {
            var update = {
              status: (ele.status === 'ACTIVE'),
              state: (ele.message !== 'Everything is OK!') ? 'running' : 'error',
              message: ele.message
            };
            self.mongoServer.findById(self.serversMap[ele.name])
            .then(saveUpdates(update));
            // todo catch
          }
        });
      });
  }

  restartServer(server) {
    var self = this;
    console.log('restarting ' + server.name);
    MSM.server(server.name).restart(now=false)
      .then(function(result){
        console.log(server.name + ' was successful restarted: ' + result);
        var update = {
          stateTimeStamp: new Date(),
          restartAttempts: 0,
          state: "running"
        };
        self.mongoServer.findById(server._id)
          .then(saveUpdates(update));

      })
      .catch(function(err){
        console.log(server.name + ' failed restarted, error: ' + err.error + ' error msg: ' + err.msg);
      });
  }

  startMonitor() {
    console.log('Starting Server Monitor.');
    var self = this;
    this.intervalID = setInterval(function () {
      // update status of all servers
      self.updateServersStatus();

      // check if any servers are down
      for (var server in self.serversMap) {
        console.log("Checking: " + server);
        // todo improve handling of different states
        if (server.state !== 'running' && server.status && server.shouldRestart && server.restartAttempts < self.maxRestartAttempts) {
          var now = new Date();
          if (now - server.stateTimeStamp > self.restartTime) {
            var update = {
              stateTimeStamp: now,
              restartAttempts: server.restartAttempts + 1,
              state: "restarting"
            };
            self.mongoServer.findById(server._id)
              .then(saveUpdates(update));
            self.restartServer(server);
          }

        }
      }
    }, self.pollInterval);
  }

  stopMonitor() {
    clearInterval(this.intervalID);
  }
}

