const dataChangesCodes = {
    HOOK: {
      NEW: 'newHook', // params: { triggerId, hook },
      DELETE: 'deleteHook', // params: "triggerId"
    },
    EVENT: {
      NEW_OR_UPDATE: 'newOrUpdateEvent', // params: event
      DELETE: 'deleteEvent', // params: eventId
    },
    STREAMS: {
      NEW_OR_UPDATE: 'newOrUpdateStreams', // params: stream structure
    }
  }

  module.exports = dataChangesCodes;