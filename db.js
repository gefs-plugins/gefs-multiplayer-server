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
