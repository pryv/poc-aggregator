
const logger = require('../utils/logging');

function log(accessId, call, msg) {
  logger.info('Listener [' + accessId + '] - ' + call + ' > ' + msg);
}

/**
 * advertised on new Hook
 * - !! hook contains the credential to acces the account and might not be stored
 * @param {string} accessId 
 * @param {Hook} hook 
 */
function newHook(accessId, hook) {
  log(accessId, 'New Hook');
}

/**
 * advertised on a deleted Hook
 * - All data relative to this access should be deleted
 * @param {string} accessId 
 * @param {Hook} hook 
 */
function deleteHook(accessId) {
  log(accessId, 'Delete Hook');
}

/**
 * advertised on new Event
 * - Event should be added or updated
 * @param {string} accessId 
 * @param {string} apiEndpoint
 * @param {Object} event
 */
function newOrUpdateEvent(accessId, event) {
  log(accessId, 'New Event', event.id + ' ' + event.type + ' > ' + event.content);
}

/**
 * advertised on a deleted Event
 * - Event should be removed
 * @param {string} accessId 
 * @param {string} apiEndpoint
 * @param {Object} event
 */
function deletedEvent(accessId, event) {
  log(accessId, 'Delete Event', event.id);
}

/**
 * advertised on a new Stream Structure
 * - List of streams should be updated
 * @param {string} accessId 
 * @param {string} apiEndpoint
 * @param {Object} streams
 */
function newStreams(accessId, streams) {
  log(accessId, 'New Streams', streams.length);
}

module.exports = {
  newHook: newHook,
  deleteHook: deleteHook,
  newOrUpdateEvent: newOrUpdateEvent,
  deletedEvent: deletedEvent,
  newStreams: newStreams
}