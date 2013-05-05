
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
 * Grab the identifier
 */

app.identify = function (req, res, next) {
  req.params.identifier = req.params[0];
  next();
};

/**
 * Options for the resolver
 */

var resolveOptions = {
  registry: registry,
  helper: function (identifier, cb) {

  }
};

/**
 * Routes
 * Yep, this is one file.
 */

app.get('/', casper.noop({
  ok: "Yep."
}));

app.get('/set/*?',
  app.identify,
  casper.check.params('identifier'),
  function (req, res) {
    var identifier = req.params.identifier;
    var result = registry[identifier];
    if (result) {
      if (typeof result === "string") result = [result];
      return res.jsonp(result);
    }
    cdnjs.url(identifier, function (err, result) {
      if (err) return res.jsonp(404, []);
      res.jsonp([result.url]);
    });
  });

app.get('/what/*?',
  app.identify,
  casper.check.params('identifier'),
  function (req, res) {
    var identifier = req.params.identifier,
        result = registry[identifier];
    if (!result) return res.jsonp(404, []);
    if (typeof result === "string") result = [result];
    res.jsonp(result);
  });

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
