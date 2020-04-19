/**
 * Load the selected State Storage depending on config
 */

const config = require('../utils/config.js');
const stateStorageSettings = config.get('state-storage');
const StateStorageInterface = require('./StateStorageInterface');
const StateStorage = require('./' + stateStorageSettings.module);
/**
 * @name stateStorage
 * @type {StateStorageInterface}
 */
const stateStorage = new StateStorage(stateStorageSettings.params);


/**
 * @type {StateStorageInterface}
 */
module.exports = stateStorage;


