/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */

const EventEmitter = require('events');
const DataChangesCodes = require('../data-change-listeners/DataChangeCodes');

class DataChangeEmitter extends EventEmitter {

  // load all registered listners 
  constructor(dataListenersSettings) {
    super();
    this.dataListeners = [];
    dataListenersSettings.forEach((dataListenerSettings) => {
      const DataListener = require('../data-change-listeners/' + dataListenerSettings.module);
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
   * @param {string} triggerId 
   * @param {Object} data
   * @param {string} data.pryvApiEndpoint
   * @param {Hook} data.hook
   */
  newHook(triggerId, data) {
    this.emit(DataChangesCodes.HOOK.NEW, triggerId, data);
  }

  /**
   * @function deleteHook
   * advertised on a deleted Hook
   * - All data relative to this access should be deleted
   * @param {string} triggerId 
   */
  deleteHook(triggerId) {
    this.emit(DataChangesCodes.HOOK.DELETE, triggerId);
  }

  /**
   * @function newOrUpdateEvent
   * advertised on new Event
   * - Event should be added or updated
   * @param {string} triggerId 
   * @param {Object} event // following Pryv.io's Event structure
   */
  newOrUpdateEvent(triggerId, event) {
    this.emit(DataChangesCodes.EVENT.NEW_OR_UPDATE, triggerId, event);
  }

  /**
   * @function deletedEvent
   * advertised on a deleted Event
   * - Event should be removed
   * @param {string} triggerId 
   * @param {Object} event
   * @param {string} event.id 
   * @param {number} [event.deleted] Deleted time. ! Might not be available
   */
  deletedEvent(triggerId, event) {
    this.emit(DataChangesCodes.EVENT.DELETE, triggerId, event);
  }

  /**
   * @function newStreams
   * advertised on a new Stream Structure
   * - List of streams should be updated
   * @param {string} triggerId 
   * @param {Object} streams
   */
  newStreams(triggerId, streams) {
    this.emit(DataChangesCodes.STREAMS.NEW_OR_UPDATE, triggerId, streams);
  }
}

module.exports = DataChangeEmitter;