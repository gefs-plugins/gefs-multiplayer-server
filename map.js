'use strict';

var Promise = require('bluebird');
var db = require('./db.js');
var util = require('util');

function map() {
  return Promise.using(db.getConnection(), function (client) {
    return client.queryAsync('SELECT * FROM players WHERE lastUpdate > extract(epoch FROM now())::int - 15');
  }).then(function (result) {
    var numOfUsers = result.rows.length;
    var users = result.rows.map(function (row) {
      var userIDString = row.accountID + '';
      
      var coords = [row.latitude, row.longitude, row.altitude, row.heading, row.tilt, row.roll];
      return [userIDString, row.aircraft, row.callsign, coords, row.lastUpdate, null, 0, userIDString];
    });
    
    return util.format('mpcbm(%d,%j);', numOfUsers, users);
  });
}

module.exports = map;
