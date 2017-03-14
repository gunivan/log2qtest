'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.App = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _junit = require('./junit');

var _qtest = require('./qtest');

var _constants = require('./constants');

var _constants2 = _interopRequireDefault(_constants);

var _stopWatch = require('./stopWatch');

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
    key: 'createConfig',
    value: function createConfig() {
      try {
        var defaultConfig = require(_path2.default.resolve(__dirname, './default.config.json'));
        var sampleConfigFile = _path2.default.resolve(process.cwd(), 'config.json');
        _fs2.default.writeFileSync(sampleConfigFile, JSON.stringify(defaultConfig, null, 2));
        console.log(_chalk2.default.cyan('Created config.json at current directory.'));
      } catch (e) {
        console.log(_chalk2.default.yellow('Cannot create file config.json at current directory', e));
      }
    }
  }, {
    key: 'loadConfig',
    value: function loadConfig(program) {
      var config = {};
      try {
        config = require(_path2.default.resolve(process.cwd(), 'config.json'));
        console.log(_chalk2.default.cyan('Found config.json at current directory.'));
      } catch (e) {
        console.log(_chalk2.default.yellow('Not found config.json at current directory, use default console params.', e));
        config = {};
      }
      config = Object.assign(config, {
        host: program.host || config.host,
        username: program.username || config.username,
        password: program.password || config.password,
        project: program.project || config.project,
        suite: program.suite || config.suite,
        module: program.module || config.module,
        dir: program.dir || config.dir,
        pattern: program.pattern || config.pattern,
        methodAsTestCase: program.methodAsTestCase || config.methodAsTestCase,
        exeDate: program.exeDate || config.exeDate,
        startDate: new Date().toISOString()
      });
      return config;
    }
  }, {
    key: 'printConfig',
    value: function printConfig(config) {
      config.host && console.log(_chalk2.default.green('qTest url: ' + config.host));
      config.project && console.log(_chalk2.default.green('Project: ' + config.project));
      config.suite && console.log(_chalk2.default.green('Test suite: ' + config.suite));
      config.module && console.log(_chalk2.default.green('Parent module: ' + config.module));
      console.log(_chalk2.default.green('Result dir: ' + (config.dir || './')));
      console.log(_chalk2.default.green('Pattern: ' + (config.pattern || _constants2.default.PATTERN_JUNIT)));
      console.log(_chalk2.default.green('Method as Test Case: ' + (config.methodAsTestCase || false)));
      console.log(_chalk2.default.green('Execution date: ' + (config.exeDate || '')));
    }
  }, {
    key: 'parse',
    value: function parse(config) {
      var parser = new _junit.Parser();
      return parser.parse(config);
    }
  }, {
    key: 'parseThenSubmit',
    value: function parseThenSubmit(config) {
      var parser = new _junit.Parser();
      var bar = new _progress2.default('Parse and submit to qTest [:bar] :percent :etas \n', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: 2
      });
      var stopwatch = new _stopWatch.Stopwatch();
      parser.parse(config).then(function (suites) {
        console.log(_chalk2.default.blue('Done parse JUnit xml file in ' + stopwatch.eslaped()));
        //set end time
        var totalTime = 0;
        (0, _lodash2.default)(suites).map(function (suite) {
          totalTime += suite.time * 1000;
        });
        config.endDate = new Date(new Date(config.startDate).getTime() + totalTime).toISOString();
        bar.tick();

        var submitter = new _qtest.Submitter();

        submitter.login(config).then(function (token) {
          config.token = token;
          console.log('Token:', token);
          stopwatch.reset();
          submitter.submit(config, suites).then(function (res) {
            bar.tick();
            console.log(_chalk2.default.blue('Done submit in ' + stopwatch.eslaped()));
            if (res.id) {
              console.log('Submit success', res);
              submitter.waitTaskDone(config, res.id, res.status);
            } else {
              console.error(_chalk2.default.red('Submit fail:', res.message));
            }
          }).catch(function (e) {
            console.error(_chalk2.default.red('Error while submit:', e));
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