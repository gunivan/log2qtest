'use strict';
import _ from 'lodash';

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
  return _(raw).map((test) => {
    var current = (test.failure || [])[0] || { $: {}, _: '' };
    var sysErr = (test['system-err'] || [])[0] || '';
    var sysOut = (test['system-out'] || [])[0] || '';

    return _({
      'classname': test.$.classname,
      'name': test.$.name,
      'time': time(test.$.time),
      'failure': failure(current, sysErr, sysOut),
      'status': 'pass'
    }).tap((result) => { !test.failure && delete result.failure && (result.status = 'fail'); }).value();
  }).value();
}

function extras(raw) {
  let sysOut = raw['system-out'];
  let sysErr = raw['system-err'];
  return {
    'output': sysOut ? sysOut[0] : '',
    'errors': sysErr ? sysErr[0] : ''
  };
}

export function from(raw) {
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
