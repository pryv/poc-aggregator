/**
 * Tasks 
 * 
 * Holds a "queue" with tasks 
 *  - queue keeps in order 
 * 
 */
const logger = require('./utils/logging');
const storage = require('./state-storage/');
const Pryv = require('pryv');
const listners = require('./data-change');

const queue = []; // in-order triggerIds to process
const tasks = {}; // key - value set of tasks per triggerIds
let running = false; // set to true when queue is currently running


/**
* Add a new task for this triggerId
* @param {string} triggerId
* @param {Array<Changes>} taskList
*/
function addTasks(triggerId, taskList) { 
  taskList.forEach(task => {
    if (!tasks[triggerId]) {
      tasks[triggerId] = new Set(); // to ensure unicity of tasks
      queue.unshift(triggerId);
    }
    tasks[triggerId].add(task);
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
  const triggerId = queue.pop();
  const taskSet = tasks[triggerId];
  if (! taskSet) { 
    throw new Error('Integrity Error ');
  }
  delete tasks[triggerId]; 
  // set a next action in xx ms 
  setTimeout(async function () {
    await doTask(triggerId, taskSet);
    next();
  }, 500); // too long should be changed an paralellized
}

/**
 * @param {string} triggerId 
 * @param {Set} taskSet 
 */
async function doTask(triggerId, taskSet) { 
  const hook = await storage.hookFortriggerId(triggerId);
  if (! hook || ! hook.apiEndpoint) { 
    logger.error('Cannot find hook for triggerId: ' + triggerId);
    return; 
  }

  // get connextion
  const conn = new Pryv.Connection(hook.apiEndpoint);
  
  for (let change of taskSet) {
    switch (change) {
      case Changes.ACTIVATE:
        await activateHook(triggerId, conn, hook);
      break;
      case Changes.EVENTS: 
        await getEvents(triggerId, conn, hook);
      break;
      case Changes.STREAMS:
        await getStreams(triggerId, conn, hook);
      break;
    }
  }
}

async function activateHook(triggerId, conn, hook) {
  const res = await conn.api([{
    method: 'webhooks.update',
    params: { id: 'ck92g505000m81fd3flsxgwdb', update: { state: 'active' }}
  }]);
  if (res && res[0] && res[0].webhook) {
    await storage.updateHookDetail(triggerId, res[0].webhook);
    listners.newHook(triggerId, {pryvApiEndpoint: conn.apiEndpoint, hook: res[0].webhook});
  }
}

async function getStreams(triggerId, conn, hook) {
  const result = await conn.get('streams');
  listners.newStreams(triggerId, result.streams);
}

async function getEvents(triggerId, conn, hook) {
  const queryParams = {
    fromTime: - Number.MAX_VALUE,
    setTime: Number.MAX_VALUE
  }
  Object.assign(queryParams, hook.eventsQuery);
  queryParams.includeDeletions = true;
  queryParams.state = 'all';
  queryParams.modifiedSince = hook.lastSync / 1000;
  
  let lastModified = queryParams.modifiedSince;
  function forEachEvent(event) {
    if (event.modified > lastModified) {
      lastModified = event.modified;
    }
    if (event.deleted) {
      listners.deletedEvent(triggerId, event);
    } else { 
      listners.newOrUpdateEvent(triggerId, event);
    }
  }
  await conn.getEventsStreamed(queryParams, forEachEvent);
  await storage.updateLastSync(triggerId, lastModified * 1000);
  return lastModified * 1000;
}