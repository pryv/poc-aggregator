/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
// Dependencies

const logger = require('./logging');
const fs = require('fs');
const nconf = require('nconf');

// Exports

module.exports = nconf;


//Setup nconf to use (in-order):
//1. Command-line arguments
//2. Environment variables

nconf.argv()
  .env();

// default config file
let configFile = './config.json';

/// /3. A file located at ..
if (typeof(nconf.get('config')) !== 'undefined') {
  configFile = nconf.get('config');
}


if (fs.existsSync(configFile)) {
  configFile = fs.realpathSync(configFile);
  logger.info('using custom config file: ' + configFile);
} else {
  if (configFile) {
    logger.error('Cannot find custom config file: ' + configFile);
  }
}

if (configFile) {
  nconf.file({ file: configFile});
}

// Set default values
nconf.defaults({
  server: {
    port : 7606,
    ip: '127.0.0.1'
  },
  database: {
    path: './db.sqlite'
  }
});
