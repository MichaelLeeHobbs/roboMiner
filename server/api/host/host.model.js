'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var HostSchema = new mongoose.Schema({
  name: String,
  port: Number,
  active: Boolean
});

export default mongoose.model('Host', HostSchema);
