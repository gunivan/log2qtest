#!/usr/bin/env node --harmony
'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _junit = require('./junit');

var _app = require('./app');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.version(_package2.default.version).description(_package2.default.description).option('-c, --config', 'Generate sample config file.').option('-p, --parse <dir>', 'Parse Junit xml files').option('-s, --submit', 'Submit logs to qTest').option('-H, --host <host>', 'qTest site url').option('-u, --username <username>', 'qTest username').option('-w, --password <password>', 'qTest user pasword').option('-p, --project <project>', 'qTest project id', parseInt).option('-s, --suite <suite>', 'qTest testsuite that test runs will be located', parseInt).option('-m, --module <module>', 'qTest parent module that Automation module will be located ', parseInt).option('-t, --exeDate <exedate>', 'Execution date in format as yyyy-MM-dd').option('-M, --methodAsTestCase <true|false>', 'Junit method as qTest testcase').on('--help', function () {
  console.log('Examples:');
  console.log('  -Parse junit xml file:');
  console.log('     log2qtest -p <xml file>');
  console.log('  -Submit parsed logs to qTest:');
  console.log('     log2qtest -p <xml file> -s');
}).parse(process.argv);

var app = new _app.App();
if (_commander2.default.config) {
  app.createConfig();
} else {
  var config = app.loadConfig(_commander2.default);
  var parser = new _junit.Parser();

  if (_commander2.default.submit) {
    app.parseThenSubmit(config, parser);
  } else if (_fs2.default.existsSync(_commander2.default.parse)) {
    parser.parse(config);
  }
}