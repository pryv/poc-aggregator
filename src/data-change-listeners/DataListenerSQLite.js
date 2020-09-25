

const logger = require('../utils/logging');
const DataChangesCodes = require('./DataChangeCodes');
const DataListenerInterface = require('./DataListenerInterface');
const Pryv = require('pryv');



class DataListenerConsole extends DataListenerInterface { 

  constructor(emitter, params) {
    super(emitter, params);

    const db = require('better-sqlite3')(params.dbfile, { verbose: params.log ? logger.info : function () { }  });
    logger.info('StateStorage: Sqlite - ' + params.dbfile);

    db.prepare('CREATE TABLE IF NOT EXISTS hooks (' +
      'triggerId TEXT PRIMARY KEY, ' + // triggerId corresponding to apiEndpoint
      'endpoint TEXT NOT NULL)' // endpoint holding this data
    ).run();

    db.prepare('CREATE TABLE IF NOT EXISTS streams (' +
      'triggerId TEXT PRIMARY KEY, ' +
      'streamsData TEXT, ' + // will hold all the stream's data in JSON 
      'FOREIGN KEY (triggerId) REFERENCES hooks(triggerId) )'
    ).run();

    db.prepare('CREATE TABLE IF NOT EXISTS events (' + 
      'triggerId TEXT, ' +
      'eventId TEXT NOT NULL, ' + // event ID
      'eventData TEXT, ' +
      'FOREIGN KEY(triggerId) REFERENCES hooks(triggerId) ' +
      'PRIMARY KEY(triggerId, eventId) )' // all eventData In JSON
    ).run();


    //db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_triggerId_eventId ON events(triggerId, eventId)').run();

    this.queries = {
      newHook: db.prepare('INSERT OR REPLACE INTO hooks ' +
        '(triggerId, endpoint) VALUES ' +
        '(@triggerId, @endpoint)'),
      deleteHook: db.prepare(
        'DELETE FROM hooks WHERE triggerId = @triggerId'),
      newOrUpdateEvent: db.prepare(
        'INSERT OR REPLACE INTO events (triggerId, eventId, eventData) VALUES ' +
        '(@triggerId, @eventId, @eventData)'),
      deleteEvent: db.prepare(
        'DELETE FROM events WHERE triggerId = @triggerId AND eventId = @eventId'),
      newOrUpdateStreams: db.prepare(
        'INSERT OR REPLACE INTO streams (triggerId, streamsData) VALUES (@triggerId, @streamsData)')
    }

    // --------------- Register Event Listener 

    this.emitter.on(DataChangesCodes.HOOK.NEW, this.newHook.bind(this));
    this.emitter.on(DataChangesCodes.HOOK.DELETE, this.deleteHook.bind(this));
    this.emitter.on(DataChangesCodes.EVENT.NEW_OR_UPDATE, this.newOrUpdateEvent.bind(this));
    this.emitter.on(DataChangesCodes.EVENT.DELETE, this.deleteEvent.bind(this));
    this.emitter.on(DataChangesCodes.STREAMS.NEW_OR_UPDATE, this.newOrUpdateStreams.bind(this));
    logger.info('DataListener using Console');
  }

 
  /**
   * advertised on new Hook
   * - !! hook contains the credential to acces the account and might not be stored
   * @param {string} triggerId 
   * @param {Object} data 
   * @param {string} data.pryvApiEndpoint
   * @param {Hook} data.hook
   */
  newHook(triggerId, data) {
    const { endpoint } = Pryv.utils.extractTokenAndApiEndpoint(data.pryvApiEndpoint); // remove token for security
    this.queries.newHook.run({triggerId, endpoint});
  }

  /**
   * advertised on a deleted Hook
   * - All data relative to this access should be deleted
   * @param {string} triggerId 
   * @param {Hook} hook 
   */
  deleteHook(triggerId) {
    this.queries.deleteHook.run({triggerId});
  }

  /**
   * advertised on new Event
   * - Event should be added or updated
   * @param {string} triggerId 
   * @param {string} apiEndpoint
   * @param {Object} event
   */
  newOrUpdateEvent(triggerId, event) {
    this.queries.newOrUpdateEvent.run({triggerId, eventId: event.id, eventData: JSON.stringify(event)});
  }

  /**
   * advertised on a deleted Event
   * - Event should be removed
   * @param {string} triggerId 
   * @param {string} apiEndpoint
   * @param {Object} event
   */
  deleteEvent(triggerId, event) {
    this.queries.deleteEvent.run({triggerId, eventId: eventId});
  }

  /**
   * advertised on a new Stream Structure
   * - List of streams should be updated
   * @param {string} triggerId 
   * @param {string} apiEndpoint
   * @param {Object} streams
   */
  newOrUpdateStreams(triggerId, streams) {
   this.queries.newOrUpdateStreams.run({triggerId, streamsData: JSON.stringify(streams)});
  }

}

module.exports = DataListenerConsole;