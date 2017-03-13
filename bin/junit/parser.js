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
        console.log('Parse xml string to objects');
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
    key: 'parseFromFile',
    value: function parseFromFile(file) {
      var xml = _fs2.default.readFileSync(file).toString();
      console.log('Read text from file [' + file + '], has text: ' + (xml != null));
      return this.parseFromXml(xml).then(function (res) {
        console.log('Save objects to file [' + _constants2.default.OUT_FILE + ']');
        if (!_fs2.default.existsSync(_constants2.default.TMP_DIR)) {
          _fs2.default.mkdirSync(_constants2.default.TMP_DIR);
        }
        _fs2.default.writeFile(_constants2.default.OUT_FILE, JSON.stringify(res), function (status) {
          console.log('Done save to file [' + _constants2.default.OUT_FILE + ']');
        });
        return res;
      }).catch(function (e) {
        throw e;
      });
    }

    /**
     * Return object structure
     {
      suite: {
        name: '',
        time: '',
        summary: {
          tests: ''
          failures: ,
          skipped: ,
          errors: {}
        },
        tests: [{
          name: '',
          time: '',
          failure: {
            type: '',
            message: '',
            raw: '',
            error: '',
            out: ''}
        }],
        extras: {
          output: '',
          errors: ''
        }
      }
    }
     * @param {*} config
     */

  }, {
    key: 'parse',
    value: function parse(config) {
      var file = config.dir;
      var force = config.force || true;
      //!fs.existsSync(Constants.OUT_FILE)
      if (force) {
        console.log('Parse from ' + file + ' then persists.');
        return this.parseFromFile(file);
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