'use strict';

var pg = require('pg.js');
var connectionString = process.env.DATABASE_URL;

function getConnection() {
  function tryCatch(fn) {
    try { fn(); }
    catch (e) {}
  }
  
  var close;
  return pg.connectAsync(connectionString).spread(function(client, done) {
      close = done;
      return client;
  }).disposer(function() {
    if (typeof close === 'function') tryCatch(close);
  });
}

exports.getConnection = getConnection;

var queries = {};
var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');

function getQuery(name) {
  if (name in queries) return Promise.resolve(queries[name]);
  return fs.readFileAsync(path.join('query', name + '.sql'), { encoding: 'utf8' }).then(function (query) {
    queries[name] = query;
  });
}

exports.getQuery = getQuery;
  