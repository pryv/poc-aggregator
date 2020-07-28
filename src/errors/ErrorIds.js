/**
 * @license
 * Copyright (c) 2020 Pryv S.A. https://pryv.com
 * 
 * This file is part of Open-Pryv.io and released under BSD-Clause-3 License
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, 
 *    this list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice, 
 *    this list of conditions and the following disclaimer in the documentation 
 *    and/or other materials provided with the distribution.
 * 
 * 3. Neither the name of the copyright holder nor the names of its contributors 
 *    may be used to endorse or promote products derived from this software 
 *    without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE 
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL 
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR 
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, 
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE 
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * SPDX-License-Identifier: BSD-3-Clause
 * 
 */
// @flow

/**
 * Identifier constants for API errors.
 */
const ErrorIds = {
    ApiUnavailable: 'api-unavailable',
    ApiInvalid: 'api-invalid',
    HookIssue: 'hook-issue',
    CorruptedData: 'corrupted-data',
    Forbidden: 'forbidden',
    InvalidAccessToken: 'invalid-access-token',
    InvalidCredentials: 'invalid-credentials',
    /**
     * Used for High-Frequency Series, allowing only known, simple types.
     */
    InvalidEventType: 'invalid-event-type',
    InvalidItemId: 'invalid-item-id',
    /**
     * Used for Socket.IO support.
     */
    InvalidMethod: 'invalid-method',
    InvalidOperation: 'invalid-operation',
    InvalidParametersFormat: 'invalid-parameters-format',
    InvalidRequestStructure: 'invalid-request-structure',
    ItemAlreadyExists: 'item-already-exists',
    MissingHeader: 'missing-header',
    PeriodsOverlap: 'periods-overlap',
    UnexpectedError: 'unexpected-error',
    UnknownReferencedResource: 'unknown-referenced-resource',
    UnknownResource: 'unknown-resource',
    UnsupportedContentType: 'unsupported-content-type',
    /**
     * Used for Batch calls and Socket.IO events.get result storing
     */
    TooManyResults: 'too-many-results',
    /**
     * Used for removed API methods
     */
    Gone: 'removed-method',
    /**
     * Used for open source version
     */
    unavailableMethod: 'unavailable-method',
  
    // those last two are not in use yet but already documented (see API reference for details)
  
    UserAccountRelocated: 'user-account-relocated',
    UserInterventionRequired: 'user-intervention-required'
  };
  Object.freeze(ErrorIds);
  
  module.exports = ErrorIds;