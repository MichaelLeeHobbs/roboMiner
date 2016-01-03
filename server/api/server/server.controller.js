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
var serverKeys = [
  {name: '_id', type: 'string', edit: 'none', default: 'auto', visible: 'all'},
  {name: 'name', type: 'string', edit: 'owner,admin', default: 'A Minecraft Server', visible: 'all'},
  {name: 'info', type: 'string', edit: 'owner,admin', default: 'auto', visible: 'all'},
  {name: 'active', type: 'boolean', edit: 'owner,admin', default: 'auto', visible: 'all'},
  {name: 'ownerId', type: 'string', edit: 'admin', default: 'auto', visible: 'all'},
  {name: 'host', type: 'string', edit: 'admin', default: 'auto', visible: 'all'},
  {name: 'port', type: 'number', edit: 'admin', default: 'auto', visible: 'all'},
  {name: 'mineCraftVersion', type: 'string', edit: 'owner,admin', default: 'auto', visible: 'all'},
  {name: 'ram', type: 'number', edit: 'owner,admin', default: 'auto', visible: 'all'},
  {name: 'state', type: 'string', edit: 'none', default: 'auto', visible: 'all'},
  {name: 'status', type: 'string', edit: 'none', default: 'auto', visible: 'all'},
  {name: 'message', type: 'string', edit: 'none', default: 'auto', visible: 'all'},
  {name: 'stateTimeStamp', type: 'date', edit: 'none', default: 'auto', visible: 'all'},
  {name: 'restartTimeStamp', type: 'date', edit: 'none', default: 'auto', visible: 'all'},
  {name: 'shouldRestart', type: 'boolean', edit: 'none', default: 'auto', visible: 'all'},
  {name: 'restartAttempts', type: 'number', edit: 'none', default: 'auto', visible: 'all'},
  {name: 'restartCount', type: 'number', edit: 'none', default: 'auto', visible: 'all'},
  {name: 'serverManagerId', type: 'string', edit: 'admin', default: 'auto', visible: 'all'},
  {
    name: 'mineCraftProp', type: 'properties', edit: 'owner, admin', default: 'auto', visible: 'all',
    subProperties: [
      {name: 'allow-flight', type: 'boolean', edit: 'owner,admin', default: false, visible: 'all'},
      {name: 'allow-nether', type: 'boolean', edit: 'owner,admin', default: true, visible: 'all'},
      {name: 'announce-player-achievements', type: 'boolean', edit: 'owner,admin', default: true, visible: 'all'},
      {name: 'difficulty', type: 'number', edit: 'owner,admin', default: 1, visible: 'all'},
      {name: 'enable-query', type: 'boolean', edit: 'owner,admin', default: false, visible: 'all'},
      {name: 'enable-rcon', type: 'boolean', edit: 'owner,admin', default: false, visible: 'all'},
      {name: 'enable-command-block', type: 'boolean', edit: 'owner,admin', default: false, visible: 'all'},
      {name: 'force-gamemode', type: 'boolean', edit: 'owner,admin', default: false, visible: 'all'},
      {name: 'gamemode', type: 'number', edit: 'owner,admin', default: 0, visible: 'all'},
      {name: 'generate-structures', type: 'boolean', edit: 'owner,admin', default: true, visible: 'all'},
      {name: 'generator-settings', type: 'string', edit: 'owner,admin', default: '', visible: 'all'},
      {name: 'hardcore', type: 'boolean', edit: 'owner,admin', default: false, visible: 'all'},
      {name: 'level-name', type: 'string', edit: 'owner,admin', default: 'world', visible: 'all'},
      {name: 'level-seed', type: 'string', edit: 'owner,admin', default: '', visible: 'all'},
      {name: 'level-type', type: 'string', edit: 'owner,admin', default: 'DEFAULT', visible: 'all'},
      {name: 'max-build-height', type: 'number', edit: 'owner,admin', default: 256, visible: 'all'},
      {name: 'max-players', type: 'number', edit: 'owner,admin', default: 20, visible: 'all'},
      {name: 'max-tick-time', type: 'number', edit: 'owner,admin', default: 60000, visible: 'all'},
      {name: 'max-world-size', type: 'number', edit: 'owner,admin', default: 29999984, visible: 'all'},
      {name: 'motd', type: 'string', edit: 'owner,admin', default: 'A Minecraft Server', visible: 'all'},
      {name: 'network-compression-threshold', type: 'number', edit: 'owner,admin', default: 256, visible: 'all'},
      {name: 'online-mode', type: 'boolean', edit: 'admin', default: true, visible: 'all'},
      {name: 'op-permission-level', type: 'number', edit: 'owner,admin', default: 4, visible: 'all'},
      {name: 'player-idle-timeout', type: 'number', edit: 'owner,admin', default: 0, visible: 'all'},
      {name: 'pvp', type: 'boolean', edit: 'owner,admin', default: true, visible: 'all'},
      {name: 'query.port', type: 'number', edit: 'admin', default: 25565, visible: 'all'},
      {name: 'rcon.password', type: 'string', edit: 'owner,admin', default: '', visible: 'all'},
      {name: 'rcon.port', type: 'number', edit: 'owner,admin', default: 25575, visible: 'all'},
      {name: 'resource-pack', type: 'uri', edit: 'owner,admin', default: '', visible: 'all'},
      {name: 'resource-pack-hash', type: 'string', edit: 'owner,admin', default: '', visible: 'all'},
      {name: 'server-ip', type: 'string', edit: 'admin', default: '', visible: 'all'},
      {name: 'server-port', type: 'number', edit: 'admin', default: 25565, visible: 'all'},
      {name: 'snooper-enabled', type: 'boolean', edit: 'admin', default: true, visible: 'all'},
      {name: 'spawn-animals', type: 'boolean', edit: 'owner,admin', default: true, visible: 'all'},
      {name: 'spawn-monsters', type: 'boolean', edit: 'owner,admin', default: true, visible: 'all'},
      {name: 'spawn-npcs', type: 'boolean', edit: 'owner,admin', default: true, visible: 'all'},
      {name: 'spawn-protection', type: 'number', edit: 'owner,admin', default: 16, visible: 'all'},
      {name: 'use-native-transport', type: 'boolean', edit: 'admin', default: true, visible: 'all'},
      {name: 'view-distance', type: 'number', edit: 'owner,admin', default: 10, visible: 'all'},
      {name: 'white-list', type: 'boolean', edit: 'owner,admin', default: false, visible: 'all'},
      {name: 'verify-names', type: 'boolean', edit: 'owner,admin', default: true, visible: 'all'},
      {name: 'admin-slot', type: 'boolean', edit: 'owner,admin', default: false, visible: 'all'},
      {name: 'public', type: 'boolean', edit: 'owner,admin', default: true, visible: 'all'},
      {name: 'server-name', type: 'string', edit: 'owner,admin', default: 'A MineCraftServer', visible: 'all'},
      {name: 'max-connections', type: 'number', edit: 'owner,admin', default: 3, visible: 'all'},
      {name: 'grow-trees', type: 'boolean', edit: 'owner,admin', default: true, visible: 'all'}
    ]
  },
  {
    name: 'msmProp', type: 'properties', edit: 'owner, admin', default: 'auto', visible: 'all',
    subProperties: [
      {name: 'msm-username', type: 'string', edit: 'admin', default: 'auto', visible: 'admin'},
      {name: 'msm-screen-name', type: 'string', edit: 'admin', default: '', visible: 'admin'},
      {name: 'msm-version', type: 'string', edit: 'admin', default: '', visible: 'admin'},
      {name: 'msm-world-storage-path', type: 'string', edit: 'admin', default: '', visible: 'admin'},
      {name: 'msm-world-storage-inactive-path', type: 'string', edit: 'admin', default: '', visible: 'admin'},
      {name: 'msm-log-path', type: 'string', edit: 'admin', default: '', visible: 'admin'},
      {name: 'msm-whitelist-path', type: 'string', edit: 'admin', default: '', visible: 'admin'},
      {name: 'msm-banned-players-path', type: 'string', edit: 'admin', default: '', visible: 'admin'},
      {name: 'msm-banned-ips-path', type: 'string', edit: 'admin', default: '', visible: 'admin'},
      {name: 'msm-ops-path', type: 'string', edit: 'admin', default: '', visible: 'admin'},
      {name: 'msm-ops-list', type: 'string', edit: 'admin', default: '', visible: 'admin'},
      {name: 'msm-jar-path', type: 'string', edit: 'admin', default: '', visible: 'admin'},
      {name: 'msm-flag-active-path', type: 'string', edit: 'admin', default: '', visible: 'admin'},
      {name: 'msm-complete-backup-follow-symlinks', type: 'string', edit: 'admin', default: '', visible: 'admin'},
      {name: 'msm-worlds-flag-inram', type: 'string', edit: 'admin', default: '', visible: 'admin'},
      {name: 'msm-ram', type: 'string', edit: 'admin', default: '', visible: 'admin'},
      {name: 'msm-invocation', type: 'string', edit: 'admin', default: '', visible: 'admin'},
      {name: 'msm-stop-delay', type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
      {name: 'msm-restart-delay', type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
      {name: 'msm-message-stop', type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
      {name: 'msm-message-stop-abort', type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
      {name: 'msm-message-restart', type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
      {name: 'msm-message-restart-abort', type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
      {
        name: 'msm-message-world-backup-started',
        type: 'string',
        edit: 'owner,admin',
        default: '',
        visible: 'owner,admin'
      },
      {
        name: 'msm-message-world-backup-finished',
        type: 'string',
        edit: 'owner,admin',
        default: '',
        visible: 'owner,admin'
      },
      {
        name: 'msm-message-complete-backup-started',
        type: 'string',
        edit: 'owner,admin',
        default: '',
        visible: 'owner,admin'
      },
      {
        name: 'msm-message-complete-backup-finished',
        type: 'string',
        edit: 'owner,admin',
        default: '',
        visible: 'owner,admin'
      },
      {name: 'msm-confirm-save-on', type: 'string', edit: 'admin', default: '', visible: 'admin'},
      {name: 'msm-confirm-save-off', type: 'string', edit: 'admin', default: '', visible: 'admin'},
      {name: 'msm-confirm-save-all', type: 'string', edit: 'admin', default: '', visible: 'admin'},
      {name: 'msm-confirm-start', type: 'string', edit: 'admin', default: '', visible: 'admin'},
      {name: 'msm-confirm-kick', type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
      {name: 'msm-confirm-time-set', type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
      {name: 'msm-confirm-time-add', type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
      {name: 'msm-confirm-toggledownfall', type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
      {name: 'msm-confirm-gamemode', type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
      {name: 'msm-confirm-give', type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'},
      {name: 'msm-confirm-xp', type: 'string', edit: 'owner,admin', default: '', visible: 'owner,admin'}
    ]
  }
];

console.log('starting monitor');
Server.find({}).then(servers => {
    servers.forEach(server => {
      serverManager.addServer(server)
    })
  })
  .then(() => {
      serverManager.startMonitor();
      serverManager.serverJSTest("test3")
    }
  )
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

// Gets a list of Servers Keys
export function keys(req, res) {
  responseWithResult(res)(serverKeys);
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
