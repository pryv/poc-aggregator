const StateStorageInterface = require("./StateStorageInterface");
const logger = require('../utils/logging');

class StateStorageSqlite extends StateStorageInterface {

  constructor(params) {
    super(params);
    const db = require('better-sqlite3')(params.dbfile, { verbose: params.log ? logger.info : function() {} });
    logger.info('StateStorage: Sqlite - ' + params.dbfile);

    db.prepare('CREATE TABLE IF NOT EXISTS hooks (' +
      'triggerId TEXT PRIMARY KEY, ' + // triggerId corresponding to apiEndpoint
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


    this.queries = {
      insertHook: db.prepare('INSERT OR REPLACE INTO hooks ' +
        '(triggerId, hookId, apiEndpoint, eventsQuery, status, details) VALUES ' +
        '(@triggerId, @hookId, @apiEndpoint, @eventsQuery, @status, @details)'),
      updateHookDetail: db.prepare(
        'UPDATE hooks SET details = @details WHERE triggerId = @triggerId'),
      updateLastSync: db.prepare(
        'UPDATE hooks SET lastSync = @lastSync WHERE triggerId = @triggerId'),
      getHookFortriggerId: db.prepare(
        'SELECT apiEndpoint, hookId, lastSync, eventsQuery, status ' +
        'FROM hooks WHERE triggerId = @triggerId'),
      allHookstriggerIds: db.prepare(
        'SELECT triggerId FROM hooks')
    }
  }

  /**
   * @param {string} accesId
   * @param {string} apiEndpoint
   * @param {Object} eventsQuery
   * @param {HookStatus} status
   * @param {Object} details 
   */
  async addHook(triggerId, hookId, apiEndpoint, eventsQuery, status, details) {
    this.queries.insertHook.run({
      triggerId, hookId, apiEndpoint, hookId,
      eventsQuery: JSON.stringify(eventsQuery), status,
      details: JSON.stringify(details)
    });
  };

  /**
     * Update the detail value of the hook.
     * This implementation is optional
     * @param {string} triggerId
     * @param {Object} details
     */
  async updateHookDetail(triggerId, details) {
    this.queries.updateHookDetail.run({ triggerId, details: JSON.stringify(details) });
  }

  /**
   * Update last synch value for this hook
   * @param {string} triggerId 
   * @param {number} lastSync Time in seconds (in server time scope)
   */
  async updateLastSync(triggerId, lastSync) {
    this.queries.updateLastSync.run({ triggerId, lastSync });
  }


  /**
   * @param {string} triggerId
   * @returns {Hook} 
   */
  async hookFortriggerId(triggerId) {
    let res = this.queries.getHookFortriggerId.get({ triggerId });
    res.eventsQuery = JSON.parse(res.eventsQuery);
    return res;
  }

  /**
   * @returns {Array<Hook>} 
   */
  async allHookstriggerIds(triggerId) {
    return this.queries.allHookstriggerIds.all({});
  }

}


module.exports = StateStorageSqlite;
