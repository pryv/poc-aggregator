const Pryv = require('pryv');
const stateStorage = require('./state-storage/');
const logger = require('./utils/logging.js');
const config = require('./utils/config.js');
const tasks = require('./tasks.js');
const baseTriggerUrl = config.get('service:baseUrl') + 'trigger/';
const cuid = require('cuid');
const listners = require('./data-change');
const ConnectionError = require('./errors/ConnectionError');
const errorIds = require('./errors/ErrorIds');

/**
 * 1. Create Web Hook 
 * 2. Store 
 * 3. Add to tasks queue 
 */
exports.create = async function (pryvApiEndpoint, eventsQuery) {
  let conn
  try{
    conn = new Pryv.Connection(pryvApiEndpoint);
  }
  catch(e){
    throw new ConnectionError(errorIds.ApiInvalid, 'Cannot find endpoint, invalid pryvApiEndpoint', pryvApiEndpoint, 400);
  }
  // get access Info (necessary to find out the access.id)
  let accessInfo;
  try{

    accessInfo = await conn.get('access-info');
  }
  catch(e){
    if(e.message == "Cannot find endpoint, invalid URL format"){
      throw new ConnectionError(errorIds.ApiInvalid,'Cannot find endpoint, invalid pryvApiEndpoint',pryvApiEndpoint, 400)
    }
    else if(e.message.includes('Forbidden')){
      throw new ConnectionError(errorIds.Forbidden, 'Access token not valid', pryvApiEndpoint, 403)
    }
    else{
      throw new ConnectionError(errorIds.ApiInvalid,'Cannot find endpoint, invalid pryvApiEndpoint',pryvApiEndpoint, 400)
    }
  }
  if (! accessInfo || accessInfo.type !== 'app') {
    throw new ConnectionError(errorIds.ApiInvalid,'Cannot find endpoint, invalid pryvApiEndpoint',pryvApiEndpoint, 400)
    //throw new Error('pryvApiEndpoint is invalid');
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
  if (!webhookDetails) {
    triggerId = cuid();
    const triggerUrl = baseTriggerUrl + accessInfo.id;
    const result = await conn.post('webhooks', { url: triggerUrl });
    webhookDetails = result.webhook;
    actionMsg = 'CREATED';
  }

  if (!webhookDetails || !webhookDetails.id ) { 
    throw new ConnectionError(errorIds.HookIssue,"Failed to create a Webhook",pryvApiEndpoint,500);
    //throw new Error('Failed creating WebHook');
  }
  stateStorage.addHook(
    triggerId, webhookDetails.id, pryvApiEndpoint, 
    eventsQuery, stateStorage.status.ACTIVE, webhookDetails);
  
  listners.newHook(triggerId, {pryvApiEndpoint, hook: webhookDetails});
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
    // optimize here!!!!

    // Load EVENTS and STREAMS only if last run was Faulty .. 

  });
}