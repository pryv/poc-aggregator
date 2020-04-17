const Pryv = require('pryv');
const storage = require('./storage.js');
const logger = require('./logging.js');
const config = require('./config.js');
const queue = require('./queue.js');
const baseTriggerUrl = config.get('service:baseUrl') + 'trigger/';


console.log(queue);

/**
 * 1. Create Web Hook 
 * 2. Store 
 * 3. Add to update queue 
 */
exports.create = async function (pryvApiEndpoint, eventsQuery) {
  const conn = new Pryv.Connection(pryvApiEndpoint);


  // get access Info (necessary to find out the access.id)
  const accessInfo = await conn.get('access-info');
  if (! accessInfo || accessInfo.type !== 'app') {
    throw new Error('pryvApiEndpoint is invalid');
  }
  // here we could also check the validity and the scope 
  const triggerUrl = baseTriggerUrl + accessInfo.id;

  let webhookDetails = null;
  let actionMsg = null;
  // check if webhooks already registered on Pryv.io 
  const webhooksResult = await conn.get('webhooks');
  if (webhooksResult.webhooks) {
    webhooksResult.webhooks.forEach((webhook) => { 
      if (webhook.url === triggerUrl) {
        webhookDetails = webhook;
        actionMsg = 'ALREADY_EXISTS';
      }
    });
  }

  // if not found create it
  if (! webhookDetails) {
    const result = await conn.post('webhooks', { url: triggerUrl });
    webhookDetails = result.webHook;
    actionMsg = 'CREATED';
  }

  if (!webhookDetails || !webhookDetails.id ) { 
    throw new Error('Failed creating WebHook');
  }

  storage.addHook(
    accessInfo.id, webhookDetails.id, pryvApiEndpoint, 
    eventsQuery, storage.status.ACTIVE, webhookDetails);
    
  queue.addTasks(hook.accessId, [queue.Changes.ACTIVATE, queue.Changes.EVENTS, queue.Changes.STREAMS]);
  return {result: 'OK', actionMsg: actionMsg, webhook: webhookDetails};
};


/**
 * handle Triggers from Pryv.io
 * 
 */
exports.handleTrigger = async function (accessId, triggerData) {
  
  if (! triggerData || ! triggerData.messages) {
    throw Error('Invalid or missing trigger messages');
  }
  const changes = [];
  // convert TEST & BOOT to changeStream and changeEvents
  triggerData.messages.forEach((change) => { 
    switch (change) {
      case queue.Changes.TEST:
      case queue.Changes.BOOT:
        changes.push(queue.Changes.STREAMS);
        changes.push(queue.Changes.EVENTS);
      break;
      default:
        changes.push(change);
      break;
    }
  });
  queue.addTasks(accessId, changes);
  return {result: 'OK'};
};


/**
 * Check all hooks status and reactivate them
 */
exports.reactivateAllHooks = function() {
  storage.allHooksAccessIds().forEach((hook) => { 
    queue.addTasks(hook.accessId, [queue.Changes.ACTIVATE, queue.Changes.EVENTS, queue.Changes.STREAMS]);
  });
}