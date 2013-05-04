
/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    casper = require('casper'),
    cdnjs = require('cdnjs'),
    resolve = require('pulldown-resolve');

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
 * Serve a local set
 */

app.localSet = function (req, res, next) {
  var identifier = req.params.identifier,
      set = resolve(identifier, registry);
  if (!set.length) return next();
  res.jsonp(set);
};

/**
 * Routes
 * Yep, this is one file.
 */

app.get('/', casper.noop({
  ok: "Yep."
}));

app.get('/set/*?',
  function (req, res, next) {
    req.params.identifier = req.params[0];
    next();
  },
  casper.check.params('identifier'),
  app.localSet,
  function (req, res) {
    var identifier = req.params.identifier;
    cdnjs.url(identifier, function (err, result) {
      console.log.apply(console, [].slice.call(arguments));
      if (err) return res.jsonp(404, []);
      res.jsonp([result.url]);
    });
  });

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
