/*global describe, it */
const request = require('supertest');
const should = require('should');

const app = require('../../src/app.js');
const config = require('../../src/utils/config.js');
const stateStorage = require('../../src/state-storage/');

const userHook = config.get('test:hooks')[0];
const wrongAddressHook = config.get('test:hooks')[1];
const wrongTokenHook = config.get('test:hooks')[2];

describe('hooks', () => {

  describe('POST /', () => {
    describe('when the webhook does not exist', () => {
      let response;
      let triggerId;
      
      before(async () => {
        // do API call
        response = await request(app)
          .post('/hook')
          .set('Accept', 'application/json')
          .send({pryvApiEndpoint: userHook.apiEndpoint});
        triggerId = response.body.triggerId;
      });

      after(async () => {
        setTimeout(async () => {
          const id = response.body.webhook.id;
          // delete webhook on Pryv.io
          await request(userHook.apiEndpoint).delete('webhooks/'+ id).send();
          // cleanup DB
          stateStorage.deleteHook(response.body.triggerId);
        },400);
       
       
        // const id = response.body.webhook.id;
        // // delete webhook on Pryv.io
        // await request(userHook.apiEndpoint).delete('webhooks/'+ id).send();
        // // cleanup DB
        // stateStorage.deleteHook(response.body.triggerId);
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
        should.exist(stateStorage.hookFortriggerId(triggerId));
        stateStorage.hookFortriggerId(triggerId).then((hook) => {
          should.exist(hook.apiEndpoint);
          should.equal(hook.apiEndpoint, userHook.apiEndpoint);
          should.exist(hook.hookId);
          should.equal(hook.hookId, response.body.webhook.id);
        });
      });
      
      it('must create a Pryv.io webhook', async () => {
        const id = response.body.webhook.id;
        const pryvHookResponse = await request(userHook.apiEndpoint)
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
          .send({pryvApiEndpoint: userHook.apiEndpoint});

        // do API call to get the hook on Pryv.io
        const id = hookCreateResponse.body.webhook.id;
        pryvHookResponse = await request(userHook.apiEndpoint)
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
        .send({pryvApiEndpoint: userHook.apiEndpoint});
      });

      after(async () => {
        setTimeout(async () => {
          const id = response.body.webhook.id;
          // delete webhook on Pryv.io
          await request(userHook.apiEndpoint).delete('webhooks/'+ id).send();
          // cleanup DB
          stateStorage.deleteHook(response.body.triggerId);
        },900);
       
       
        // const id = response.body.webhook.id;
        // // delete webhook on Pryv.io
        // await request(userHook.apiEndpoint).delete('webhooks/'+ id).send();
        // // cleanup DB
        // stateStorage.deleteHook(response.body.triggerId);
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
          should.equal(triggerIds.length, triggerIdsTable.length);
        });
        stateStorage.hookFortriggerId(triggerId).then((hook) => {
          should.exist(hook);
          should.deepEqual(hook, oldHookDB);
        });
      });

      it('must the hook on Pryv.io be unchanged', async () => {
        setTimeout(async () => {
          const id = response.body.webhook.id;
          const pryvHookResponseAfterSecondCall = await request(userHook.apiEndpoint)
            .get('webhooks/' + id)
            .set('Accept', 'application/json')
            .send();
          should.exist(pryvHookResponseAfterSecondCall);
          should.exist(pryvHookResponseAfterSecondCall.status);
          should.equal(pryvHookResponseAfterSecondCall.status, 200);
          should.exist(pryvHookResponseAfterSecondCall.body.webhook);
          should.deepEqual(pryvHookResponseAfterSecondCall.body.webhook, pryvHookResponse.body.webhook);

        },400);
      });
    });

    describe('when the apiEndpoint is incorrect', () => {
      describe('when the apiEndpoint is the empty string', () => {
        let response;
        let oldDB;

        before(async () => {
          response = await request(app)
            .post('/hook')
            .set('Accept', 'application/json')
            .send({pryvApiEndpoint: ""});
          stateStorage.allHookstriggerIds().then((triggerIds) => oldDB = triggerIds);
        });

        it('must return a valid response', () => {
          should.exist(response);
          should.exist(response.status);
          should.equal(response.status, 400);
          should.exist(response.text);
          should.equal(response.text, "api-invalid: : Cannot find endpoint, invalid pryvApiEndpoint");
        });

        it('must the local SQLite DB hooks table be unchanged', async () => {
          stateStorage.allHookstriggerIds().then((triggerIds) => should.deepEqual(triggerIds,oldDB));
        });
      });

      describe('when the apiEndpoint is not provided', () => {
        let response;
        let oldDB;

        before(async () => {
          response = await request(app)
            .post('/hook')
            .set('Accept', 'application/json')
            .send({});
          stateStorage.allHookstriggerIds().then((triggerIds) => oldDB = triggerIds);
        });

        it('must return a valid response', () => {
          should.exist(response);
          should.exist(response.status);
          should.equal(response.status, 400);
          should.exist(response.text);
          should.equal(response.text, "Missing pryvApiEndpoint field");
        });

        it('must the local SQLite DB hooks table be unchanged', async () => {
          stateStorage.allHookstriggerIds().then((triggerIds) => should.deepEqual(triggerIds,oldDB));
        });

      });

      describe('when the apiEndpoint is not valid', () => {
        let response;
        let oldDB;

        before(async () => {
          response = await request(app)
            .post('/hook')
            .set('Accept', 'application/json')
            .send({pryvApiEndpoint: wrongAddressHook.apiEndpoint});
          stateStorage.allHookstriggerIds().then((triggerIds) => oldDB = triggerIds);
        });

        it('must return a valid response', () => {
          should.exist(response);
          should.exist(response.status);
          should.equal(response.status, 400);
          should.exist(response.text);
          should.equal(response.text, "api-invalid: "+wrongAddressHook.apiEndpoint+ ": Cannot find endpoint, invalid pryvApiEndpoint");
        });

        it('must the local SQLite DB hooks table be unchanged', async () => {
          stateStorage.allHookstriggerIds().then((triggerIds) => should.deepEqual(triggerIds,oldDB));
        });

      });

      describe('when the access token is not valid', () => {
        let response;
        let oldDB;

        before(async () => {
          response = await request(app)
            .post('/hook')
            .set('Accept', 'application/json')
            .send({pryvApiEndpoint: wrongTokenHook.apiEndpoint});
          stateStorage.allHookstriggerIds().then((triggerIds) => oldDB = triggerIds);
        });

        it('must return a valid response', () => {
          should.exist(response);
          should.exist(response.status);
          should.equal(response.status, 403);
          should.exist(response.text);
          should.equal(response.text, "forbidden: https://0000000000000000000000000@aggregatorpryv.pryv.me/: Access token not valid");
        });

        it('must the local SQLite DB hooks table be unchanged', async () => {
          stateStorage.allHookstriggerIds().then((triggerIds) => should.deepEqual(triggerIds,oldDB));
        });

      });

    });
  });
});