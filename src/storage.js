const config = require('./config.js');

const logger = require('./logging');

const db = require('better-sqlite3')(config.get('database:path'), { verbose: logger.info });

db.prepare('CREATE TABLE IF NOT EXISTS hooks (' + 
        'accessId TEXT PRIMARY KEY, ' + // accessId corresponding to apiEndpoint
        'apiEndpoint TEXT, ' + // pryvApiEndpoint https://{token}@{path}
        'lastSync INTEGER DEFAULT -9223372036854775808, ' + // last synch time sent by API
        'eventsQuery TEXT, ' + // JSON string for get.events Query
        'status INTEGER, ' +  // 0 - OFF, 1 - ACTIVE , -1 - FAULTY
        'details TEXT )' // JSON string of last webHook update or create 
        ).run();

db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS lastSync ON hooks(lastSync)').run();
db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS status ON hooks(status)').run();

const queryInsertHook = db.prepare('INSERT OR REPLACE INTO hooks ' + 
  '(accessId, apiEndpoint, eventsQuery, status, details) VALUES ' +
  '(@accessId, @apiEndpoint, @eventsQuery, @status, @details)');

const queryGetHookForAccessId = db.prepare(
  'SELECT apiEndpoint, lastSync, eventsQuery, status ' + 
  'FROM hooks WHERE accessId = @accessId');

/**
 * @param {string} accesId
 * @param {string} apiEndpoint
 * @param {Object} eventsQuery
 * @param {number} status
 * @param {Object} details 
 */
function addHook(accessId, apiEndpoint, eventsQuery, status, details) {
  queryInsertHook.run({ accessId, apiEndpoint, 
    eventsQuery: JSON.stringify(eventsQuery), status, details: JSON.stringify(details)});
};

/**
 * 
 * @param {string} accessId
 * @returns {Hook} 
 */
function hookForAccessId (accessId) { 
  let res = queryGetHookForAccessId.get({ accessId });
  res.eventsQuery = JSON.parse(res.eventsQuery);
  return res;
}

/**
 * @typedef Hook
 * @property {string} apiEndpoint
 * @property {number} lastSync
 * @property {Object} eventsQuery
 * @property {Status} status 
 */

/**
 * @typedef Status
 * Enum hook status
 * @readonly
 * @enum {number}
 */
const status = {
  /** ACTIVE */
  ACTIVE: 1,
  /** OFF */
  FALSE: 0,
  /** FAULTY */  
  FAULTY: -1
};

module.exports = {
  addHook,
  hookForAccessId,
  status
};
