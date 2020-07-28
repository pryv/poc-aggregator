/*global describe, it */
const request = require('supertest');
const should = require('should');
const ServerMock = require("mock-http-server");

const app = require('../../src/app.js');
const config = require('../../src/utils/config.js');
const stateStorage = require('../../src/state-storage/');
const dataChangeEmitter = require('../../src/data-change');
const DataListenerConsole = require('../../src/data-change/DataListenerSQLite');
const dataStorage = new DataListenerConsole(dataChangeEmitter,"../../db-data.sqlite");
const { response } = require('express');


const userHook = config.get('test:hooks')[0];
const testServerHook = config.get('test:hooks')[3];
const newStream = config.get('mockServer:streams')[0];
const updateStream = config.get('mockServer:streams')[1];

const streamsChangedTrigger = config.get('test:triggers')[0];
const eventsChangedTrigger = config.get('test:triggers')[1];

const port = config.get('testServer:port');
const ip = config.get('testServer:ip');
let testServer = new ServerMock({host: ip, port: port});
let triggerId;

let streamAction = null;
let isNewEventAdded = false;

describe('trigger', () =>{
  describe('POST /', () => {
    
    
    describe('when adding a new stream', () => {
      let responseHooks;
      let responseTrigger;
      
      before((done) => {
        streamAction = "add";
        runMockServer(done);
      });
      
      before(async () => {
        responseHooks = await request(app)
        .post('/hook')
        .set('Accept', 'application/json')
        .send({pryvApiEndpoint: testServerHook.apiEndpoint});
        triggerId = responseHooks.body.triggerId;
        
        responseTrigger = await request(app)
        .post('/trigger/' + triggerId)
        .set('Accept', 'application/json')
        .send(streamsChangedTrigger);
        
      });
      
      after((done) => {
        setTimeout(() => {
          testServer.stop(done);
        },1000)
      });
      
      after(() => {
        setTimeout(() => {
          dataStorage.deleteAllEvents(triggerId);
          dataStorage.deleteStreams(triggerId);
          dataStorage.deleteHook(triggerId);
          stateStorage.deleteHook(triggerId);
        }, 900);
        
        
      });
      
      
      it('must return a valid response', () => {
        should.exist(responseHooks);
        should.exist(responseHooks.body);
        should.exist(responseHooks.body.result);
        should.equal(responseHooks.body.result, "OK");
        should.exist(responseHooks.status);
        should.equal(responseHooks.status, 200);
        
        should.exist(responseTrigger);
        should.exist(responseTrigger.body);
        should.exist(responseTrigger.body.result);
        should.equal(responseTrigger.body.result, "OK");
        should.exist(responseTrigger.status);
        should.equal(responseTrigger.status, 200);
      });
      
      it('must add the new streams in the DB', () => {
        setTimeout(() => {
          should.exist(dataStorage.selectAllStreams(triggerId));
          should.exist(dataStorage.selectAllStreams(triggerId)['streamsData']);
          should.equal(dataStorage.selectAllStreams(triggerId)['streamsData'], JSON.stringify(newStream.streams));
        }, 800)
        
      })
    });
    
    describe('when update a stream', () => {
      let responseHooks;
      let responseTrigger;
      let oldStreams;
      
      before((done) => {
        streamAction = "update";
        runMockServer(done);
      });
      
      before(async () => {
        responseHooks = await request(app)
        .post('/hook')
        .set('Accept', 'application/json')
        .send({pryvApiEndpoint: testServerHook.apiEndpoint});
        triggerId = responseHooks.body.triggerId;
        
        responseTrigger = await request(app)
        .post('/trigger/' + triggerId)
        .set('Accept', 'application/json')
        .send(streamsChangedTrigger);
        
      });
      
      after((done) => {
        setTimeout(() => {
          testServer.stop(done);
        },1000)
      });
      
      after(() => {
        setTimeout(() => {
          dataStorage.deleteAllEvents(triggerId);
          dataStorage.deleteStreams(triggerId);
          dataStorage.deleteHook(triggerId);
          stateStorage.deleteHook(triggerId);
        }, 900);
        
        
      });
      
      
      it('must return a valid response', () => {
        should.exist(responseHooks);
        should.exist(responseHooks.body);
        should.exist(responseHooks.body.result);
        should.equal(responseHooks.body.result, "OK");
        should.exist(responseHooks.status);
        should.equal(responseHooks.status, 200);
        
        should.exist(responseTrigger);
        should.exist(responseTrigger.body);
        should.exist(responseTrigger.body.result);
        should.equal(responseTrigger.body.result, "OK");
        should.exist(responseTrigger.status);
        should.equal(responseTrigger.status, 200);
      });
      
      it('must update streams in the DB', () => {
        setTimeout(() => {
          should.exist(dataStorage.selectAllStreams(triggerId));
          should.exist(dataStorage.selectAllStreams(triggerId)['streamsData']);
          should.equal(dataStorage.selectAllStreams(triggerId)['streamsData'], JSON.stringify(updateStream.streams));
        }, 800);
        
      });

    });

    // describe('when adding a new event', () => {
    //   let responseHooks;
    //   let responseTrigger;
      
    //   before((done) => {
    //     streamAction = null;
    //     runMockServer(done);
    //   });
      
    //   before(async () => {
    //     responseHooks = await request(app)
    //     .post('/hook')
    //     .set('Accept', 'application/json')
    //     .send({pryvApiEndpoint: testServerHook.apiEndpoint});
    //     triggerId = responseHooks.body.triggerId;
        
    //     responseTrigger = await request(app)
    //     .post('/trigger/' + triggerId)
    //     .set('Accept', 'application/json')
    //     .send(eventsChangedTrigger);
        
    //   });
      
    //   after((done) => {
    //     setTimeout(() => {
    //       testServer.stop(done);
    //     },1000)
    //   });
      
    //   after(() => {
    //     setTimeout(() => {
    //       dataStorage.deleteAllEvents(triggerId);
    //       dataStorage.deleteStreams(triggerId);
    //       dataStorage.deleteHook(triggerId);
    //       stateStorage.deleteHook(triggerId);
    //     }, 900);
        
        
    //   });
      
      
    //   it('must return a valid response', () => {
    //     should.exist(responseHooks);
    //     should.exist(responseHooks.body);
    //     should.exist(responseHooks.body.result);
    //     should.equal(responseHooks.body.result, "OK");
    //     should.exist(responseHooks.status);
    //     should.equal(responseHooks.status, 200);
        
    //     should.exist(responseTrigger);
    //     should.exist(responseTrigger.body);
    //     should.exist(responseTrigger.body.result);
    //     should.equal(responseTrigger.body.result, "OK");
    //     should.exist(responseTrigger.status);
    //     should.equal(responseTrigger.status, 200);
    //   });
      
    //   it('must update streams in the DB', () => {
    //     setTimeout(() => {
    //       should.exist(dataStorage.selectAllStreams(triggerId));
    //       should.exist(dataStorage.selectAllStreams(triggerId)['streamsData']);
    //       should.equal(dataStorage.selectAllStreams(triggerId)['streamsData'], JSON.stringify(updateStream.streams));
    //     }, 800);
        
    //   });

    // });

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
  const newEvent = config.get('mockServer:events');
  const newHook = config.get("mockServer:webhook");
  let streamFirstCall = false;
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
      body: JSON.stringify(helperEvent())
    }
  });
  testServer.on({
    method : 'GET',
    path : "/streams",
    reply : {
      status: 200,
      headers: { "content-type": "application/json" },
      body: function(){
        return JSON.stringify(helperStream())
      }
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
      body: JSON.stringify(newHook)
    }
  });
  
  function helperEvent(){
    if(!isNewEventAdded){
      return {'events': [], "meta": {
        "apiVersion": "1.5.17",
        "serverTime": 1594284160.555,
        "serial": "2019061301"
      }
    }
  }
  return newEvent;
  
}
function helperStream(){
  switch(streamAction){
    case "add":
    if(!streamFirstCall){
      streamFirstCall = true;
      return {
        "meta": {
          "apiVersion": "1.5.17",
          "serverTime": 1594277259.933,
          "serial": "2019061301"
        },
        "streams": []
      }
    }
    return newStream;
    case "update" : 
    if(!streamFirstCall){
      streamFirstCall = true;
      return newStream;
    }
    return updateStream;
    default:
      return newStream;
  }
  
  
}
}