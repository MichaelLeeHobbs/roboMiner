/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/servers              ->  index
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
let serverManager = new ServerManager();

console.log('starting monitor');
serverManager.addServer({"name":"test","status":"INACTIVE","message":"Everything is OK."});
serverManager.startMonitor();

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
  // todo test code

  console.log('MSM.list()');
  //var intervalID = setInterval(function() {
  MSM.list(function (err, servers) {
    if (err) {
      handleError(res);
    } else {
      responseWithResult(res)(servers);
    }
  });
  //}, 2000);


  // todo test code
  /*
   Server.findAsync()
   .then(responseWithResult(res))
   .catch(handleError(res));*/
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
  var now = true;
  console.log('restarting ' + req.params.id);
  MSM.restart(req.params.id, next, now);
}

// Deletes a Server from the DB
export function destroy(req, res) {
  Server.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
