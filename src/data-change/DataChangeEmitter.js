
const EventEmitter = require('events');
const { DataChangesNames } = require('./DataChangesDefinitions');

class DataChangeEmitter extends EventEmitter {

  // load all registered listners 
  constructor(dataListenersSettings) {
    super();
    this.dataListeners = [];
    dataListenersSettings.forEach((dataListenerSettings) => {
      const DataListener = require('./' + dataListenerSettings.module);
      this.dataListeners.push(new DataListener(this, dataListenerSettings.params))
    });
  }

  /**
   * Eventually initialize asynchronus listeners
   */
  async init() {
    this.dataListeners.forEach(async (dataListener) => {
      await dataListener.init();
    })
  }

  /**
   * @function newHook
   * advertised on new Hook
   * - !! hook contains the credential to acces the account and might not be stored
   * @param {string} accessId 
   * @param {Hook} hook 
   */
  newHook(accessId, hook) {
    this.emit(DataChangesNames.HOOK.NEW, accessId, hook);
  }

  /**
   * @function deleteHook
   * advertised on a deleted Hook
   * - All data relative to this access should be deleted
   * @param {string} accessId 
   */
  deleteHook(accessId) {
    this.emit(DataChangesNames.HOOK.DELETE, accessId);
  }

  /**
   * @function newOrUpdateEvent
   * advertised on new Event
   * - Event should be added or updated
   * @param {string} accessId 
   * @param {Object} event // following Pryv.io's Event structure
   */
  newOrUpdateEvent(accessId, event) {
    this.emit(DataChangesNames.EVENT.NEW_OR_UPDATE, accessId, event);
  }

  /**
   * @function deletedEvent
   * advertised on a deleted Event
   * - Event should be removed
   * @param {string} accessId 
   * @param {Object} event
   * @param {string} event.id 
   * @param {number} [event.deleted] Deleted time. ! Might not be available
   */
  deletedEvent(accessId, event) {
    this.emit(DataChangesNames.EVENT.DELETE, accessId, event);
  }

  /**
   * @function newStreams
   * advertised on a new Stream Structure
   * - List of streams should be updated
   * @param {string} accessId 
   * @param {Object} streams
   */
  newStreams(accessId, streams) {
    this.emit(DataChangesNames.STREAMS.NEW_OR_UPDATE, accessId, streams);
  }
}

module.exports = DataChangeEmitter;