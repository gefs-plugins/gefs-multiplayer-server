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
var fs = require('fs');
var path = require('path');

function update(req) {
  var paramToName =
    { acid: 'accountID'
    , sid: 'sessionID'
    , id: 'ID'
    , ac: 'aircraft'
    , la: 'latitude'
    , lo: 'longitude'
    , al: 'altitude'
    , h: 'heading'
    , t: 'tilt'
    , r: 'roll'
    , m: 'message'
    , ci: 'messageID'
    };
  
  var query = url.parse(req.url, true).query;
  var params = {};
  for (var i in query) {
    params[paramToName[i]] = query[i];
  }
  
  var userID = params.accountID;  
  var encoding = { encoding: 'utf8' };
  var getUpdateQuery = fs.readFileAsync(path.join('query', 'updatecoords.sql'), encoding);
  var getVisibleUserQuery = fs.readFileAsync(path.join('query', 'getnearplayers.sql'), encoding);
  
  var updateData = [ params.latitude, params.longitude, params.altitude, params.heading, params.tilt, params.roll, userID ];
  var visibleUserData = [ userID, +params.latitude, +params.longitude ];
  
  return Promise.using(db.getConnection(), getUpdateQuery, getVisibleUserQuery, function (client, updateQuery, visiblePlayerQuery) {
    client.queryAsync(updateQuery, updateData);
    
    var getNumOfPlayers = client.queryAsync('SELECT count(*) AS numOfPlayers FROM players WHERE lastUpdate > extract(epoch FROM now())::int - 15');
    var getVisibleUsers = client.queryAsync(visiblePlayerQuery, visibleUserData);
    
    return Promise.join(getNumOfPlayers, getVisibleUsers);
  }).spread(function (numOfPlayersResult, visibleUsersResult) {
    var numOfPlayers = 0;
    if (numOfPlayersResult[0] && numOfPlayersResult[0].numOfPlayers) numOfPlayers = numOfPlayersResult[0].numOfPlayers;
    var visibleUsers = [].map.call(visibleUsersResult, function (row) {
      var coords = [row.latitude, row.longitude, row.altitude, row.heading, row.tilt, row.roll];
      return [userID, row.aircraft, row.callsign, coords, row.lastUpdate, null, 0, userID];
    });
    
    // TODO: implement chat functionality
    var unreadMessages = [];
    var lastMessageID = 0;
    
    return util.format('mpcbup(%j,%d,%j,%j,%d);', userID, numOfPlayers, visibleUsers, unreadMessages, lastMessageID);
  });
}

module.exports = update;
