'use strict';

var express = require('express');
var controller = require('./server.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/keys', controller.keys);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.put('/:id/restart', controller.restart);
router.put('/:id/start', controller.start);
router.put('/:id/stop', controller.stop);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
