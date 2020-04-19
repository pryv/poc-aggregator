
const logger = require('../utils/logging');

const { DataChangesNames, DataChangesListenersInterface } = require('./DataChangesDefinitions');

function log(accessId, call, msg) {
  logger.info('Listener [' + accessId + '] - ' + call + ' > ' + msg);
}


class DataListenerConsole extends DataChangesListenersInterface { 

  constructor(emitter, params) {
    super(emitter, params);
    this.emitter.on(DataChangesNames.HOOK.NEW, this.newHook);
    this.emitter.on(DataChangesNames.HOOK.DELETE, this.deleteHook);
    this.emitter.on(DataChangesNames.EVENT.NEW_OR_UPDATE, this.newOrUpdateEvent);
    this.emitter.on(DataChangesNames.EVENT.DELETE, this.deleteEvent);
    this.emitter.on(DataChangesNames.STREAMS.NEW_OR_UPDATE, this.newOrUpdateStreams);
    logger.info('DataListener using Console');
  }

 
  /**
   * advertised on new Hook
   * - !! hook contains the credential to acces the account and might not be stored
   * @param {string} accessId 
   * @param {Hook} hook 
   */
  newHook(accessId, hook) {
    log(accessId, 'New Hook');
  }

  /**
   * advertised on a deleted Hook
   * - All data relative to this access should be deleted
   * @param {string} accessId 
   * @param {Hook} hook 
   */
  deleteHook(accessId) {
    log(accessId, 'Delete Hook');
  }

  /**
   * advertised on new Event
   * - Event should be added or updated
   * @param {string} accessId 
   * @param {string} apiEndpoint
   * @param {Object} event
   */
  newOrUpdateEvent(accessId, event) {
    log(accessId, 'New Event', event.id + ' ' + event.type + ' > ' + event.content);
  }

  /**
   * advertised on a deleted Event
   * - Event should be removed
   * @param {string} accessId 
   * @param {string} apiEndpoint
   * @param {Object} event
   */
  deleteEvent(accessId, event) {
    log(accessId, 'Delete Event', event.id);
  }

  /**
   * advertised on a new Stream Structure
   * - List of streams should be updated
   * @param {string} accessId 
   * @param {string} apiEndpoint
   * @param {Object} streams
   */
  newOrUpdateStreams(accessId, streams) {
    log(accessId, 'New Streams', streams.length);
  }

}

module.exports = DataListenerConsole;