var request = require('request'),
    url = require('url'),
    t = require('tap'),
    deepEqual = require('deeper');

/**
 * Configuration
 */

// Grab the config file if it's there
var configFile;
try {
  configFile = require('../config.json');
} catch (e) {
  configFile = {};
}

// Then configure!
var config = {};
config.port = parseInt(process.argv[2], 10) ||
              parseInt(process.env.PORT, 10) ||
              configFile.port ||
              9005;
config.base = url.format({
  protocol: 'http',
  hostname: 'localhost',
  port: config.port
});

/**
 * Pulldown Packages
 */

// Grab the config file if it's there
var registry;
try {
  registry = require('../pulldown.json');
} catch (e) {
  registry = {};
}

/**
 * Tests
 */

t.test('registry', function (t) {
  request({url: config.base, json: true}, function (err, response, body) {
    t.notOk(err);
    t.ok(body);
    t.ok(deepEqual(registry, body));
    t.end();
  });
});

t.test('canonical', function (t) {
  request({url: config.base + '/set/html5shiv', json: true}, function (err, response, body) {
    t.notOk(err);
    t.ok(body);
    t.ok(deepEqual([registry['html5shiv']], body));
    t.end();
  });
});

t.test('alias', function (t) {
  request({url: config.base + '/set/underscore', json: true}, function (err, response, body) {
    t.notOk(err);
    t.ok(body);
    t.ok(deepEqual([registry['underscore']], body));
    t.end();
  });
});

t.test('set', function (t) {
  request({url: config.base + '/set/backbone', json: true}, function (err, response, body) {
    t.notOk(err);
    t.ok(body);
    t.ok(deepEqual(registry['backbone'], body));
    t.end();
  });
});