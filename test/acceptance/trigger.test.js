/*global describe, it */
const config = require('../../src/utils/config.js'),
  request = require('superagent');


const should = require('should');
require('../../src/server');

const serverBasePath = 'http://' + config.get('server:ip') + ':' + config.get('server:port');
const testhook = config.get('test:hooks')[0];

describe('Trigger', function () {

  describe('When adding a new event', () => {

    before(() => {
      // create on Pryv.io API

      // wait for notification
    });

    it('must fetch the new event', () => {
      // See that data storage was updated in aggregator
    })
  })

  it('Create', function (done) {
    request.post(serverBasePath + '/trigger/' + testhook.triggerId)
      .set('Accept', 'application/json')
      .set('Accept-Charset', 'utf-8')
      .set('Accept-Encoding', 'gzip, deflate')
      .set('Content-Type', 'application/json')
      .send({
        "messages": [
          "eventsChanged",
          "streamsChanged"
        ],
        "meta": {
          "apiVersion": "1.4.11",
          "serial": "20190802",
          "serverTime": Date.now() / 1000
        }
      })
      .end(function (err, res) {
        should.exist(res);
        res.status.should.equal(200);
        should.exist(res.body.result);
        should.equal(res.body.result,'OK');
        done();
      });
  });

});
