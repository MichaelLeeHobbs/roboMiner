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
  constructor(mongoServer, maxRestartAttempts = 5, restartTime = 60000, pollInterval = 5000) {
    console.log('constructor');
    this.mongoServer = mongoServer;
    this.servers = {};
    this.serversMap = {};
    this.pollInterval = pollInterval;
    this.intervalID = -1;
    this.maxRestartAttempts = maxRestartAttempts;
    this.restartTime = restartTime;
  }

  // server = server.model.js object
  addServer(server) {
    var self = this;
    console.log("Now managing " + server.name);
    if (this.servers.hasOwnProperty(server._id)) {
      console.log('Already managing ' + server.name);
      // we already have a server with that name
      return false;
    }


    // update its properties as msm sees it
    this.updateServerProps(server);
    console.log('restting restartAttempts');
    // set restart attempts to zero
    this.mongoServer.findById(server._id)
      .then(saveUpdates({restartAttempts: 0}))
      .then((server) => {
        console.log("test");
        self.servers[server._id] = server;
        self.serversMap[server.name] = server._id;
        return server;
      })
      .catch(handleError('Todo: Something bad happened here'));
  }

  updateServerProps(server) {
    var self = this;
    var failedToFind = "";
    var failedToGet = 'updateMcPropsFromServer: Failed to get mcConfig for: ';

    return MSM.server(server.name).config.getProperties()
      .then((serverProps) => {
        self.mongoServer
          .findByIdAsync(server._id)
          .then(saveUpdates(serverProps))
          .catch(handleError('Todo: Something bad happened here'));
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
              status: ele.status,
              state: (ele.message === 'Everything is OK.') ? 'running' : 'error',
              message: ele.message,
              stateTimeStamp: new Date(),
            };
            self.mongoServer
              .findById(self.serversMap[ele.name])
              .then(saveUpdates(update))
              .then((updated) => {
                self.servers[updated._id] = updated;
              })
              .catch(handleError('Todo: Something bad happened here'));
            // todo catch
          }
        });
      });
  }

  // todo restart works but reports a failure
  restartServer(server) {
    var self = this;
    console.log('restarting ' + server.name);
    MSM.server(server.name).restart()
      .then(function (result) {
        console.log(server.name + ' was successful restarted: ' + result);
        var update = {
          restartTimeStamp: new Date(),
          restartAttempts: 0,
          restartCount: self.servers[self.serversMap[server.name]._id].restartCount + 1,
          state: "running"
        };
        self.mongoServer.findById(server._id)
          .then(saveUpdates(update))
          .catch(handleError('Todo: Something bad happened here'));
      })
      .catch(function (err) {
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
      for (var serverName in self.serversMap) {
        var server = self.servers[self.serversMap[serverName]];

        // todo improve handling of different states
        if (server.state !== 'running' &&
          server.shouldRestart &&
          server.restartAttempts < self.maxRestartAttempts) {

          var now = new Date();
          if (now - server.restartTimeStamp > self.restartTime) {

            var update = {
              restartTimeStamp: now,
              restartAttempts: server.restartAttempts + 1,
              state: "restarting"
            };
            self.mongoServer.findById(server._id)
              .then(saveUpdates(update))
              .catch(handleError('Todo: Something bad happened here'));
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

