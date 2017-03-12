'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.App = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

var _junit = require('./junit');

var _qtest = require('./qtest');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Main function for application
 */
var App = exports.App = function () {
  function App() {
    _classCallCheck(this, App);
  }

  _createClass(App, [{
    key: 'loadConfig',
    value: function loadConfig(program) {
      var config = {};
      try {
        config = require('../config.json');
        console.log('Found config.json at current directory.');
      } catch (e) {
        console.log('Not found config.json at current directory, use default console params.');
        config = {};
      }
      config = Object.assign(config, {
        host: program.host || config.host,
        username: program.username || config.username,
        password: program.password || config.password,
        token: program.token || config.token,
        project: program.project || config.project,
        suite: program.suite || config.suite,
        module: program.module || config.module,
        dir: program.parse || config.dir,
        methodAsTestCase: program.methodAsTestCase || config.methodAsTestCase,
        exeDate: program.exeDate || config.exe_date,
        startDate: new Date().toISOString()
      });
      delete config.exe_date;
      return config;
    }
  }, {
    key: 'parseThenSubmit',
    value: function parseThenSubmit(config, parser) {
      var bar = new _progress2.default('Parse and submit to qTest [:bar] :percent :etas', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: 2
      });
      parser.parse(config).then(function (data) {
        //set end time
        config.endDate = new Date(new Date(config.startDate).getTime() + data.suite.time * 1000).toISOString();
        bar.tick();
        console.log(_chalk2.default.blue('  Parse done'));

        var submitter = new _qtest.Submitter();

        submitter.login(config).then(function (token) {
          config.token = token;
          console.log('Token:', token);
          submitter.submit(config, data).then(function (res) {
            console.log(_chalk2.default.blue('Submit success', res));
            bar.tick();
            submitter.waitTaskDone(config, res.id, res.status);
          }).catch(function (e) {
            console.error(_chalk2.default.red('Error while submit', e));
            bar.tick();
          });
        });
      }).catch(function (e) {
        bar.tick();
        console.error(_chalk2.default.red('Error:', e));
      });
    }
  }]);

  return App;
}();