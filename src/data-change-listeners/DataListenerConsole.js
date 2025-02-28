/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */

const logger = require('../utils/logging');

const DataChangesCodes = require('./DataChangeCodes');
const DataListenerInterface = require('./DataListenerInterface');

function log(triggerId, call, msg) {
  logger.info('Listener [' + triggerId + '] - ' + call + ' > ' + msg);
}


class DataListenerConsole extends DataListenerInterface { 

  constructor(emitter, params) {
    super(emitter, params);
    this.emitter.on(DataChangesCodes.HOOK.NEW, this.newHook);
    this.emitter.on(DataChangesCodes.HOOK.DELETE, this.deleteHook);
    this.emitter.on(DataChangesCodes.EVENT.NEW_OR_UPDATE, this.newOrUpdateEvent);
    this.emitter.on(DataChangesCodes.EVENT.DELETE, this.deleteEvent);
    this.emitter.on(DataChangesCodes.STREAMS.NEW_OR_UPDATE, this.newOrUpdateStreams);
    logger.info('DataListener using Console');
  }

 
  /**
   * advertised on new Hook
   * - !! hook contains the credential to acces the account and might not be stored
   * @param {string} triggerId 
   * @param {Hook} hook 
   */
  newHook(triggerId, data) {
    log(triggerId, 'New Hook', data.pryvApiEndpoint);
  }

  /**
   * advertised on a deleted Hook
   * - All data relative to this access should be deleted
   * @param {string} triggerId 
   * @param {Hook} hook 
   */
  deleteHook(triggerId) {
    log(triggerId, 'Delete Hook');
  }

  /**
   * advertised on new Event
   * - Event should be added or updated
   * @param {string} triggerId 
   * @param {string} apiEndpoint
   * @param {Object} event
   */
  newOrUpdateEvent(triggerId, event) {
    const date = new Date(event.time * 1000);
    log(triggerId, 'New Event', date + ' ' + event.id + ' ' + event.type + ' > ' + event.content);
  }

  /**
   * advertised on a deleted Event
   * - Event should be removed
   * @param {string} triggerId 
   * @param {string} apiEndpoint
   * @param {Object} event
   */
  deleteEvent(triggerId, event) {
    log(triggerId, 'Delete Event', event.id);
  }

  /**
   * advertised on a new Stream Structure
   * - List of streams should be updated
   * @param {string} triggerId 
   * @param {string} apiEndpoint
   * @param {Object} streams
   */
  newOrUpdateStreams(triggerId, streams) {
    log(triggerId, 'New Streams', streams.length);
  }

}

module.exports = DataListenerConsole;