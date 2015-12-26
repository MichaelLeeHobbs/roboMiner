/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import Thing from '../api/thing/thing.model';
import User from '../api/user/user.model';
import Host from '../api/host/host.model';
import Server from '../api/server/server.model';

Thing.find({}).removeAsync()
  .then(() => {
    Thing.create({
      name: 'Development Tools',
      info: 'Integration with popular tools such as Bower, Grunt, Babel, Karma, ' +
             'Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, ' +
             'Stylus, Sass, and Less.'
    }, {
      name: 'Server and Client integration',
      info: 'Built with a powerful and fun stack: MongoDB, Express, ' +
             'AngularJS, and Node.'
    }, {
      name: 'Smart Build System',
      info: 'Build system ignores `spec` files, allowing you to keep ' +
             'tests alongside code. Automatic injection of scripts and ' +
             'styles into your index.html'
    }, {
      name: 'Modular Structure',
      info: 'Best practice client and server structures allow for more ' +
             'code reusability and maximum scalability'
    }, {
      name: 'Optimized Build',
      info: 'Build process packs up your templates as a single JavaScript ' +
             'payload, minifies your scripts/css/images, and rewrites asset ' +
             'names for caching.'
    }, {
      name: 'Deployment Ready',
      info: 'Easily deploy your app to Heroku or Openshift with the heroku ' +
             'and openshift subgenerators'
    });
  });
var adminId;
User.find({}).removeAsync()
  .then(() => {
    User.createAsync({
      provider: 'local',
      name: 'Test User',
      email: 'test@example.com',
      password: 'test'
    }, {
      provider: 'local',
      role: 'admin',
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin'
    })
    .then(function(){
      User.find({name: "Admin"})
      .then((found) => adminId = found[0]._id);
    })
    .then(() => {
      console.log('finished populating users');
    });
  });

Host.find({}).removeAsync()
  .then(() => {
    Host.createAsync({
      name: 'localhost',
      port: 9000
    });
  });/*
Server.find({}).removeAsync()
  .then(() => {
    Server.createAsync({
      name: "test",
      info: "some info",
      active: true,
      ownerId: adminId,
      host: "localhost",
      port: 25565,
      mineCraftVersion: "1.8.9",
      ram: 1024,
      shouldRestart: true,
      serverManagerId: "W6T3F7"
    },
      {
        name: "test2",
        info: "some info also 2",
        active: true,
        ownerId: adminId,
        host: "localhost",
        port: 25566,
        mineCraftVersion: "1.8.9",
        ram: 1024,
        shouldRestart: true,
        serverManagerId: "W6T3F7"
      },
      {
        name: "test3",
        info: "some info",
        active: true,
        ownerId: adminId,
        host: "localhost",
        port: 25567,
        mineCraftVersion: "1.8.9",
        ram: 1024,
        shouldRestart: true,
        serverManagerId: "W6T3F7"
      }
    );
  });*/
