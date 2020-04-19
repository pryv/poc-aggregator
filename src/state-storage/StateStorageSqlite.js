const StateStorageInterface = require("./StateStorageInterface");
const logger = require('../utils/logging');

class StateStorageSqlite extends StateStorageInterface {

  constructor(params) {
    super(params);
    const db = require('better-sqlite3')(params.dbfile, { verbose: logger.info });
    logger.info('StateStorage: Sqlite - ' + params.dbfile);

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


    this.queries = {
      insertHook: db.prepare('INSERT OR REPLACE INTO hooks ' +
        '(accessId, hookId, apiEndpoint, eventsQuery, status, details) VALUES ' +
        '(@accessId, @hookId, @apiEndpoint, @eventsQuery, @status, @details)'),
      updateHookDetail: db.prepare(
        'UPDATE hooks SET details = @details WHERE accessId = @accessId'),
      updateLastSync: db.prepare(
        'UPDATE hooks SET lastSync = @lastSync WHERE accessId = @accessId'),
      getHookForAccessId: db.prepare(
        'SELECT apiEndpoint, hookId, lastSync, eventsQuery, status ' +
        'FROM hooks WHERE accessId = @accessId'),
      allHooksAccessIds: db.prepare(
        'SELECT accessId FROM hooks')
    }
  }

  /**
   * @param {string} accesId
   * @param {string} apiEndpoint
   * @param {Object} eventsQuery
   * @param {HookStatus} status
   * @param {Object} details 
   */
  async addHook(accessId, hookId, apiEndpoint, eventsQuery, status, details) {
    this.queries.insertHook.run({
      accessId, hookId, apiEndpoint, hookId,
      eventsQuery: JSON.stringify(eventsQuery), status,
      details: JSON.stringify(details)
    });
  };

  /**
     * Update the detail value of the hook.
     * This implementation is optional
     * @param {string} accessId
     * @param {Object} details
     */
  async updateHookDetail(accessId, details) {
    this.queries.updateHookDetail.run({ accessId, details: JSON.stringify(details) });
  }

  /**
   * Update last synch value for this hook
   * @param {string} accessId 
   * @param {number} lastSync Time in seconds (in server time scope)
   */
  async updateLastSync(accessId, lastSync) {
    this.queries.updateLastSync.run({ accessId, lastSync });
  }


  /**
   * @param {string} accessId
   * @returns {Hook} 
   */
  async hookForAccessId(accessId) {
    let res = this.queries.getHookForAccessId.get({ accessId });
    res.eventsQuery = JSON.parse(res.eventsQuery);
    return res;
  }

  /**
   * @returns {Array<Hook>} 
   */
  async allHooksAccessIds(accessId) {
    return this.queries.allHooksAccessIds.all({});
  }

}


module.exports = StateStorageSqlite;
