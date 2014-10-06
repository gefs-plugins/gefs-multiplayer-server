'use strict';

/*
int acid: user account ID
char(26) sid: session ID (MD5, 5 hash bits/character)
int id: multiplayer ID
varchar(?) ac: aircraft name
float la: latitude (deg)
float lo: longitude (deg)
float al: altitude (metres)
float h: heading (deg)
float t: aircraft body pitch (deg, negative = pointing up)
float r: aircraft bank angle (deg, negative = banking left)
int ti: time (milliseconds since Unix epoch)
varchar(?) m: chat message (if any)
int ci: chat message ID (if any)
*/

var Promise = require('bluebird');
var url = require('url');
var util = require('util');
var db = require('./db.js');

function update(req) {
  var paramToName =
    { acid: 'accountid'
    , sid: 'sessionid'
    , id: 'id'
    , ac: 'aircraft'
    , la: 'latitude'
    , lo: 'longitude'
    , al: 'altitude'
    , h: 'heading'
    , t: 'tilt'
    , r: 'roll'
    , m: 'message'
    , ci: 'messageid'
    };
  
  var query = url.parse(req.url, true).query;
  var params = {};
  for (var i in query) {
    params[paramToName[i]] = query[i];
  }
  
  if (!params.accountid) return Promise.reject([400, '400 Bad Request']);
  
  var now = Date.now();
  var getUpdateQuery = db.getQuery('updatecoords');
  var getNumOfPlayersQuery = db.getQuery('numofplayers');
  var getVisibleUserQuery = db.getQuery('visibleplayers');
  
  var updateData = [ params.aircraft, params.latitude, params.longitude, params.altitude, params.heading, params.tilt, params.roll, now, params.accountid ];
  var visibleUserData = [ now - 15000, params.accountid, params.latitude, params.longitude ];
  
  return Promise.using(db.getConnection(), getUpdateQuery, getNumOfPlayersQuery, getVisibleUserQuery,
                       function (client, updateQuery, numOfPlayersQuery, visiblePlayerQuery) {
    client.queryAsync(updateQuery, updateData);
    
    var getNumOfPlayers = client.queryAsync(numOfPlayersQuery, [ now - 15000 ]);
    var getVisibleUsers = client.queryAsync(visiblePlayerQuery, visibleUserData);
    
    return Promise.join(getNumOfPlayers, getVisibleUsers);
  }).spread(function (numOfPlayersResult, visibleUsersResult) {
    var numOfPlayers = numOfPlayersResult.rows.length ? numOfPlayersResult.rows[0].numofplayers : 1;
    
    var visibleUsers = [].map.call(visibleUsersResult.rows, function (row) {
      var userIDString = row.accountid + '';
      
      var coords = [ row.latitude, row.longitude, row.altitude, row.heading, row.tilt, row.roll ];
      return [ userIDString, row.aircraft, row.callsign, coords, row.lastupdate, userIDString ];
    });
    
    // TODO: implement chat functionality
    var unreadMessages = [];
    var lastMessageID = 0;
    
    return util.format('mpcbup(%j,%d,%j,%j,%d);', params.accountid, numOfPlayers, visibleUsers, unreadMessages, lastMessageID);
  });
}

module.exports = update;
