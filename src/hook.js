const Pryv = require('pryv');
const storage = require('./storage.js');
const logger = require('./logging.js');
const config = require('./config.js');

const baseTriggerUrl = config.get('service:baseUrl') + 'trigger/';

/**
 * handle Triggers from Pryv.io
 * 
 */
exports.handleTrigger = async function (triggerData) {
  if (!triggerData || !triggerData.sourceUpdate) {
    throw Error('Invalid or missing trigger data');
  }
};

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

  storage.addHook(accessInfo.id, pryvApiEndpoint, eventsQuery, storage.status.ACTIVE, webhookDetails);
  return {result: 'OK', actionMsg: actionMsg, webhook: webhookDetails};
};




/**
 * check all users that need to be updated
 * Known to be BOGUS  and UNFINISHED
 */
async function checkForUpdateAll() {
  const ulist = storage.getAllToBeSynched();
  return await Promise.all(ulist.map(async function (user) {
    const params = {
      pryvEndpoint: user.pryvEndpoint,
      thryveToken: user.thryveToken,
      startDate: new Date(user.lastSynch),
      endDate: new Date(),
      thryveSourceCode: -1
    };
    await fetchFromThryveToPryv({...params}, true);
  }));
}

exports.checkForUpdateAll = checkForUpdateAll;
