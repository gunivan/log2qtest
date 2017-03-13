'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Stopwatch = exports.Stopwatch = function () {
  function Stopwatch() {
    _classCallCheck(this, Stopwatch);

    this.start = new Date();
  }

  _createClass(Stopwatch, [{
    key: 'start',
    value: function start() {}
  }, {
    key: 'reset',
    value: function reset() {
      this.start = new Date();
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.end = new Date();
    }
  }, {
    key: 'eslaped',
    value: function eslaped() {
      var end = this.end || new Date();
      var duration = end - this.start;
      var minutes = parseInt(duration / (1000 * 60) % 60);
      var seconds = parseFloat(duration / 1000 % 60).toFixed(1);
      return minutes + ' ' + (minutes > 0 ? 'mins' : 'min') + ' ' + seconds + ' secs';
    }
  }]);

  return Stopwatch;
}();