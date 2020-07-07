/*global describe, it */
const request = require('supertest');
const should = require('should');

const app = require('../../src/app.js');
const config = require('../../src/utils/config.js');
const stateStorage = require('../../src/state-storage/');

const testHook = config.get('test:hooks')[0];

describe('hooks', function () {

  // it('Create', function (done) {
  //   request.post(serverBasePath + '/hook')
  //     .set('Accept', 'application/json')
  //     .set('Accept-Charset', 'utf-8')
  //     .set('Accept-Encoding', 'gzip, deflate')
  //     .set('Content-Type', 'application/json')
  //     .send({
  //       pryvApiEndpoint: testhook.apiEndpoint
  //     })
  //     .end(function (err, res) {
  //       should.exist(res);
  //       should.exist(res.body.result);
  //       should.equal(res.body.result,'OK');
  //       res.status.should.equal(200);
  //       done();
  //     });
  // });

  // it('Check hook with empty string apiEndpoint', function(done){
  //   request.post(serverBasePath + '/hook')
  //   .set('Accept', 'application/json')
  //     .set('Accept-Charset', 'utf-8')
  //     .set('Accept-Encoding', 'gzip, deflate')
  //     .set('Content-Type', 'application/json')
  //     .send({
  //       pryvApiEndpoint: ''
  //     })
  //     .end(function (err, res) {
  //       should.exist(res);
  //       should.exist(res.error);
  //       should.exist(res.error.text);
  //       should.equal(res.error.text,'Something broke!');
  //       res.status.should.equal(500);
  //       done();
  //     });
  // });

  // it('Check hook with no apiEndpoint', function(done){
  //   request.post(serverBasePath + '/hook')
  //   .set('Accept', 'application/json')
  //     .set('Accept-Charset', 'utf-8')
  //     .set('Accept-Encoding', 'gzip, deflate')
  //     .set('Content-Type', 'application/json')
  //     .send()
  //     .end(function (err, res) {
  //       should.exist(res);
  //       should.exist(res.error);
  //       should.exist(res.error.text);
  //       should.equal(res.error.text,'Missing pryvApiEndpoint field');
  //       res.status.should.equal(400);
  //       done();
  //     });
  // });

  // it('Check hook with non authorized apiEndpoint', function(done){
  //   request.post(serverBasePath + '/hook')
  //   .set('Accept', 'application/json')
  //     .set('Accept-Charset', 'utf-8')
  //     .set('Accept-Encoding', 'gzip, deflate')
  //     .set('Content-Type', 'application/json')
  //     .send({
  //       pryvApiEndpoint: nonAuthorizedHook.apiEndpoint
  //     })
  //     .end(function (err, res) {
  //       should.exist(res);
  //       should.exist(res.error);
  //       should.exist(res.error.text);
  //       should.equal(res.error.text,'Something broke!');
  //       res.status.should.equal(500);
  //       done();
  //     });
  // });

  describe('POST /', () => {
    describe('when the webhook does not exist', () => {
      let response;
      
      before(async () => {
        // do API call
        response = await request(app)
          .post('/hook')
          .set('Accept', 'application/json')
          .send({pryvApiEndpoint: testHook.apiEndpoint});
      });

      after(async () => {
        // delete webhook on Pryv.io
        const id = response.body.webhook.id;
        await request(testHook.apiEndpoint).delete('webhooks/'+ id).send();
        // cleanup DB
        stateStorage.deleteHook(response.body.triggerId);
      });

      it('must return a valid response', () => {
        should.exist(response);
        should.exist(response.status);
        should.equal(response.status, 200);
        should.exist(response.body);
        should.exist(response.body.result);
        should.equal(response.body.result, 'OK');
        should.exist(response.body.actionMsg);
        should.equal(response.body.actionMsg, 'CREATED');
        should.exist(response.body.webhook);
      });

      it('must create a row in the local SQLite DB hooks table', () => {
        const triggerId = response.body.triggerId;
        should.exist(stateStorage.hookFortriggerId(triggerId));
        stateStorage.hookFortriggerId(triggerId).then((hook) => {
          should.exist(hook.apiEndpoint);
          should.equal(hook.apiEndpoint, testHook.apiEndpoint);
          should.exist(hook.hookId);
          should.equal(hook.hookId, response.body.webhook.id);
        });
      });
      
      it('must create a Pryv.io webhook', async () => {
        const id = response.body.webhook.id;
        const pryvHookResponse = await request(testHook.apiEndpoint)
          .get('webhooks/' + id)
          .set('Accept', 'application/json')
          .send();
        should.exist(pryvHookResponse);
        should.exist(pryvHookResponse.status);
        should.equal(pryvHookResponse.status, 200);
        should.exist(pryvHookResponse.body.webhook);
        should.deepEqual(pryvHookResponse.body.webhook,response.body.webhook);
      });
    });

    describe('when the webhook exists already', () => {
      let pryvHookResponse;
      let response;
      let oldHookDB;
      let triggerIdsTable;
      
      before(async () => {
        // do API call to create an hook
        let hookCreateResponse = await request(app)
          .post('/hook')
          .set('Accept', 'application/json')
          .send({pryvApiEndpoint: testHook.apiEndpoint});

        // do API call to get the hook on Pryv.io
        const id = hookCreateResponse.body.webhook.id;
        pryvHookResponse = await request(testHook.apiEndpoint)
          .get('webhooks/' + id)
          .set('Accept', 'application/json')
          .send();

        // do select the triggerIds from hooks table in the local SQLite DB and hook of the request
        const triggerId = hookCreateResponse.body.triggerId;
        stateStorage.allHookstriggerIds().then((triggerIds) => triggerIdsTable = triggerIds);
        stateStorage.hookFortriggerId(triggerId).then((hook) => oldHookDB = hook);

        // do API call to create an already existing hook
        response = await request(app)
        .post('/hook')
        .set('Accept', 'application/json')
        .send({pryvApiEndpoint: testHook.apiEndpoint});
      });

      after(async () => {
        // delete webhook on Pryv.io
        const id = response.body.webhook.id;
        await request(testHook.apiEndpoint).delete('webhooks/'+ id).send();
        // cleanup DB
        stateStorage.deleteHook(response.body.triggerId);
      });

      it('must return a valid response', () => {
        should.exist(response);
        should.exist(response.status);
        should.equal(response.status, 200);
        should.exist(response.body);
        should.exist(response.body.result);
        should.equal(response.body.result, 'OK');
        should.exist(response.body.actionMsg);
        should.equal(response.body.actionMsg, 'ALREADY_EXISTS');
      });

      it('must the local SQLite DB hooks table be unchanged', async () => {
        const triggerId = response.body.triggerId;
        stateStorage.allHookstriggerIds().then((triggerIds) => {
          should.exist(triggerIds);
          should.deepEqual(triggerIds, triggerIdsTable);
        });
        stateStorage.hookFortriggerId(triggerId).then((hook) => {
          should.exist(hook);
          should.deepEqual(hook, oldHookDB);
        });
      });

      it('must the hook on Pryv.io be unchanged', async () => {
        const id = response.body.webhook.id;
        const pryvHookResponseAfterSecondCall = await request(testHook.apiEndpoint)
          .get('webhooks/' + id)
          .set('Accept', 'application/json')
          .send();
        should.exist(pryvHookResponseAfterSecondCall);
        should.exist(pryvHookResponseAfterSecondCall.status);
        should.equal(pryvHookResponseAfterSecondCall.status, 200);
        should.exist(pryvHookResponseAfterSecondCall.body.webhook);
        should.deepEqual(pryvHookResponseAfterSecondCall.body.webhook, pryvHookResponse.body.webhook);
      });
    });
  })

});
