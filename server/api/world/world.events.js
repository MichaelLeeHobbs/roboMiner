/**
 * World model events
 */

'use strict';

import {EventEmitter} from 'events';
var World = require('./world.model');
var WorldEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
WorldEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  World.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    WorldEvents.emit(event + ':' + doc._id, doc);
    WorldEvents.emit(event, doc);
  }
}

export default WorldEvents;
