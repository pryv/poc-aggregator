/*global describe, it */
const request = require('supertest');
const should = require('should');
const ServerMock = require("mock-http-server");

const app = require('../../src/app.js');
const config = require('../../src/utils/config.js');
const stateStorage = require('../../src/state-storage/');
const { response } = require('express');


const userHook = config.get('test:hooks')[0];
const testServerHook = config.get('test:hooks')[3];

const triggerOrder = config.get('test:trigger');

const port = config.get('testServer:port');
const ip = config.get('testServer:ip');
let testServer = new ServerMock({host: ip, port: port});


describe('trigger', () =>{
  describe('POST /', () => {
    before((done) => {
      runMockServer(done);
    });
    after((done) => {
      setTimeout(() => {
        testServer.stop(done);
      },1000)
      //testServer.stop(done);
    });
    describe('when adding a new stream', () => {
      let responseHooks;
      let streamId;
      before(async () => {
        responseHooks = await request(app)
          .post('/hook')
          .set('Accept', 'application/json')
          .send({pryvApiEndpoint: testServerHook.apiEndpoint});
        stateStorage.allHookstriggerIds()
          .then(async (triggers) => {
            let triggerId = (triggers[1])['triggerId'];
            responseTrigger = await request(app)
              .post('/trigger/' + triggerId)
              .set('Accept', 'application/json')
              .send(triggerOrder);
        });
        
        setTimeout(async () => {
          
          // responseTrigger = await request(app)
          // .post('/trigger/' + triggerId)
          // .set('Accept', 'application/json')
          // .send(triggerOrder)
        },400);
        
        
      });
      
      after(async () => {
        // Suppress stream (need two calls to suppress definitively)
        //await request(userHook.apiEndpoint).delete('streams/' + streamId).send();
        //await request(userHook.apiEndpoint).delete('streams/' + streamId).send();
      });
      
      
      it('must return a valid response', () => {
        // Create a stream, take streamID and then create an event
        // To suppres event and stream, have to call two time DELETE
        should.exist(responseHooks);
        should.exist(responseHooks.body);
        should.exist(responseHooks.body.result);
        should.equal(responseHooks.body.result, "OK");
        should.exist(responseHooks.status);
        should.exist(responseHooks.status);
        
 
      });
    });
  });
  
  
  // it('Create', function (done) {
  //   request.post(serverBasePath + '/trigger/' + testhook.triggerId)
  //     .set('Accept', 'application/json')
  //     .set('Accept-Charset', 'utf-8')
  //     .set('Accept-Encoding', 'gzip, deflate')
  //     .set('Content-Type', 'application/json')
  //     .send({
  //       "messages": [
  //         "eventsChanged",
  //         "streamsChanged"
  //       ],
  //       "meta": {
  //         "apiVersion": "1.4.11",
  //         "serial": "20190802",
  //         "serverTime": Date.now() / 1000
  //       }
  //     })
  //     .end(function (err, res) {
  //       should.exist(res);
  //       res.status.should.equal(200);
  //       should.exist(res.body.result);
  //       should.equal(res.body.result,'OK');
  //       done();
  //     });
  // });
  
});

function runMockServer(callback){
  const accessInfo = config.get('mockServer:access-info');
  const webhooks = config.get('mockServer:listWebhooks');
  const activateHook = config.get('mockServer:activateHook');
  const newStream = config.get('mockServer:streams')[0];
  const newEvent = config.get('mockServer:events');
  let triggerId;
  stateStorage.allHookstriggerIds().then((trigger) => triggerId = trigger[0]);
  testServer.on({
    method : 'GET',
    path : "/access-info",
    reply : {
      status: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(accessInfo)
    }
  });
  testServer.on({
    method : 'GET',
    path : "/webhooks",
    reply : {
      status: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(webhooks)
    }
  });

  testServer.on({
    method : 'GET',
    path : "/events",
    reply : {
      status: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(newEvent)
    }
  });
  testServer.on({
    method : 'GET',
    path : "/streams",
    reply : {
      status: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(newStream)
    }
  });
  testServer.on({
    method : 'POST',
    path : "/",
    reply : {
      status: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(activateHook)
    }
  });
  testServer.start(callback);
  testServer.on({
    method : 'POST',
    path : '/webhooks',
    reply: {
      status: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        meta : {
          serverTime : 1594208146.108
        },
        triggerId:0,
        body : {
          result: "OK"
        },
        webhook : {
          id : "0"
        }
      })
    }
  });
}
