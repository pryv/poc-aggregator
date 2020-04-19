/**
 * Interface to implement state storages
 */
class StateStorageInterface {

  constructor() {

  }

  /**
   * (optional implement if there is any asynchorus init phase)
   */
  async init() {
    // optional 
  }


  /**
   * Add or Replace a new Hook, 
   * @param {string} accessId - Primary Key, matching apiEnpoint's token's accessId 
   * @param {string} apiEndpoint - Unique indexed, Pryv api endpoint of the for https://{token}@{hostname}/{path}
   * @param {Object} eventsQuery - Extra parameters to be sent for event synchronization, matching `events.get` API params.
   * @param {StateStorageInterface.status} status - Number, One of status value, ACTIVE: 1, OFF: 0, FAULTY: -1
   * @param {Object} details - Content of `webhooks.get` for this Hook -- It's optionalatory to store it 
   */
  async addHook(accessId, hookId, apiEndpoint, eventsQuery, status, details) {
    throw new Error('addHook should be implemented');
  }

  /**
   * Update the detail value of the hook.
   * This implementation is optional
   * @param {string} accessId 
   * @param {Object} details 
   */
  async updateHookDetail(accessId, details) {
    // Optional
  }

  /**
   * Update last synch value for this hook
   * @param {string} accessId 
   * @param {number} lastSync Time in seconds (in server time scope)
   */
  async updateLastSync(accessId, lastSync) {
    throw new Error('updateLastSync should be implemented');
  }

  /**
  * Get a Hook per his AccessId
  * @param {string} accessId
  * @returns {StateStorageInterface.Hook} The hook corresponding to this accessId
  */
  async hookForAccessId(accessId) {
    throw new Error('hookForAccessId should be implemented');
  }

  /**
   * Get a list of All Hooks AccessIds 
   * @returns {Array<Hook>} 
   */
  async allHooksAccessIds(accessId) {
    throw new Error('allHooksAccessIds should be implemented');
  }

  /**
   * @returns {StateStorageInterface.HookStatus}
   */
  get status() {
    return status;
  }
}

/**
 * @memberof StateStorageInterface
 * Enum hook status
 * @typedef HookStatus
 * @readonly
 * @property {number} ACTIVE 1
 * @property {number} OFF 0
 * @property {number} FAULTY -1
 * @enum {HookStatus}
 */
const status = {
  ACTIVE: 1,
  OFF: 0,
  FAULTY: -1
};



/**
 * @memberof StateStorageInterface
 * @typedef Hook
 * @property {string} [accessId]
 * @property {string} apiEndpoint
 * @property {number} lastSync
 * @property {Object} eventsQuery
 * @property {Status} status
 */


module.exports = StateStorageInterface;