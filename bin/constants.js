'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Store constants use in whole app
 */
exports.default = {
  TMP_DIR: '.tmp',
  OUT_FILE: '.tmp/out.json',
  PATTERN_JUNIT: 'TEST-*.xml',
  STATUS: {
    PASS: 'pass',
    FAIL: 'fail'
  },
  HEADER: {
    FORM_ENCODED: 'application/x-www-form-urlencoded',
    JSON: 'application/json',
    ZIP: 'application/zip',
    TEXT: 'text/plain'
  },
  TASK_SUCCESS: 'SUCCESS',
  OAUTH_GRANT_TYPE: 'password',
  MAX_RETRY_GET_TASK: 7200 //2 hours
};