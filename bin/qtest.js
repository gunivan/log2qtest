'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Submitter = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodeRestClient = require('node-rest-client');

var _constants = require('./constants');

var _constants2 = _interopRequireDefault(_constants);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

;


var client = new _nodeRestClient.Client();

/**
 * Functional connect to qTest
 */

var Submitter = exports.Submitter = function () {
  function Submitter() {
    _classCallCheck(this, Submitter);
  }

  _createClass(Submitter, [{
    key: 'login',

    /**
     * Login to qTest to get access token
     */
    value: function login(config) {
      var loginUrl = config.host + '/oauth/token';
      var headerAuth = 'Basic ' + Buffer.from(config.username + ':').toString('base64');
      var args = {
        parameters: {
          username: config.username,
          password: config.password,
          grant_type: _constants2.default.OAUTH_GRANT_TYPE
        },
        headers: {
          'Authorization': headerAuth,
          'Content-Type': _constants2.default.HEADER.FORM_ENCODED
        }
      };
      console.log(_chalk2.default.cyan('Login to qTest at:', loginUrl));
      return new Promise(function (resolve, reject) {
        client.post(loginUrl, args, function (data, response) {
          if (data.error) {
            console.error(_chalk2.default.red('Error while login to qTest:'), data);
            throw new Error(error);
          }
          resolve(data.access_token);
        });
      });
    }
    /**
     * Get task
     * @param {*} config 
     * @param {*} id 
     */

  }, {
    key: 'getTask',
    value: function getTask(config, id) {
      var url = config.host + '/api/v3/projects/queue-processing/' + id;
      var args = {
        headers: {
          'Authorization': 'Bearer ' + config.token,
          'Content-Type': _constants2.default.HEADER.JSON
        }
      };
      return new Promise(function (resolve, reject) {
        client.get(url, args, function (data, response) {
          if (data.error) {
            console.error(_chalk2.default.red('Error while get task:'), data);
            throw new Error(error);
          }
          resolve(data);
        });
      });
    }

    /**
     * 
     * @param {*} submitter 
     * @param {*} config 
     * @param {*} id 
     * @param {*} status 
     */

  }, {
    key: 'waitTaskDone',
    value: function waitTaskDone(config, id, status) {
      var _this2 = this;

      var state = status;
      var itvId = setInterval(function () {
        _this2.getTask(config, id).then(function (res) {
          state !== res.state && console.log(_chalk2.default.cyan('Status: ', res.state));
          state = res.state;
          if (_constants2.default.TASK_SUCCESS === state) {
            clearInterval(itvId);
          }
        }).catch(function (e) {
          console.error(_chalk2.default.red('Error while get task ' + id, e));
          clearInterval(itvId);
        });
      }, 1000);
    }

    /**
     * Build submit data from suites then submit to qTest
     * @param {*} data @see parser.parse
     */

  }, {
    key: 'submit',
    value: function submit(config, suites) {
      console.log('Submit', suites.suite.summary);
      var url = config.host + '/api/v3.1/projects/' + config.project + '/test-runs/0/auto-test-logs?type=automation';
      var testLogs = this.buildTestLogs(config, suites.suite);
      console.log(_chalk2.default.cyan('Test logs ' + testLogs.length));
      console.log(_chalk2.default.cyan('Submit to qTest...'));
      var submitData = (0, _lodash2.default)({
        'test_logs': testLogs
      }).value();
      config.module && (submitData['parent_module'] = config.module);
      config.suite && (submitData['test_suite'] = config.suite);
      config.exeDate && (submitData['execution_date'] = config.exeDate);
      var args = {
        data: submitData,
        headers: {
          'Authorization': 'Bearer ' + config.token,
          'Content-Type': _constants2.default.HEADER.JSON
        }
      };
      return new Promise(function (resolve, reject) {
        client.post(url, args, function (data, response) {
          if (data.error) {
            console.error(_chalk2.default.red('Error while submit logs to qTest:', data));
            throw new Error(error);
          }
          resolve(data);
        });
      });
    }

    /**
     * Build testLogs from suite
     * @param {*} config 
     * @param {*} suite 
     */

  }, {
    key: 'buildTestLogs',
    value: function buildTestLogs(config, suite) {
      console.log(_chalk2.default.cyan('Method as testcase: ' + config.methodAsTestCase));
      var _this = this;
      if (config.methodAsTestCase) {
        return (0, _lodash2.default)(suite.tests).map(function (test) {
          return (0, _lodash2.default)(_this.buildTestLog(config, [test], test.classname)).tap(function (testLog) {
            testLog['status'] = config.status[test.status];
          }).value();
        }).value();
      } else {
        return (0, _lodash2.default)(suite.tests).groupBy('classname').map(function (tests, classname) {
          var fail = false;
          _lodash2.default.each(tests, function (test) {
            if ('fail' === test.status) {
              fail = true;
            };
          });
          return (0, _lodash2.default)(_this.buildTestLog(config, tests, classname)).tap(function (testLog) {
            testLog['status'] = config.status[fail ? 'fail' : 'pass'];
          }).value();
        }).value();
      }
    }
    /**
     * Build testLog
     * @param {*} config 
     * @param {*} tests 
     * @param {*} classname 
     */

  }, {
    key: 'buildTestLog',
    value: function buildTestLog(config, tests, classname) {
      var testLog = {
        'name': classname,
        'automation_content': classname,
        'exe_start_date': config.startDate,
        'exe_end_date': config.endDate
      };
      // testLog['attachments'] = _(tests)
      //   .map(test => {
      //     _({
      //       'name': '',
      //       'content_type': 'text/plain',
      //       'data':''
      //     }).value()
      //   });
      testLog['test_step_logs'] = (0, _lodash2.default)(tests).map(function (test) {
        return (0, _lodash2.default)({
          'description': test.name,
          'expected_result': test.name,
          'actual_result': test.name,
          'status': test.status
        }).value();
      }).value();
      return (0, _lodash2.default)(testLog).value();
    }
  }]);

  return Submitter;
}();