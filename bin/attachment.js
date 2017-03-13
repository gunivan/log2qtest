"use strict";
'use stricts';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Attachment = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _nodeNativeZip = require("node-native-zip");

var _nodeNativeZip2 = _interopRequireDefault(_nodeNativeZip);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Attachment = exports.Attachment = function () {
  function Attachment() {
    _classCallCheck(this, Attachment);
  }

  _createClass(Attachment, [{
    key: "buildText",

    /**
     * Convert string to base64
     * @param {*} data 
     */
    value: function buildText(data) {
      return new Buffer(data, 'utf8').toString('base64');
    }
    /**
     * Convert list string to zip stream
     * @param {*} failures an array with fields: name, and message
     */

  }, {
    key: "buildZip",
    value: function buildZip(failures) {
      var archive = new _nodeNativeZip2.default();
      _lodash2.default.each(failures, function (item) {
        archive.add(item.name + ".txt", new Buffer(item.message, "utf8"));
      });
      return archive.toBuffer().toString('base64');
    }
  }]);

  return Attachment;
}();