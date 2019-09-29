var MINI3D = (function (exports) {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var GLHelper =
  /*#__PURE__*/
  function () {
    function GLHelper() {
      _classCallCheck(this, GLHelper);
    }

    _createClass(GLHelper, null, [{
      key: "initWebGL",
      value: function initWebGL(canvas) {
        var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
        var context = null;

        for (var i = 0; i < names.length; ++i) {
          try {
            context = canvas.getContext(names[i]);
          } catch (e) {}

          if (context) {
            break;
          }
        }

        return context;
      }
    }]);

    return GLHelper;
  }();

  var Shader = function Shader() {
    _classCallCheck(this, Shader);

    console.log('shader');
  };

  exports.GLHelper = GLHelper;
  exports.Shader = Shader;

  return exports;

}({}));
//# sourceMappingURL=mini3d.js.map
