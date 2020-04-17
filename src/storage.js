const config = require('./utils/config.js');

const logger = require('./utils/logging');

const db = require('better-sqlite3')(config.get('database:path'), { verbose: logger.info });

db.prepare('CREATE TABLE IF NOT EXISTS hooks (' + 
        'accessId TEXT PRIMARY KEY, ' + // accessId corresponding to apiEndpoint
        'hookId TEXT UNIQUE, ' + // id of the Hook for Pryv.io
        'apiEndpoint TEXT, ' + // pryvApiEndpoint https://{token}@{path}
        'lastSync INTEGER DEFAULT -9223372036854775808, ' + // last synch time sent by API
        'eventsQuery TEXT, ' + // JSON string for get.events Query
        'status INTEGER, ' +  // 0 - OFF, 1 - ACTIVE , -1 - FAULTY
        'details TEXT )' // JSON string of last webHook update or create 
        ).run();


db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS hookId ON hooks(hookId)').run();
db.prepare('CREATE INDEX IF NOT EXISTS lastSync ON hooks(lastSync)').run();
db.prepare('CREATE INDEX IF NOT EXISTS status ON hooks(status)').run();

const queryInsertHook = db.prepare('INSERT OR REPLACE INTO hooks ' + 
  '(accessId, hookId, apiEndpoint, eventsQuery, status, details) VALUES ' +
  '(@accessId, @hookId, @apiEndpoint, @eventsQuery, @status, @details)');

const queryUpdateHookDetail = db.prepare(
  'UPDATE hooks SET details = @details WHERE accessId = @accessId');


const queryUpdateLastSync = db.prepare(
  'UPDATE hooks SET lastSync = @lastSync WHERE accessId = @accessId');

const queryGetHookForAccessId = db.prepare(
  'SELECT apiEndpoint, hookId, lastSync, eventsQuery, status ' + 
  'FROM hooks WHERE accessId = @accessId');
  
const queryAllHooksAccessIds = db.prepare(
  'SELECT accessId FROM hooks');


/**
 * @param {string} accesId
 * @param {string} apiEndpoint
 * @param {Object} eventsQuery
 * @param {number} status
 * @param {Object} details 
 */
function addHook(accessId, hookId, apiEndpoint, eventsQuery, status, details) {
  queryInsertHook.run({
    accessId, hookId, apiEndpoint, hookId, 
    eventsQuery: JSON.stringify(eventsQuery), status, 
    details: JSON.stringify(details)});
};


function updateHookDetail(accessId, details) {
  queryUpdateHookDetail.run({ accessId, details: JSON.stringify(details)});
}

function updateLastSync(accessId, lastSync) {
  queryUpdateLastSync.run({ accessId, lastSync });
}


/**
 * @param {string} accessId
 * @returns {Hook} 
 */
function hookForAccessId (accessId) { 
  let res = queryGetHookForAccessId.get({ accessId });
  res.eventsQuery = JSON.parse(res.eventsQuery);
  return res;
}

/**
 * @returns {Array<Hook>} 
 */
function allHooksAccessIds(accessId) {
  return queryAllHooksAccessIds.all({});
}

/**
 * @typedef Hook
 * @property {string} [accessId]
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
  allHooksAccessIds,
  updateHookDetail,
  updateLastSync,
  status,
};
