/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/worlds              ->  index
 * POST    /api/worlds              ->  create
 * GET     /api/worlds/:id          ->  show
 * PUT     /api/worlds/:id          ->  update
 * DELETE  /api/worlds/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
var World = require('./world.model');
const fs = require('fs');
import move from '../../libraries/fsMove.js';

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.saveAsync()
      .spread(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.removeAsync()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

// Gets a list of Worlds
export function index(req, res) {
  World.findAsync()
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Gets a single World from the DB
export function show(req, res) {
  World.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Creates a new World in the DB
export function create(req, res) {
  // We are able to access req.files.file thanks to
  // the multiparty middleware
  var file = req.files.file;
  console.log(file.name);
  console.log(file.type);
  console.log(file.path);
  console.log(__dirname);
  move(file.path, __dirname + '/../../uploads/worlds/' + file.originalFilename, function(err){
    if (err) {
      console.log(err);
      handleError(res)(err);
      return;
    }
    World.createAsync(req.body)
      .then(responseWithResult(res, 201))
      .catch(handleError(res));
  });
}

// Updates an existing World in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  World.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
}

// Deletes a World from the DB
export function destroy(req, res) {
  World.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
