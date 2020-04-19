
const dataChangesNames = {
  HOOK: {
    NEW: 'newHook', // params: { accessId, hook },
    DELETE: 'deleteHook', // params: "accessId"
  },
  EVENT: {
    NEW_OR_UPDATE: 'newOrUpdateEvent', // params: event
    DELETE: 'deleteEvent', // params: eventId
  },
  STREAMS: {
    NEW_OR_UPDATE: 'newOrUpdateStreams', // params: stream structure
  }
}

class DataChangesListenersInterface {

  /**
   * @param {DataChangeEmmitter} emitter 
   * @param {Object} params 
   */
  constructor(emitter, params) { 
    this.emitter = emitter;
    // nothing to do yet
  }
  /**
   * Optional
   */
  async init() {

  }
}

module.exports = { 
  DataChangesNames : dataChangesNames,
  DataChangesListenersInterface: DataChangesListenersInterface 
};