'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Main = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Main = exports.Main = function () {
  function Main() {
    _classCallCheck(this, Main);
  }

  _createClass(Main, [{
    key: 'loadConfig',
    value: function loadConfig(program) {
      var config = _fs2.default.existsSync('./config.json') ? require('./config.json') : require('../src/config.json');

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
      return config;
    }
  }]);

  return Main;
}();