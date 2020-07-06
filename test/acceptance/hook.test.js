/*global describe, it */
const config = require('../../src/utils/config.js'),
  request = require('superagent');


const should = require('should');
require('../../src/server');

const serverBasePath = 'http://' + config.get('server:ip') + ':' + config.get('server:port');
const testhook = config.get('test:hooks')[0];

describe('Hook', function () {

  it('Create', function (done) {
    request.post(serverBasePath + '/hook')
      .set('Accept', 'application/json')
      .set('Accept-Charset', 'utf-8')
      .set('Accept-Encoding', 'gzip, deflate')
      .set('Content-Type', 'application/json')
      .send({
        pryvApiEndpoint: testhook.apiEndpoint
      })
      .end(function (err, res) {
        should.exist(res);
        should.exist(res.body.result);
        should.equal(res.body.result,'OK');
        res.status.should.equal(200);
        done();
      });
  });

  // TODO
  it('Check hook with invalid apiEndpoint', function(done){
    request.post(serverBasePath + '/hook')
    .set('Accept', 'application/json')
      .set('Accept-Charset', 'utf-8')
      .set('Accept-Encoding', 'gzip, deflate')
      .set('Content-Type', 'application/json')
      .send({
        pryvApiEndpoint: '0'
      })
      .end(function (err, res) {
        should.exist(res);
        should.exist(res.error);
        should.exist(res.error.text);
        should.equal(res.error.text,'Something broke!');
        res.status.should.equal(500);
        done();
      });
  });

});
