'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Parser = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _xml2js = require('xml2js');

var _xml2js2 = _interopRequireDefault(_xml2js);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _constants = require('../constants');

var _constants2 = _interopRequireDefault(_constants);

var _converter = require('./converter');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Parser junit xml to objects
 */
var Parser = exports.Parser = function () {
  function Parser() {
    _classCallCheck(this, Parser);
  }

  _createClass(Parser, [{
    key: 'parseFromXml',

    /**
     * parse from junit xml string to model
     * @param {*} xml 
     */
    value: function parseFromXml(xml) {
      return new Promise(function (resolve, reject) {
        _xml2js2.default.parseString(xml, function (error, raw) {
          if (error) {
            throw new Error(error);
          }
          resolve((0, _converter.from)(raw));
        });
      });
    }

    /**
     * parse with save file
     * @param {*} file 
     */

  }, {
    key: 'parseFromFiles',
    value: function parseFromFiles(files) {
      var _this = this;

      var funcParseFiles = (0, _lodash2.default)(files).map(function (file) {
        var xml = _fs2.default.readFileSync(file).toString();
        console.log('Read text from file [' + file + '], has text: ' + (xml != null) + '...');
        return _this.parseFromXml(xml);
      }).value();
      return Promise.all(funcParseFiles).then(function (results) {
        console.log('Save objects to file [' + _constants2.default.OUT_FILE + ']...');
        if (!_fs2.default.existsSync(_constants2.default.TMP_DIR)) {
          _fs2.default.mkdirSync(_constants2.default.TMP_DIR);
        }
        _fs2.default.writeFileSync(_constants2.default.OUT_FILE, JSON.stringify(results));
        return results;
      }).catch(function (e) {
        throw new Error(e);
      });
    }
  }, {
    key: 'listFiles',
    value: function listFiles(config) {
      var pattern = '' + (config.pattern || _constants2.default.PATTERN_JUNIT);
      var options = {
        'root': _path2.default.resolve('./')
      };
      if (_fs2.default.existsSync(config.dir)) {
        options.root = _path2.default.resolve(config.dir);
      }
      console.log('List JUnit file with pattern: ' + pattern + ' under folder: ' + options.root);

      return new Promise(function (resolve, reject) {
        (0, _glob2.default)(pattern, options, function (error, files) {
          if (error) {
            throw new Error('Error while list file with pattern ' + pattern + ', error ' + error);
          }
          resolve(files);
        });
      });
    }
    /**
     * Return object structure
     {
        name : '',
        time : '',
        summary : {
          tests : ''
          failures : ,
          skipped : ,
          errors : {}
        },
        tests : [{
            name : '',
            time : '',
            failure : {
              type : '',
              message : '',
              raw : '',
              error : '',
              out : ''
            }
          }
        ],
        extras : {
          output : '',
          errors : ''
        }
      }
     * @param {*} config
     */

  }, {
    key: 'parse',
    value: function parse(config) {
      var _this2 = this;

      var force = config.force || true;
      if (force) {
        return this.listFiles(config).then(function (files) {
          return _this2.parseFromFiles(files);
        });
      } else {
        console.log('Load from saved file.');
        return new Promise(function (resolve, reject) {
          resolve(require(_constants2.default.OUT_FILE));
        });
      }
    }
  }]);

  return Parser;
}();