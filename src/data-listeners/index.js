
/**
 * @function newHook
 * advertised on new Hook
 * - !! hook contains the credential to acces the account and might not be stored
 * @param {string} accessId 
 * @param {Hook} hook 
 */

/**
 * @function deleteHook
 * advertised on a deleted Hook
 * - All data relative to this access should be deleted
 * @param {string} accessId 
 */

/**
 * @function newOrUpdateEvent
 * advertised on new Event
 * - Event should be added or updated
 * @param {string} accessId 
 * @param {Object} event // following Pryv.io's Event structure
 */

/**
 * @function deletedEvent
 * advertised on a deleted Event
 * - Event should be removed
 * @param {string} accessId 
 * @param {Object} event
 * @param {string} event.id 
 * @param {number} event.deleted Deleted time
 */

/**
 * @function newStreams
 * advertised on a new Stream Structure
 * - List of streams should be updated
 * @param {string} accessId 
 * @param {Object} streams
 */


module.exports = require('./console.js');