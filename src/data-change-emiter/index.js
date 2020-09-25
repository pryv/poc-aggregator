
/**
 * Create an EventEmmiter
 * Load and register DataListeners
 */
const EventEmitter = require('events');
const config = require('../utils/config.js');
const dataListenersSettings = config.get('data-change-listeners');
const DataChangeEmitter = require('./DataChangeEmitter');

const dataChangeEmitter = new DataChangeEmitter(dataListenersSettings);
dataChangeEmitter.eventNames

module.exports = dataChangeEmitter;