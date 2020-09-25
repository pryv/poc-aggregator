
class DataListenerInterface {

  /**
   * @param {DataChangeEmmitter} emitter 
   * @param {Object} params 
   */
  constructor(emitter, params) { 
    this.emitter = emitter;
    // nothing to do yet
  }
  /**
   * Optional
   */
  async init() {

  }
}

module.exports = DataListenerInterface;