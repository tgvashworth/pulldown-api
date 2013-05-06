/**
 * Nodetime
 */

var nodetime = require('nodetime');
if(process.env.NODETIME_ACCOUNT_KEY) {
  nodetime.profile({
    accountKey: process.env.NODETIME_ACCOUNT_KEY,
    appName: 'pulldown-api'
  });
}

/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    casper = require('casper'),
    cdnjs = require('cdnjs');

/**
 * Configuration
 */

// Grab the config file if it's there
var configFile;
try {
  configFile = require('./config.json');
} catch (e) {
  configFile = {};
}

// Then configure!
var config = {
  port: parseInt(process.argv[2], 10) ||
        parseInt(process.env.PORT, 10) ||
        configFile.port ||
        9005
};

/**
 * Pulldown Packages
 */

// Grab the config file if it's there
var registry;
try {
  registry = require('./pulldown.json');
} catch (e) {
  registry = {};
}

/**
 * Setup express
 */

var app = express();

// all environments
app.set('port', config.port);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(function (err, req, res, next) {
  if (err.status) res.statusCode = err.status;
  if (res.statusCode < 400) res.statusCode = 500;
  var error = { message: err.message, stack: err.stack };
  for (var prop in err) error[prop] = err[prop];
  res.jsonp(error);
});

/**
 * Logging
 */

app.log = function (scope, name, unit, op) {
  var args = [].slice.call(arguments);
  return function (req, res, next) {
    app.metric.apply(null, args);
    next();
  };
};

app.log.endpoint = function (path) {
  return function (req, res, next) {
    return app.log('Endpoint', path || req.path, 'requests', 'sum')(req, res, next);
  };
};

app.log.params = function () {
  return function (req, res, next) {
    req.params.forEach(function (param) {
      app.metric('Identifier', param, 'requests', 'sum');
    });
    next();
  };
};

app.metric = function (scope, name, unit, op) {
  console.log.apply(console, [].slice.call(arguments));
  if (process.env.NODETIME_ACCOUNT_KEY) {
    return nodetime.metric(scope, name, 1, unit, op);
  }
};

/**
 * Grab the identifier
 */

app.identify = function (req, res, next) {
  req.params.identifier = req.params[0];
  next();
};

/**
 * Resolve locally
 */

app.resolveLocal = function (req, res, next) {
  var result = registry[req.params.identifier];
  if (!result) return next();
  if (typeof result === "string") result = [result];
  return res.jsonp(result);
};

/**
 * Routes
 * Yep, this is one file.
 */

app.get('/',
  app.log.endpoint(),
  casper.noop(registry));

app.get('/set/*?',
  app.log.endpoint('/set'),
  app.log.endpoint(),
  app.log.params(),
  app.identify,
  casper.check.params('identifier'),
  app.resolveLocal,
  function (req, res) {
    var identifier = req.params.identifier;
    cdnjs.url(identifier, function (err, result) {
      if (err) return res.jsonp(404, []);
      res.jsonp([result.url]);
    });
  });

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
