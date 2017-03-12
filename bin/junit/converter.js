'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.from = from;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function time(raw) {
  return +(+(raw || 0)).toFixed(2);
}

function summary(raw) {
  return {
    'tests': time(raw.tests),
    'failures': time(raw.failures),
    'skipped': time(raw.skipped || raw.skips),
    'errors': time(raw.errors)
  };
}

function failure(raw, sysErr, sysOut) {
  return {
    'type': raw.$.type,
    'message': raw.$.message,
    'raw': raw._,
    'error': sysErr,
    'out': sysOut
  };
}

function tests(raw) {
  return (0, _lodash2.default)(raw).map(function (test) {
    var current = (test.failure || [])[0] || { $: {}, _: '' };
    var sysErr = (test['system-err'] || [])[0] || '';
    var sysOut = (test['system-out'] || [])[0] || '';

    return (0, _lodash2.default)({
      'classname': test.$.classname,
      'name': test.$.name,
      'time': time(test.$.time),
      'failure': failure(current, sysErr, sysOut),
      'status': 'pass'
    }).tap(function (result) {
      !test.failure && delete result.failure && (result.status = 'fail');
    }).value();
  }).value();
}

function extras(raw) {
  var sysOut = raw['system-out'];
  var sysErr = raw['system-err'];
  return {
    'output': sysOut ? sysOut[0] : '',
    'errors': sysErr ? sysErr[0] : ''
  };
}

function from(raw) {
  var rawSuite = raw.testsuite || { $: {} };

  var parsed = {
    'name': rawSuite.$.name,
    'time': time(rawSuite.$.time),
    'summary': summary(rawSuite.$),
    'tests': tests(rawSuite.testcase),
    'extras': extras(rawSuite)
  };

  return { 'suite': parsed };
}