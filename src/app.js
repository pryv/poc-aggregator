const express = require('express');
const app = express();
app.use(require('body-parser').json());

const hook = require('./hook.js');
/**
 * @type {StateStoragInterface}
 */
const stateStorage = require('./state-storage/index.js');
const logger = require('./utils/logging.js');
const { key } = require('nconf');


/**
 * Create a Hook
 */
app.post('/hook', async (req, res) => {
  try {
    if(!req.body.pryvApiEndpoint && req.body.pryvApiEndpoint !== ""){
      res.status(400).send('Missing pryvApiEndpoint field');
      
    }
    else{
      const response = await hook.create(req.body.pryvApiEndpoint, {});
      res.send(response)
    }
    
  } catch (error) {
    logger.error('Error Creating hook: ', error);

    if(error.message == "Cannot find endpoint, invalid URL format"){
      res.status(400).send("Cannot find endpoint, invalid pryvApiEndpoint");
    }
    else if(error.message.includes('getaddrinfo')){
      // DNS cannot find the corresponding IP address
      res.status(400).send("Cannot find endpoint, invalid pryvApiEndpoint");
    }
    else if(error.message.includes('Forbidden')){
      // Pryv.io returns a Forbidden due to an incorrect token
      res.status(400).send("Access token not valid");
    }
    else{
      res.status(500).send('Something broke!'); 
    }
    
  }
});

/**
 * Handle webhooks from Pryv.io
 *
 * "messages": [
 *  "eventsChanged",
 *  "streamsChanged"
 * ],
 * "meta": {
 *   "apiVersion": "1.4.11",
 *   "serial": "20190802",
 *   "serverTime": 1586845324.691
 * }
 */
app.post('/trigger/:triggerId', async (req, res) => {
  try {
    logger.info('Trigger ', req.params.triggerId, req.body);
    const result = await hook.handleTrigger(req.params.triggerId, req.body);
    return res.status(200).send({result: 'OK'});
  } catch (error) {
    logger.error('Error Trigger Res: ', error);
    res.status(500).send('Something broke!');
  }
});

(async () => {
  await stateStorage.init();
  await hook.reactivateAllHooks();
})

module.exports = app;

