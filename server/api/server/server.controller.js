/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/servers              ->  index
 * GET     /api/servers/keys         ->  serverKeys
 * GET     /api/servers/:userid      ->  index of users servers
 * GET     /api/servers/:id          ->  show
 * POST    /api/servers              ->  create
 * POST    /api/servers/:userid      ->  create a server for the user
 * PUT     /api/servers/:id          ->  update
 * PUT     /api/server/:id/restart   ->  restart a server
 * DELETE  /api/servers/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
var Server = require('./server.model');
var MSM = require('../../libraries/msm.js/server.js');
import ServerManager from './ServerManager';
let serverManager = new ServerManager(Server);

// define the keys we want to allow out and who can edit them
var serverKeys = {
  _id: {type: 'string', edit: 'none', default: 'auto', visible: 'all'},
  name: {type: 'string', edit: 'owner,admin', default: 'A Minecraft Server', visible: 'all'},
  info: {type: 'string', edit: 'owner,admin', default: 'auto', visible: 'all'},
  active: {type: 'boolean', edit: 'owner,admin', default: 'auto', visible: 'all'},
  ownerId: {type: 'string', edit: 'admin', default: 'auto', visible: 'all'},
  host: {type: 'string', edit: 'admin', default: 'auto', visible: 'all'},
  port: {type: 'number', edit: 'admin', default: 'auto', visible: 'all'},
  mineCraftVersion: {type: 'string', edit: 'owner,admin', default: 'auto', visible: 'all'},
  ram: {type: 'number', edit: 'owner,admin', default: 'auto', visible: 'all'},
  state: {type: 'string', edit: 'none', default: 'auto', visible: 'all'},
  status: {type: 'string', edit: 'none', default: 'auto', visible: 'all'},
  message: {type: 'string', edit: 'none', default: 'auto', visible: 'all'},
  stateTimeStamp: {type: 'date', edit: 'none', default: 'auto', visible: 'all'},
  restartTimeStamp: {type: 'date', edit: 'none', default: 'auto', visible: 'all'},
  shouldRestart: {type: 'boolean', edit: 'none', default: 'auto', visible: 'all'},
  restartAttempts: {type: 'number', edit: 'none', default: 'auto', visible: 'all'},
  restartCount: {type: 'number', edit: 'none', default: 'auto', visible: 'all'},
  serverManagerId: {type: 'string', edit: 'admin', default: 'auto', visible: 'all'},
  mineCraftProp: {
    "allow-flight": {type: 'boolean', edit: 'owner,admin', default: false, visible: 'all'},
    "allow-nether": {type: 'boolean', edit: 'owner,admin', default: true, visible: 'all'},
    "announce-player-achievements": {type: 'boolean', edit: 'owner,admin', default: true, visible: 'all'},
    "difficulty": {type: 'number', edit: 'owner,admin', default: 1, visible: 'all'},
    "enable-query": {type: 'boolean', edit: 'owner,admin', default: false, visible: 'all'},
    "enable-rcon": {type: 'boolean', edit: 'owner,admin', default: false, visible: 'all'},
    "enable-command-block": {type: 'boolean', edit: 'owner,admin', default: false, visible: 'all'},
    "force-gamemode": {type: 'boolean', edit: 'owner,admin', default: false, visible: 'all'},
    "gamemode": {type: 'number', edit: 'owner,admin', default: 0, visible: 'all'},
    "generate-structures": {type: 'boolean', edit: 'owner,admin', default: true, visible: 'all'},
    "generator-settings": {type: 'string', edit: 'owner,admin', default: '', visible: 'all'},
    "hardcore": {type: 'boolean', edit: 'owner,admin', default: false, visible: 'all'},
    "level-name": {type: 'string', edit: 'owner,admin', default: 'world', visible: 'all'},
    "level-seed": {type: 'string', edit: 'owner,admin', default: '', visible: 'all'},
    "level-type": {type: 'string', edit: 'owner,admin', default: 'DEFAULT', visible: 'all'},
    "max-build-height": {type: 'number', edit: 'owner,admin', default: 256, visible: 'all'},
    "max-players": {type: 'number', edit: 'owner,admin', default: 20, visible: 'all'},
    "max-tick-time": {type: 'number', edit: 'owner,admin', default: 60000, visible: 'all'},
    "max-world-size": {type: 'number', edit: 'owner,admin', default: 29999984, visible: 'all'},
    "motd": {type: 'string', edit: 'owner,admin', default: 'A Minecraft Server', visible: 'all'},
    "network-compression-threshold": {type: 'number', edit: 'owner,admin', default: 256, visible: 'all'},
    "online-mode": {type: 'boolean', edit: 'admin', default: true, visible: 'all'},
    "op-permission-level": {type: 'number', edit: 'owner,admin', default: 4, visible: 'all'},
    "player-idle-timeout": {type: 'number', edit: 'owner,admin', default: 0, visible: 'all'},
    "pvp": {type: 'boolean', edit: 'owner,admin', default: true, visible: 'all'},
    "query.port": {type: 'number', edit: 'admin', default: 25565, visible: 'all'},
    "rcon.password": {type: 'string', edit: 'owner,admin', default: '', visible: 'all'},
    "rcon.port": {type: 'number', edit: 'owner,admin', default: 25575, visible: 'all'},
    "resource-pack": {type: 'uri', edit: 'owner,admin', default: '', visible: 'all'},
    "resource-pack-hash": {type: 'string', edit: 'owner,admin', default: '', visible: 'all'},
    "server-ip": {type: 'string', edit: 'admin', default: '', visible: 'all'},
    "server-port": {type: 'number', edit: 'admin', default: 25565, visible: 'all'},
    "snooper-enabled": {type: 'boolean', edit: 'admin', default: true, visible: 'all'},
    "spawn-animals": {type: 'boolean', edit: 'owner,admin', default: true, visible: 'all'},
    "spawn-monsters": {type: 'boolean', edit: 'owner,admin', default: true, visible: 'all'},
    "spawn-npcs": {type: 'boolean', edit: 'owner,admin', default: true, visible: 'all'},
    "spawn-protection": {type: 'number', edit: 'owner,admin', default: 16, visible: 'all'},
    "use-native-transport": {type: 'boolean', edit: 'admin', default: true, visible: 'all'},
    "view-distance": {type: 'number', edit: 'owner,admin', default: 10, visible: 'all'},
    "white-list": {type: 'boolean', edit: 'owner,admin', default: false, visible: 'all'},
    "verify-names": {type: 'boolean', edit: 'owner,admin', default: true, visible: 'all'},
    "admin-slot": {type: 'boolean', edit: 'owner,admin', default: false, visible: 'all'},
    "public": {type: 'boolean', edit: 'owner,admin', default: true, visible: 'all'},
    "server-name": {type: 'string', edit: 'owner,admin', default: 'A MineCraftServer', visible: 'all'},
    "max-connections": {type: 'number', edit: 'owner,admin', default: 3, visible: 'all'},
    "grow-trees": {type: 'boolean', edit: 'owner,admin', default: true, visible: 'all'}
  },
  msmProp: {
    "msm-username": {type: 'string', edit: 'admin', default: 'auto', visible: 'admin'},
    "msm-screen-name": {type: 'string', edit: 'admin', default: '', visible: 'admin'},
    "msm-version": {type: 'string', edit: 'admin', default: '', visible: 'admin'},
    "msm-world-storage-path": {type: 'string', edit: 'admin', default: '', visible: 'admin'},
    "msm-world-storage-inactive-path": {type: 'string', edit: 'admin', default: '', visible: 'admin'},
    "msm-log-path": {type: 'string', edit: 'admin', default: '', visible: 'admin'},
    "msm-whitelist-path": {type: 'string', edit: 'admin', default: '', visible: 'admin'},
    "msm-banned-players-path": {type: 'string', edit: 'admin', default: '', visible: 'admin'},
    "msm-banned-ips-path": {type: 'string', edit: 'admin', default: '', visible: 'admin'},
    "msm-ops-path": {type: 'string', edit: 'admin', default: '', visible: 'admin'},
    "msm-ops-list": {type: 'string', edit: 'admin', default: '', visible: 'admin'},
    "msm-jar-path": {type: 'string', edit: 'admin', default: '', visible: 'admin'},
    "msm-flag-active-path": {type: 'string', edit: 'admin', default: '', visible: 'admin'},
    "msm-complete-backup-follow-symlinks": {type: 'string', edit: 'admin', default: '', visible: 'admin'},
    "msm-worlds-flag-inram": {type: 'string', edit: 'admin', default: '', visible: 'admin'},
    "msm-ram": {type: 'string', edit: 'admin', default: '', visible: 'admin'},
    "msm-invocation": {type: 'string', edit: 'admin', default: '', visible: 'admin'},
    "msm-stop-delay": {type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
    "msm-restart-delay": {type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
    "msm-message-stop": {type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
    "msm-message-stop-abort": {type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
    "msm-message-restart": {type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
    "msm-message-restart-abort": {type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
    "msm-message-world-backup-started": {type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
    "msm-message-world-backup-finished": {type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
    "msm-message-complete-backup-started": {type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
    "msm-message-complete-backup-finished": {type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
    "msm-confirm-save-on": {type: 'string', edit: 'admin', default: '', visible: 'admin'},
    "msm-confirm-save-off": {type: 'string', edit: 'admin', default: '', visible: 'admin'},
    "msm-confirm-save-all": {type: 'string', edit: 'admin', default: '', visible: 'admin'},
    "msm-confirm-start": {type: 'string', edit: 'admin', default: '', visible: 'admin'},
    "msm-confirm-kick": {type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
    "msm-confirm-time-set": {type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
    "msm-confirm-time-add": {type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
    "msm-confirm-toggledownfall": {type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
    "msm-confirm-gamemode": {type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
    "msm-confirm-give": {type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
    "msm-confirm-xp": {type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'}
  }

};
console.log('starting monitor');
Server.find({}).then(servers => {
    servers.forEach(server => {
      serverManager.addServer(server)
    })
  })
  .then(() => serverManager.startMonitor())
  .catch((err) => console.log(err));


function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

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

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.removeAsync()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

// Gets a list of Servers
export function index(req, res) {
  Server.findAsync({}, /* todo turn this back on '-msmProp -mineCraftProp'*/)
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Gets a single Server from the DB
export function show(req, res) {
  Server.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Creates a new Server in the DB
export function create(req, res) {
  Server.createAsync(req.body)
    .then(responseWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Server in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Server.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
}
// Restart an existing Server in the DB
export function restart(req, res) {
  var next = function (err, result) {
    if (err) {
      (handleError(res))(err);
    } else {
      (responseWithResult(res))(result)
    }
  };
  console.log('restarting ' + req.params.id);
  MSM.server(req.params.id).restart(now = false);
}

// Deletes a Server from the DB
export function destroy(req, res) {
  Server.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
