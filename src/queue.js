/**
 * Tasks are queued to be processed asynchronously.
 * 
 */
const logger = require('./logging');
const storage = require('./storage');
const Pryv = require('pryv');
const listners = require('./listners');

const queue = []; // in-order accessIds to process
const tasks = {}; // key - value set of tasks per accessIds
let running = false; // set to true when queue is currently running


/**
* Add a new task for this accessId
* @param {string} accessId
* @param {Array<Changes>} taskList
*/
function addTasks(accessId, taskList) { 
  taskList.forEach(task => {
    if (!tasks[accessId]) {
      tasks[accessId] = new Set(); // to ensure unicity of tasks
      queue.unshift(accessId);
    }
    tasks[accessId].add(task);
  });
  if (! running) {
    next();
  }
}

/**
 * @typedef Changes
 * @property {string} EVENTS "eventsChanged"
 * @property {string} STREAMS "streamsChanged"
 * @property {string} ACTIVATE "activate"
 * @property {string} TEST "test"
 * @property {string} BOOT "webhooksServiceBoot"
 */

/** 
 * Enum trigger messages 
 * @readonly
 * @enum {Changes}
 */
const Changes = {
  EVENTS: 'eventsChanged',
  STREAMS: 'streamsChanged',
  ACTIVATE: 'activate',
  TEST: 'test',
  BOOT: 'webhooksServiceBoot' 
};

module.exports = {
  addTasks: addTasks,
  Changes: Changes
}

// ----------- internals --------- ///

async function next() {
  // end loop if empty 
  if (queue.length === 0) {
    running = false;
    return;
  }
  running = false;
  const accessId = queue.pop();
  const taskSet = tasks[accessId];
  console.log(tasks);
  if (! taskSet) { 
    throw new Error('Integrity Error ');
  }
  delete tasks[accessId]; 

  // set a next action in xx ms 
  setTimeout(async function () {
    await doTask(accessId, taskSet);
    next();
  }, 500); // too long should be changed an paralellized
}

/**
 * @param {string} accessId 
 * @param {Set} taskSet 
 */
async function doTask(accessId, taskSet) { 
  const hook = storage.hookForAccessId(accessId);
  if (! hook) { 
    logger.error('Cannot find hook for accessId: ' + accessId);
    return; 
  }
  // get connextion
  const conn = new Pryv.Connection(hook.apiEndpoint);
  
  for (let change of taskSet) {
    switch (change) {
      case Changes.ACTIVATE:
        await activateHook(accessId, conn, hook);
      break;
      case Changes.EVENTS: 
        await getEvents(accessId, conn, hook);
      break;
      case Changes.STREAMS:
        await getStreams(accessId, conn, hook);
      break;
    }
  }

 
}

async function activateHook(accessId, conn, hook) {
  const res = await conn.api([{
    method: 'webhooks.update',
    params: { id: 'ck92g505000m81fd3flsxgwdb', update: { state: 'active' }}
  }]);
  if (res && res[0] && res[0].webhook) {
    storage.updateHookDetail(accessId, res[0].webhook);
  }

  console.log(JSON.stringify(res));
}

async function getStreams(accessId, conn, hook) {
  const result = await conn.get('streams');
  listners.newStreams(accessId, result.streams);
}

async function getEvents(accessId, conn, hook) {
  const queryParams = {
    limit: 5,
    fromTime: - Number.MAX_VALUE,
    setTime: Number.MAX_VALUE
  }
  Object.assign(queryParams, hook.eventsQuery);
  queryParams.includeDeletions = true;
  queryParams.modifiedSince = hook.lastSync / 1000;
  
  let lastModified = queryParams.modifiedSince;
  function forEachEvent(event) {
    if (event.modified > lastModified) {
      lastModified = event.modified;
    }
    if (event.deleted) {
      listners.deletedEvent(accessId, event);
    } else { 
      listners.newOrUpdateEvent(accessId, event);
    }
  }
  await conn.getEventsStreamed(queryParams, forEachEvent);
  storage.updateLastSync(accessId, lastModified * 1000);
  return lastModified * 1000;
}