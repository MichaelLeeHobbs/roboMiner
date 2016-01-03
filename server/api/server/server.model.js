'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var ServerSchema = new mongoose.Schema({
  name: {type: String, default: "A RoboMiner Minecraft Server"},
  info: {type: String, default: "Notes"},
  visibility: {type: String, default: 'private', enum: ['private', 'public']},
  active: Boolean,
  ownerId: mongoose.Schema.Types.ObjectId,
  host: {type: String, default: "localhost"},
  port: {type: Number, min: 1, max: 65534},
  // todo add schema for jars/mcVersion and enum to that schema
  mineCraftVersion: {type: String, default: "Minecraft_1.8.9"},
  ram: {type: Number, default: 1024},
  state: {type: String, default: "unknown"},              // running, stopped, restarting, error
  status: {type: String, default: "unknown"},             // INACTIVE, ACTIVE
  message: {type: String, default: ""},
  stateTimeStamp: {type: Date, default: Date.now},        // timestamp of last update
  restartTimeStamp: {type: Date, default: Date.now},
  shouldRestart: {type: Boolean, default: false},         // should we restart?
  restartAttempts: {type: Number, default: 0},
  restartCount: {type: Number, default: 0},
  serverManagerId: {type: String, default: ""},
  mineCraftProp: {
    "allow-flight": {type: Boolean, default: false},
    "allow-nether": {type: Boolean, default: true},
    "announce-player-achievements": {type: Boolean, default: true},
    "difficulty": {type: Number, min: 0, max: 3, default: 1},
    "enable-query": {type: Boolean, default: false},
    "enable-rcon": {type: Boolean, default: false},
    "enable-command-block": {type: Boolean, default: false},
    "force-gamemode": {type: Boolean, default: false},
    "gamemode": {type: Number, min: 0, max: 3, default: 0},
    "generate-structures": {type: Boolean, default: true},
    "generator-settings": {type: String, default: ""},
    "hardcore": {type: Boolean, default: false},
    "level-name": {type: String, default: "world"},
    "level-seed": {type: String, default: ""},
    "level-type": {type: String, default: "DEFAULT", enum: ["DEFAULT", "FLAT", "LARGEBIOMES", "AMPLIFIED", "CUSTOMIZED"]},
    "max-build-height": {type: Number, min: 0, max: 4096, default: 256},
    "max-players": {type: Number, min: 0, max: 2147483647, default: 20},
    "max-tick-time": {type: Number, min: 0, max: 6000000, default: 60000},
    "max-world-size": {type: Number, min: 0, max: 29999984, default: 29999984},
    "motd": {type: String, default: "A Minecraft Server"},
    "network-compression-threshold": {type: Number, min: -1, max: 1500, default: 256},
    "online-mode": {type: Boolean, default: true},
    "op-permission-level": {type: Number, min: 0, max: 4, default: 4},
    "player-idle-timeout": {type: Number, min: 0, max: 60, default: 10},
    "pvp": {type: Boolean, default: true},
    "query.port": {type: Number, min: 1, max: 65534, default: 25565},
    "rcon.password": {type: String, default: ""},
    "rcon.port": {type: Number, min: 1, max: 65534, default: 25575},
    "resource-pack": {type: String, default: ""},
    "resource-pack-hash": {type: String, default: ""},
    "server-ip": {type: String, default: ""},
    "server-port": {type: Number, min: 1, max: 65534},
    "snooper-enabled": {type: Boolean, default: true},
    "spawn-animals": {type: Boolean, default: true},
    "spawn-monsters": {type: Boolean, default: true},
    "spawn-npcs": {type: Boolean, default: true},
    "spawn-protection": {type: Number, min: 0, max: 256, default: 16},
    "use-native-transport": {type: Boolean, default: true},
    "view-distance": {type: Number, min: 3, max: 15, default: 10},
    "white-list": {type: Boolean, default: true},
    "verify-names": {type: Boolean, default: true},
    "admin-slot": {type: Boolean, default: true},
    "public": {type: Boolean, default: false},
    "server-name": {type: String, default: "A RoboMiner Minecraft Server"},
    "max-connections": {type: Number, min: 1, max: 3, default: 3},
    "grow-trees": {type: Boolean, default: true}
  },
  msmProp: {
    "msm-username": String,
    "msm-screen-name": String,
    "msm-version": String,
    "msm-world-storage-path": String,
    "msm-world-storage-inactive-path": String,
    "msm-log-path": String,
    "msm-whitelist-path": String,
    "msm-banned-players-path": String,
    "msm-banned-ips-path": String,
    "msm-ops-path": String,
    "msm-ops-list": String,
    "msm-jar-path": String,
    "msm-flag-active-path": String,
    "msm-complete-backup-follow-symlinks": String,
    "msm-worlds-flag-inram": String,
    "msm-ram": String,
    "msm-invocation": String,
    "msm-stop-delay": String,
    "msm-restart-delay": String,
    "msm-message-stop": String,
    "msm-message-stop-abort": String,
    "msm-message-restart": String,
    "msm-message-restart-abort": String,
    "msm-message-world-backup-started": String,
    "msm-message-world-backup-finished": String,
    "msm-message-complete-backup-started": String,
    "msm-message-complete-backup-finished": String,
    // these are the strings msm will look for when executing said command
    "msm-confirm-save-on": String,
    "msm-confirm-save-off": String,
    "msm-confirm-save-all": String,
    "msm-confirm-start": String,
    "msm-confirm-kick": String,
    "msm-confirm-time-set": String,
    "msm-confirm-time-add": String,
    "msm-confirm-toggledownfall": String,
    "msm-confirm-gamemode": String,
    "msm-confirm-give": String,
    "msm-confirm-xp": String
  }
});

export default mongoose.model('Server', ServerSchema);
