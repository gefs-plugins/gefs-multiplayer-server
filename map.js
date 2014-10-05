'use strict';

var Promise = require('bluebird');
var db = require('./db.js');
var util = require('util');

function map() {
  return Promise.using(db.getConnection(), function (client) {
    return client.queryAsync('SELECT * FROM players WHERE lastUpdate > ($1:: double precision)', [ Date.now() - 15000 ]);
  }).then(function (result) {
    var numOfUsers = result.rows.length;
    var users = result.rows.map(function (row) {
      var userIDString = row.accountid + '';
      
      var coords = [row.latitude, row.longitude, row.altitude, row.heading, row.tilt, row.roll];
      return [userIDString, row.aircraft, row.callsign, coords, row.lastupdate, userIDString];
    });
    
    return util.format('mpcbm(%d,%j);', numOfUsers, users);
  });
}

module.exports = map;
