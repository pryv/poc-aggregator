const Pryv = require('pryv');
const stateStorage = require('./state-storage/');
const logger = require('./utils/logging.js');
const config = require('./utils/config.js');
const tasks = require('./tasks.js');
const baseTriggerUrl = config.get('service:baseUrl') + 'trigger/';
const cuid = require('cuid');

/**
 * 1. Create Web Hook 
 * 2. Store 
 * 3. Add to tasks queue 
 */
exports.create = async function (pryvApiEndpoint, eventsQuery) {
  const conn = new Pryv.Connection(pryvApiEndpoint);

  // get access Info (necessary to find out the access.id)
  const accessInfo = await conn.get('access-info');
  if (! accessInfo || accessInfo.type !== 'app') {
    throw new Error('pryvApiEndpoint is invalid');
  }

  // here we could also check the validity and the scope of the access
  

  let triggerId = null; // holds the trigger Id for the notification
  let webhookDetails = null; // holds the content forom the API
  let actionMsg = null; // for the result
  // check if webhooks already registered on Pryv.io
  // same triggerId, same triggerUrl 
  const webhooksResult = await conn.get('webhooks');
  if (webhooksResult.webhooks) {
    webhooksResult.webhooks.forEach((webhook) => { 
      if (webhook.accessId === accessInfo.id && 
        webhook.url.startsWith(baseTriggerUrl)) {
        webhookDetails = webhook;
        triggerId = webhook.url.substring(baseTriggerUrl.length);
        actionMsg = 'ALREADY_EXISTS';
      }
    });
  }

  // if not found create it
  if (! webhookDetails) {
    triggerId = cuid();
    const triggerUrl = baseTriggerUrl + accessInfo.id;
    const result = await conn.post('webhooks', { url: triggerUrl });
    webhookDetails = result.webHook;
    actionMsg = 'CREATED';
  }

  if (!webhookDetails || !webhookDetails.id ) { 
    throw new Error('Failed creating WebHook');
  }

  stateStorage.addHook(
    triggerId, webhookDetails.id, pryvApiEndpoint, 
    eventsQuery, stateStorage.status.ACTIVE, webhookDetails);
    
  tasks.addTasks(triggerId, [tasks.Changes.ACTIVATE, tasks.Changes.STREAMS, tasks.Changes.EVENTS]);
  return { result: 'OK', actionMsg: actionMsg, webhook: webhookDetails, triggerId: triggerId};
};


/**
 * handle Triggers from Pryv.io
 * 
 */
exports.handleTrigger = async function (triggerId, triggerData) {
  
  if (! triggerData || ! triggerData.messages) {
    throw Error('Invalid or missing trigger messages');
  }
  const changes = [];
  // convert TEST & BOOT to changeStream and changeEvents
  triggerData.messages.forEach((change) => { 
    switch (change) {
      case tasks.Changes.TEST:
      case tasks.Changes.BOOT:
        changes.push(tasks.Changes.STREAMS);
        changes.push(tasks.Changes.EVENTS);
      break;
      default:
        changes.push(change);
      break;
    }
  });
  tasks.addTasks(triggerId, changes);
  return {result: 'OK'};
};


/**
 * Check all hooks status and reactivate them
 */
exports.reactivateAllHooks = async function() {
  await stateStorage.allHookstriggerIds().forEach((hook) => { 
    tasks.addTasks(hook.triggerId, [tasks.Changes.ACTIVATE, tasks.Changes.EVENTS, tasks.Changes.STREAMS]);
  });
}