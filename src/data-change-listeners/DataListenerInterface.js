/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */

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