'use strict';

var Promise = require('bluebird');
// do this here so that other files have promisified module
Promise.promisifyAll(require('pg.js'));

// this adds a method to String.prototype only
require('string-format');

var http = require('http');
var url = require('url');
var fs = Promise.promisifyAll(require('fs'));

var map = require('./map.js');
var update = require('./update.js');
var files = { map: map, update: update };

var server = http.createServer(function (req, res) {  
  var pathname = url.parse(req.url).pathname.slice(1);
  var body;
  
  function getErrorPage(arr) {
    return fs.readFileAsync('error.html', { encoding: 'utf-8' }).then(function (html) {
      res.statuscode = arr[0];
      res.setHeader('Content-Type', 'text/html');
      return html.format(arr[1]);
    });
  }
  
  if (pathname === process.env.LOADER_IO_VERIFICATION + '/') {
    res.statuscode = 200;
    res.setHeader('Content-Type', 'text/plain');
    body = Promise.resolve(process.env.LOADER_IO_VERIFICATION);
  } else if (pathname in files) {
    body = files[pathname](req).then(function (code) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/ecmascript');
      return code;
    }).catch(getErrorPage);
  } else {
    body = getErrorPage(404, '404 Not Found');
  }
  
  body.then(function (text) {
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Content-Length', Buffer.byteLength(text));
    res.end(text);
  });
});
  
server.listen(process.env.PORT || 8080, process.env.HOST || '127.0.0.1');
