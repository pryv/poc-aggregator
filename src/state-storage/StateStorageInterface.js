/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
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
   * @param {string} triggerId - Primary Key, matching apiEnpoint's token's triggerId 
   * @param {string} apiEndpoint - Unique indexed, Pryv api endpoint of the for https://{token}@{hostname}/{path}
   * @param {Object} eventsQuery - Extra parameters to be sent for event synchronization, matching `events.get` API params.
   * @param {StateStorageInterface.status} status - Number, One of status value, ACTIVE: 1, OFF: 0, FAULTY: -1
   * @param {Object} details - Content of `webhooks.get` for this Hook -- It's optionalatory to store it 
   */
  async addHook(triggerId, hookId, apiEndpoint, eventsQuery, status, details) {
    throw new Error('addHook should be implemented');
  }

  /**
   * Update the detail value of the hook.
   * This implementation is optional
   * @param {string} triggerId 
   * @param {Object} details 
   */
  async updateHookDetail(triggerId, details) {
    // Optional
  }

  /**
   * Update last synch value for this hook
   * @param {string} triggerId 
   * @param {number} lastSync Time in seconds (in server time scope)
   */
  async updateLastSync(triggerId, lastSync) {
    throw new Error('updateLastSync should be implemented');
  }

  /**
  * Get a Hook per his triggerId
  * @param {string} triggerId
  * @returns {StateStorageInterface.Hook} The hook corresponding to this triggerId
  */
  async hookFortriggerId(triggerId) {
    throw new Error('hookFortriggerId should be implemented');
  }

  /**
   * Get a list of All Hooks triggerIds 
   * @returns {Array<Hook>} 
   */
  async allHookstriggerIds(triggerId) {
    throw new Error('allHookstriggerIds should be implemented');
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
 * @property {string} [triggerId]
 * @property {string} apiEndpoint
 * @property {number} lastSync
 * @property {Object} eventsQuery
 * @property {Status} status
 */


module.exports = StateStorageInterface;