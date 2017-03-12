'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fromFiles = fromFiles;
exports.fromStrings = fromStrings;

var _parser = require('./parser');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import async from 'async';
function fromFiles(listOfFiles) {
  var deferred = _q2.default.defer();

  var listOfReads = (0, _lodash2.default)(listOfFiles).map(function (file) {
    return function (callback) {
      _fs2.default.readFile(file, callback);
    };
  }).value();

  // async.parallel(listOfReads, function (error, contents) {
  //   if (error) {
  //     deferred.reject(new Error(error));
  //   } else {
  //     deferred.resolve(exports.strings(_(contents).invoke('toString').value()));
  //   }
  // });

  return deferred.promise;
}

function fromStrings(listOfStrings) {
  return (0, _lodash2.default)(listOfStrings).map(_parser.parse).value();
}