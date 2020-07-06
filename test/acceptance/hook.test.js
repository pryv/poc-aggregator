/*global describe, it */
const config = require('../../src/utils/config.js');
const Pryv = require('pryv');
const request = require('supertest');


const should = require('should');
const app = require('../../src/app.js');

const serverBasePath = 'http://' + config.get('server:ip') + ':' + config.get('server:port');
const testhook = config.get('test:hooks')[0];
const testNewHook = config.get('test:hooks')[1];
const nonAuthorizedHook = config.get('test:hooks')[2];

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
          .post(serverBasePath + '/hook')
          .set('Accept', 'application/json')
          .send({pryvApiEndpoint: testNewHook.apiEndpoint});
      });
      after(() => {
        // delete webhook on Pryv.io
        // cleanup DB here or at the beginning of file?
      });

      it('must return a valid response', () => {

      });
      it('must create a row in the local SQLite DB hooks table', () => {

      });
      it('must create a Pryv.io webhook', () => {

      });
    })
  })

  it('Check that webhook was created', function(done){
    request.post(serverBasePath + '/hook')
    .set('Accept', 'application/json')
      .send({
        pryvApiEndpoint: testNewHook.apiEndpoint
      })
      .end(async function (err, res) {
        // Receive Result of the creation of the new hook
        should.exist(res);
        should.exist(res.body.triggerId);
        should.equal(res.body.result,'OK');
        res.status.should.equal(200);

        // Create a connection to Pryv to check if the hook was created.
        const conn = new Pryv.Connection(testNewHook.apiEndpoint);
        const webhooksResult = await conn.get('webhooks');
        const accessInfo = await conn.get('access-info');
        const accessId = res.body.webhook.accessId;
        check = false;

        // Check if the new hook is in the list of hooks.
        if (webhooksResult.webhooks) {
          webhooksResult.webhooks.forEach((webhook) => { 
            if (webhook.accessId === accessId) {
              check = true;
            }
          });
        }
        should.equal(check,true);

        done();
      });
  });
  
  it('If webhook exists, not create a new one', function(done){
    retrieveHook(testNewHook.apiEndpoint).then(function (tmpWebhook){
      request.post(serverBasePath + '/hook')
      .set('Accept', 'application/json')
      .set('Accept-Charset', 'utf-8')
      .set('Accept-Encoding', 'gzip, deflate')
      .set('Content-Type', 'application/json')
      .send({
        pryvApiEndpoint: testNewHook.apiEndpoint
      })
      .end(function (err, res) {
        should.exist(res);
        should.exist(res.body.actionMsg);
        should.equal(res.body.actionMsg,'ALREADY_EXISTS');
        res.status.should.equal(200);
        should.deepEqual(res.body.webhook,tmpWebhook);
        done();
      });
    })
    
      
  });

  retrieveHook = async function(apiEndpoint){
    const conn = new Pryv.Connection(testNewHook.apiEndpoint);
    const webhooksResult = await conn.get('webhooks');
    return webhooksResult.webhooks[0];
  }

});
