var main = (function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var O = 'object';
	var check = function (it) {
	  return it && it.Math == Math && it;
	};

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global_1 =
	  // eslint-disable-next-line no-undef
	  check(typeof globalThis == O && globalThis) ||
	  check(typeof window == O && window) ||
	  check(typeof self == O && self) ||
	  check(typeof commonjsGlobal == O && commonjsGlobal) ||
	  // eslint-disable-next-line no-new-func
	  Function('return this')();

	var fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	// Thank's IE8 for his funny defineProperty
	var descriptors = !fails(function () {
	  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
	});

	var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// Nashorn ~ JDK8 bug
	var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

	// `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
	var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : nativePropertyIsEnumerable;

	var objectPropertyIsEnumerable = {
		f: f
	};

	var createPropertyDescriptor = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var toString = {}.toString;

	var classofRaw = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	var split = ''.split;

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var indexedObject = fails(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins
	  return !Object('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
	} : Object;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on " + it);
	  return it;
	};

	// toObject with fallback for non-array-like ES3 strings



	var toIndexedObject = function (it) {
	  return indexedObject(requireObjectCoercible(it));
	};

	var isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	// `ToPrimitive` abstract operation
	// https://tc39.github.io/ecma262/#sec-toprimitive
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	var toPrimitive = function (input, PREFERRED_STRING) {
	  if (!isObject(input)) return input;
	  var fn, val;
	  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var hasOwnProperty = {}.hasOwnProperty;

	var has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var document = global_1.document;
	// typeof document.createElement is 'object' in old IE
	var EXISTS = isObject(document) && isObject(document.createElement);

	var documentCreateElement = function (it) {
	  return EXISTS ? document.createElement(it) : {};
	};

	// Thank's IE8 for his funny defineProperty
	var ie8DomDefine = !descriptors && !fails(function () {
	  return Object.defineProperty(documentCreateElement('div'), 'a', {
	    get: function () { return 7; }
	  }).a != 7;
	});

	var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// `Object.getOwnPropertyDescriptor` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
	var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject(O);
	  P = toPrimitive(P, true);
	  if (ie8DomDefine) try {
	    return nativeGetOwnPropertyDescriptor(O, P);
	  } catch (error) { /* empty */ }
	  if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
	};

	var objectGetOwnPropertyDescriptor = {
		f: f$1
	};

	var anObject = function (it) {
	  if (!isObject(it)) {
	    throw TypeError(String(it) + ' is not an object');
	  } return it;
	};

	var nativeDefineProperty = Object.defineProperty;

	// `Object.defineProperty` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperty
	var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if (ie8DomDefine) try {
	    return nativeDefineProperty(O, P, Attributes);
	  } catch (error) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var objectDefineProperty = {
		f: f$2
	};

	var hide = descriptors ? function (object, key, value) {
	  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var setGlobal = function (key, value) {
	  try {
	    hide(global_1, key, value);
	  } catch (error) {
	    global_1[key] = value;
	  } return value;
	};

	var shared = createCommonjsModule(function (module) {
	var SHARED = '__core-js_shared__';
	var store = global_1[SHARED] || setGlobal(SHARED, {});

	(module.exports = function (key, value) {
	  return store[key] || (store[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: '3.2.1',
	  mode:  'global',
	  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
	});
	});

	var functionToString = shared('native-function-to-string', Function.toString);

	var WeakMap = global_1.WeakMap;

	var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(functionToString.call(WeakMap));

	var id = 0;
	var postfix = Math.random();

	var uid = function (key) {
	  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
	};

	var keys = shared('keys');

	var sharedKey = function (key) {
	  return keys[key] || (keys[key] = uid(key));
	};

	var hiddenKeys = {};

	var WeakMap$1 = global_1.WeakMap;
	var set, get, has$1;

	var enforce = function (it) {
	  return has$1(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;
	    if (!isObject(it) || (state = get(it)).type !== TYPE) {
	      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
	    } return state;
	  };
	};

	if (nativeWeakMap) {
	  var store = new WeakMap$1();
	  var wmget = store.get;
	  var wmhas = store.has;
	  var wmset = store.set;
	  set = function (it, metadata) {
	    wmset.call(store, it, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return wmget.call(store, it) || {};
	  };
	  has$1 = function (it) {
	    return wmhas.call(store, it);
	  };
	} else {
	  var STATE = sharedKey('state');
	  hiddenKeys[STATE] = true;
	  set = function (it, metadata) {
	    hide(it, STATE, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return has(it, STATE) ? it[STATE] : {};
	  };
	  has$1 = function (it) {
	    return has(it, STATE);
	  };
	}

	var internalState = {
	  set: set,
	  get: get,
	  has: has$1,
	  enforce: enforce,
	  getterFor: getterFor
	};

	var redefine = createCommonjsModule(function (module) {
	var getInternalState = internalState.get;
	var enforceInternalState = internalState.enforce;
	var TEMPLATE = String(functionToString).split('toString');

	shared('inspectSource', function (it) {
	  return functionToString.call(it);
	});

	(module.exports = function (O, key, value, options) {
	  var unsafe = options ? !!options.unsafe : false;
	  var simple = options ? !!options.enumerable : false;
	  var noTargetGet = options ? !!options.noTargetGet : false;
	  if (typeof value == 'function') {
	    if (typeof key == 'string' && !has(value, 'name')) hide(value, 'name', key);
	    enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
	  }
	  if (O === global_1) {
	    if (simple) O[key] = value;
	    else setGlobal(key, value);
	    return;
	  } else if (!unsafe) {
	    delete O[key];
	  } else if (!noTargetGet && O[key]) {
	    simple = true;
	  }
	  if (simple) O[key] = value;
	  else hide(O, key, value);
	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, 'toString', function toString() {
	  return typeof this == 'function' && getInternalState(this).source || functionToString.call(this);
	});
	});

	var path = global_1;

	var aFunction = function (variable) {
	  return typeof variable == 'function' ? variable : undefined;
	};

	var getBuiltIn = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace])
	    : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
	};

	var ceil = Math.ceil;
	var floor = Math.floor;

	// `ToInteger` abstract operation
	// https://tc39.github.io/ecma262/#sec-tointeger
	var toInteger = function (argument) {
	  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
	};

	var min = Math.min;

	// `ToLength` abstract operation
	// https://tc39.github.io/ecma262/#sec-tolength
	var toLength = function (argument) {
	  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var max = Math.max;
	var min$1 = Math.min;

	// Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(length, length).
	var toAbsoluteIndex = function (index, length) {
	  var integer = toInteger(index);
	  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
	};

	// `Array.prototype.{ indexOf, includes }` methods implementation
	var createMethod = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject($this);
	    var length = toLength(O.length);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare
	      if (value != value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	var arrayIncludes = {
	  // `Array.prototype.includes` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
	  includes: createMethod(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod(false)
	};

	var indexOf = arrayIncludes.indexOf;


	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (has(O, key = names[i++])) {
	    ~indexOf(result, key) || result.push(key);
	  }
	  return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys = [
	  'constructor',
	  'hasOwnProperty',
	  'isPrototypeOf',
	  'propertyIsEnumerable',
	  'toLocaleString',
	  'toString',
	  'valueOf'
	];

	var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype');

	// `Object.getOwnPropertyNames` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
	var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return objectKeysInternal(O, hiddenKeys$1);
	};

	var objectGetOwnPropertyNames = {
		f: f$3
	};

	var f$4 = Object.getOwnPropertySymbols;

	var objectGetOwnPropertySymbols = {
		f: f$4
	};

	// all object keys, includes non-enumerable and symbols
	var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = objectGetOwnPropertyNames.f(anObject(it));
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
	};

	var copyConstructorProperties = function (target, source) {
	  var keys = ownKeys(source);
	  var defineProperty = objectDefineProperty.f;
	  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	  }
	};

	var replacement = /#|\.prototype\./;

	var isForced = function (feature, detection) {
	  var value = data[normalize(feature)];
	  return value == POLYFILL ? true
	    : value == NATIVE ? false
	    : typeof detection == 'function' ? fails(detection)
	    : !!detection;
	};

	var normalize = isForced.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data = isForced.data = {};
	var NATIVE = isForced.NATIVE = 'N';
	var POLYFILL = isForced.POLYFILL = 'P';

	var isForced_1 = isForced;

	var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;






	/*
	  options.target      - name of the target object
	  options.global      - target is the global object
	  options.stat        - export as static methods of target
	  options.proto       - export as prototype methods of target
	  options.real        - real prototype method for the `pure` version
	  options.forced      - export even if the native feature is available
	  options.bind        - bind methods to the target, required for the `pure` version
	  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
	  options.sham        - add a flag to not completely full polyfills
	  options.enumerable  - export as enumerable property
	  options.noTargetGet - prevent calling a getter on target
	*/
	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
	  if (GLOBAL) {
	    target = global_1;
	  } else if (STATIC) {
	    target = global_1[TARGET] || setGlobal(TARGET, {});
	  } else {
	    target = (global_1[TARGET] || {}).prototype;
	  }
	  if (target) for (key in source) {
	    sourceProperty = source[key];
	    if (options.noTargetGet) {
	      descriptor = getOwnPropertyDescriptor$1(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else targetProperty = target[key];
	    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
	    // contained in target
	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty === typeof targetProperty) continue;
	      copyConstructorProperties(sourceProperty, targetProperty);
	    }
	    // add a flag to not completely full polyfills
	    if (options.sham || (targetProperty && targetProperty.sham)) {
	      hide(sourceProperty, 'sham', true);
	    }
	    // extend global
	    redefine(target, key, sourceProperty, options);
	  }
	};

	var aFunction$1 = function (it) {
	  if (typeof it != 'function') {
	    throw TypeError(String(it) + ' is not a function');
	  } return it;
	};

	var slice = [].slice;
	var factories = {};

	var construct = function (C, argsLength, args) {
	  if (!(argsLength in factories)) {
	    for (var list = [], i = 0; i < argsLength; i++) list[i] = 'a[' + i + ']';
	    // eslint-disable-next-line no-new-func
	    factories[argsLength] = Function('C,a', 'return new C(' + list.join(',') + ')');
	  } return factories[argsLength](C, args);
	};

	// `Function.prototype.bind` method implementation
	// https://tc39.github.io/ecma262/#sec-function.prototype.bind
	var functionBind = Function.bind || function bind(that /* , ...args */) {
	  var fn = aFunction$1(this);
	  var partArgs = slice.call(arguments, 1);
	  var boundFunction = function bound(/* args... */) {
	    var args = partArgs.concat(slice.call(arguments));
	    return this instanceof boundFunction ? construct(fn, args.length, args) : fn.apply(that, args);
	  };
	  if (isObject(fn.prototype)) boundFunction.prototype = fn.prototype;
	  return boundFunction;
	};

	// `Function.prototype.bind` method
	// https://tc39.github.io/ecma262/#sec-function.prototype.bind
	_export({ target: 'Function', proto: true }, {
	  bind: functionBind
	});

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

	//此例子演示的是引擎开发早期载入obj格式模式，并使用shader进行渲染。
	//此时尚没有材质系统，保留这个例子是为了更好的演示基础知识
	var vs_file = './shaders/basic_light.vs';
	var fs_file = './shaders/basic_light.fs';
	var obj_file = './models/dragon.obj';

	var AppObjLoader =
	/*#__PURE__*/
	function () {
	  function AppObjLoader() {
	    _classCallCheck(this, AppObjLoader);

	    this._inited = false;
	    this._mesh = null;
	    this._shader = null;
	    this._viewMatrix = new mini3d.Matrix4();
	    this._modelMatrix = new mini3d.Matrix4();
	    this._viewProjMatrix = new mini3d.Matrix4();
	    this._mvpMatrix = new mini3d.Matrix4();
	    this._normalMatrix = new mini3d.Matrix4();
	    this._rotationQuat = new mini3d.Quaternion();
	    this._matRot = new mini3d.Matrix4();
	    this._rotX = 0;
	    this._rotY = 0;
	  }

	  _createClass(AppObjLoader, [{
	    key: "onInit",
	    value: function onInit() {
	      var assetList = [[vs_file, mini3d.AssetType.Text], [fs_file, mini3d.AssetType.Text], [obj_file, mini3d.AssetType.Text]];
	      mini3d.assetManager.loadAssetList(assetList, function () {
	        this._inited = true;
	        this.start();
	      }.bind(this));

	      this._viewMatrix.setViewByLookAt(.0, .0, 8.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
	    }
	  }, {
	    key: "onResize",
	    value: function onResize(width, height) {
	      this._viewProjMatrix.setPerspective(60.0, width / height, 1.0, 100.0);

	      this._viewProjMatrix.multiply(this._viewMatrix);

	      if (this._inited) {
	        this.draw();
	      }
	    }
	  }, {
	    key: "onUpdate",
	    value: function onUpdate(dt) {}
	  }, {
	    key: "start",
	    value: function start() {
	      var gl = mini3d.gl;
	      var vs = mini3d.assetManager.getAsset(vs_file).data;
	      var fs = mini3d.assetManager.getAsset(fs_file).data;
	      var shader = new mini3d.Shader();

	      if (!shader.create(vs, fs)) {
	        console.log("Failed to initialize shaders");
	        return;
	      }

	      this._shader = shader;

	      this._shader.mapAttributeSemantic(mini3d.VertexSemantic.POSITION, 'a_Position');

	      this._shader.mapAttributeSemantic(mini3d.VertexSemantic.NORMAL, 'a_Normal');

	      this._shader.use();

	      var objFileString = mini3d.assetManager.getAsset(obj_file).data;
	      this._mesh = mini3d.objFileLoader.load(objFileString, 0.3);
	      var that = this;
	      mini3d.eventManager.addEventHandler(mini3d.SystemEvent.touchMove, function (event, data) {
	        var factor = 1;
	        var dx = data.dx * factor;
	        var dy = data.dy * factor;

	        var clampAngle = function clampAngle(angle, min, max) {
	          if (angle < -360) angle += 360;
	          if (angle > 360) angle -= 360;
	          return Math.max(Math.min(angle, max), min);
	        };

	        that._rotX = clampAngle(that._rotX + dy, -90.0, 90.0);
	        that._rotY += dx; //先旋转qy,再旋转qx

	        var qx = mini3d.Quaternion.axisAngle(mini3d.Vector3.Right, that._rotX);
	        var qy = mini3d.Quaternion.axisAngle(mini3d.Vector3.Up, that._rotY);
	        mini3d.Quaternion.multiply(qx, qy, that._rotationQuat); //欧拉角的约定是先x后y,不是这里要的
	        //that._rotationQuat.setFromEulerAngles(new mini3d.Vector3(that._rotX, that._rotY, 0));

	        mini3d.Quaternion.toMatrix4(that._rotationQuat, that._matRot);
	        that.draw();
	      });
	      gl.clearColor(0, 0, 0, 1);
	      gl.clearDepth(1.0);
	      gl.enable(gl.DEPTH_TEST);
	      this.draw();
	    }
	  }, {
	    key: "draw",
	    value: function draw() {
	      this._modelMatrix.setTranslate(0, -1.0, 0);

	      this._modelMatrix.multiply(this._matRot);

	      this._modelMatrix.scale(1.0, 1.0, 1.0);

	      this._normalMatrix.setInverseOf(this._modelMatrix);

	      this._normalMatrix.transpose();

	      this._mvpMatrix.set(this._viewProjMatrix);

	      this._mvpMatrix.multiply(this._modelMatrix);

	      this._shader.setUniform('u_mvpMatrix', this._mvpMatrix.elements);

	      this._shader.setUniform('u_NormalMatrix', this._normalMatrix.elements);

	      this._shader.setUniform('u_LightColor', [1.0, 1.0, 1.0]);

	      var lightDir = [0.5, 3.0, 4.0];

	      this._shader.setUniform('u_LightDir', lightDir);

	      var gl = mini3d.gl;
	      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	      this._mesh.render(this._shader);
	    }
	  }]);

	  return AppObjLoader;
	}();

	var obj_file_capsule = './models/capsule.obj';
	var obj_file_sphere = './models/sphere.obj';
	var obj_main_texture = './imgs/wall01_diffuse.jpg';
	var plane_main_texture = './imgs/wall02_diffuse.png';
	var proj_texture = './imgs/t1.png';

	var AppSimpleScene =
	/*#__PURE__*/
	function () {
	  function AppSimpleScene() {
	    _classCallCheck(this, AppSimpleScene);

	    this._time = 0;
	    this._rotDegree = 0;
	    this._tempQuat = new mini3d.Quaternion();
	    this._tempVec3 = new mini3d.Vector3();
	  }

	  _createClass(AppSimpleScene, [{
	    key: "onInit",
	    value: function onInit() {
	      var assetList = [[obj_file_capsule, mini3d.AssetType.Text], [obj_file_sphere, mini3d.AssetType.Text], [obj_main_texture, mini3d.AssetType.Image], [plane_main_texture, mini3d.AssetType.Image], [proj_texture, mini3d.AssetType.Image]];
	      mini3d.assetManager.loadAssetList(assetList, function () {
	        this.start();
	      }.bind(this));
	    }
	  }, {
	    key: "onResize",
	    value: function onResize(width, height) {
	      if (this._scene) {
	        this._scene.onScreenResize(width, height);
	      }
	    }
	  }, {
	    key: "start",
	    value: function start() {
	      this.createWorld();
	      mini3d.eventManager.addEventHandler(mini3d.SystemEvent.touchMove, function (event, data) {
	        var factor = 0.01;
	        var dx = data.dx;
	        var dy = data.dy;

	        this._tempVec3.copyFrom(this._mesh2.localPosition);

	        this._tempVec3.z += dy * factor;
	        this._tempVec3.x += dx * factor;
	        this._mesh2.localPosition = this._tempVec3;
	      }.bind(this));
	    }
	  }, {
	    key: "createWorld",
	    value: function createWorld() {
	      // Load meshes
	      var capusleData = mini3d.assetManager.getAsset(obj_file_capsule).data;
	      var capusleMesh = mini3d.objFileLoader.load(capusleData, 1.0, true);
	      var sphereData = mini3d.assetManager.getAsset(obj_file_sphere).data;
	      var sphereMesh = mini3d.objFileLoader.load(sphereData, 1.0); // Create scene

	      this._scene = new mini3d.Scene(); // Create a plane

	      var planeMesh = mini3d.Plane.createMesh(20, 20, 20, 20);
	      var matPlane = new mini3d.MatPixelLight();
	      matPlane.mainTexture = mini3d.textureManager.getTexture(plane_main_texture);
	      matPlane.mainTexture.setRepeat();
	      matPlane.mainTextureST = [2, 2, 0, 0];
	      matPlane.specular = [0.8, 0.8, 0.8];
	      this._planeNode = this._scene.root.addMeshNode(planeMesh, matPlane);

	      this._planeNode.localPosition.set(0, 0, 0);

	      var planeNode2 = this._scene.root.addMeshNode(planeMesh, matPlane);

	      planeNode2.localPosition.set(0, 0, -10);
	      planeNode2.localRotation.setFromEulerAngles(new mini3d.Vector3(90, 0, 0)); // Create an empty mesh root node

	      var meshRoot = this._scene.root.addEmptyNode(); //meshRoot.localPosition.set(-1, 1, 1);
	      //meshRoot.localScale.set(0.8, 1, 1);
	      //meshRoot.localRotation.setFromAxisAngle(new mini3d.Vector3(0, 1, 0), 45);
	      // Create mesh node 1


	      var material1 = new mini3d.MatPixelLight();
	      material1.mainTexture = mini3d.textureManager.getTexture(obj_main_texture);
	      material1.colorTint = [1.0, 1.0, 1.0];
	      material1.specular = [0.8, 0.8, 0.8];
	      this._mesh1 = meshRoot.addMeshNode(capusleMesh, material1);

	      this._mesh1.localPosition.set(1, 1, 0); // Create mesh node 2


	      var material2 = new mini3d.MatPixelLight();
	      material2.mainTexture = mini3d.textureManager.getTexture(obj_main_texture);
	      material2.colorTint = [1.0, 1.0, 1.0];
	      material2.specular = [0.8, 0.8, 0.8];
	      material2.gloss = 20;
	      this._mesh2 = meshRoot.addMeshNode(capusleMesh, material2);

	      this._mesh2.localPosition.set(-1, 1, 0);

	      this._mesh2.localScale.set(1, 1, 1); // Add a directional light node to scene


	      var mainLight = this._scene.root.addDirectionalLight([0.5, 0.5, 0.5]); //this._tempQuat.setFromEulerAngles(this._tempVec3.set(135,45,0));
	      //mainLight.localRotation = this._tempQuat;


	      mainLight.lookAt(this._tempVec3.set(-1, -1, -1)); // Add point light 1

	      var lightColor = [0, 0.1, 0];

	      var pointLight = this._scene.root.addPointLight(lightColor, 10);

	      pointLight.localPosition.set(-5, 6, 0);
	      var lightball = pointLight.addMeshNode(sphereMesh, new mini3d.MatSolidColor([0.3, 0.9, 0.3])); //点光源身上放一个小球以显示他的位置   

	      lightball.localScale.set(0.5, 0.5, 0.5);
	      this._pointLight1 = pointLight; // Add point light 2

	      lightColor = [0.1, 0, 0];
	      pointLight = this._scene.root.addPointLight(lightColor, 10);
	      pointLight.localPosition.set(5, 6, 0);
	      lightball = pointLight.addMeshNode(sphereMesh, new mini3d.MatSolidColor([0.9, 0.3, 0.3]));
	      lightball.localScale.set(0.5, 0.5, 0.5);
	      this._pointLight2 = pointLight; // Add a perspective camera

	      this._cameraNode = this._scene.root.addPerspectiveCamera(60, mini3d.canvas.width / mini3d.canvas.height, 1.0, 1000);

	      this._cameraNode.localPosition.set(0, 10, 10);

	      this._cameraNode.lookAt(new mini3d.Vector3(0, 0, 0));

	      this._cameraNode.camera.clearColor = [0.2, 0.5, 0.5]; // Add projector

	      this._projector = this._scene.root.addProjector(60, 1.0, 1.0, 1000.0);

	      this._projector.localPosition.set(0, 3, 0);

	      this._projector.lookAt(new mini3d.Vector3(0, 0, 0));

	      this._projector.projector.material.projTexture = mini3d.textureManager.getTexture(proj_texture);
	    }
	  }, {
	    key: "onUpdate",
	    value: function onUpdate(dt) {
	      if (this._scene) {
	        this._time += dt;

	        this._scene.update(); //mesh2自动旋转


	        {
	          this._mesh2.localRotation.setFromEulerAngles(new mini3d.Vector3(this._rotDegree, this._rotDegree, this._rotDegree));

	          this._mesh2.localPosition.y = (0.5 + 0.5 * Math.cos(mini3d.math.degToRad(this._rotDegree))) * 5;

	          this._mesh2.setTransformDirty();

	          this._rotDegree += dt * 100 / 1000;
	          this._rotDegree %= 360;
	        } //mesh1看向mesh2


	        this._mesh1.lookAt(this._mesh2.worldPosition, mini3d.Vector3.Up, 0.1); //灯光做圆周运动


	        var cosv = Math.cos(this._time / 1000);
	        var sinv = Math.sin(this._time / 1000);
	        var radius = 5;
	        this._pointLight1.localPosition.x = radius * cosv * cosv;
	        this._pointLight1.localPosition.z = radius * sinv * cosv;
	        this._pointLight1.localPosition.y = 1 + radius * (0.5 + 0.5 * sinv);

	        this._pointLight1.setTransformDirty();

	        this._pointLight2.localPosition.x = -radius * cosv * cosv;
	        this._pointLight2.localPosition.z = -radius * sinv * cosv;
	        this._pointLight2.localPosition.y = 1 + radius * (0.5 + 0.5 * sinv);

	        this._pointLight2.setTransformDirty(); //move projector


	        this._projector.localPosition.x = radius * cosv;
	        this._projector.localPosition.z = radius * sinv;

	        this._projector.localRotation.setFromEulerAngles(new mini3d.Vector3(60 * sinv, 0, 0));

	        this._projector.setTransformDirty();

	        this._scene.render();
	      }
	    }
	  }]);

	  return AppSimpleScene;
	}();

	var MathUtils =
	/*#__PURE__*/
	function () {
	  function MathUtils() {
	    _classCallCheck(this, MathUtils);

	    this.Pi = 3.141592654;
	    this.TwoPi = 6.283185307;
	    this.HalfPi = 1.570796327;
	    this.Epsilon = 0.000001;
	    this.ZeroEpsilon = 32.0 * 1.175494351e-38; // Very small epsilon for checking against 0.0f
	  }

	  _createClass(MathUtils, [{
	    key: "degToRad",
	    value: function degToRad(degree) {
	      return degree * 0.017453293;
	    }
	  }, {
	    key: "radToDeg",
	    value: function radToDeg(rad) {
	      return rad * 57.29577951;
	    }
	  }, {
	    key: "clamp",
	    value: function clamp(f, min, max) {
	      if (f < min) f = min;else if (f > max) f = max;
	      return f;
	    }
	  }]);

	  return MathUtils;
	}();

	var math = new MathUtils();

	var Vector3 =
	/*#__PURE__*/
	function () {
	  function Vector3() {
	    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	    var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

	    _classCallCheck(this, Vector3);

	    this.x = x;
	    this.y = y;
	    this.z = z;
	  }

	  _createClass(Vector3, [{
	    key: "clone",
	    value: function clone() {
	      return new Vector3(this.x, this.y, this.z);
	    }
	  }, {
	    key: "set",
	    value: function set(x, y, z) {
	      this.x = x;
	      this.y = y;
	      this.z = z;
	      return this;
	    }
	  }, {
	    key: "length",
	    value: function length() {
	      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	    }
	  }, {
	    key: "lengthSquare",
	    value: function lengthSquare() {
	      return this.x * this.x + this.y * this.y + this.z * this.z;
	    }
	  }, {
	    key: "equals",
	    value: function equals(rhs) {
	      var eps = math.Epsilon;
	      return this.x > rhs.x - eps && this.x < rhs.x + eps && this.y > rhs.y - eps && this.y < rhs.y + eps && this.z > rhs.z - eps && this.z < rhs.z + eps;
	    }
	  }, {
	    key: "copyFrom",
	    value: function copyFrom(rhs) {
	      this.x = rhs.x;
	      this.y = rhs.y;
	      this.z = rhs.z;
	      return this;
	    }
	  }, {
	    key: "negative",
	    value: function negative() {
	      this.x = -this.x;
	      this.y = -this.y;
	      this.z = -this.z;
	      return this;
	    }
	  }, {
	    key: "add",
	    value: function add(rhs) {
	      this.x += rhs.x;
	      this.y += rhs.y;
	      this.z += rhs.z;
	      return this;
	    }
	  }, {
	    key: "sub",
	    value: function sub(rhs) {
	      this.x -= rhs.x;
	      this.y -= rhs.y;
	      this.z -= rhs.z;
	      return this;
	    }
	  }, {
	    key: "multiply",
	    value: function multiply(rhs) {
	      this.x *= rhs.x;
	      this.y *= rhs.y;
	      this.z *= rhs.z;
	      return this;
	    }
	  }, {
	    key: "scale",
	    value: function scale(s) {
	      this.x *= s;
	      this.y *= s;
	      this.z *= s;
	      return this;
	    }
	  }, {
	    key: "normalize",
	    value: function normalize() {
	      var lensq = this.x * this.x + this.y * this.y + this.z * this.z;

	      if (lensq > 0) {
	        var g = 1 / Math.sqrt(lensq);
	        this.x *= g;
	        this.y *= g;
	        this.z *= g;
	      }

	      return this;
	    }
	  }], [{
	    key: "copyTo",
	    value: function copyTo(src, dst) {
	      dst.x = src.x;
	      dst.y = src.y;
	      dst.z = src.z;
	      return dst;
	    }
	  }, {
	    key: "negativeTo",
	    value: function negativeTo(src, dst) {
	      dst.x = -src.x;
	      dst.y = -src.y;
	      dst.z = -src.z;
	      return dst;
	    }
	  }, {
	    key: "add",
	    value: function add(a, b, dst) {
	      dst.x = a.x + b.x;
	      dst.y = a.y + b.y;
	      dst.z = a.z + b.z;
	      return dst;
	    }
	  }, {
	    key: "sub",
	    value: function sub(a, b, dst) {
	      dst.x = a.x - b.x;
	      dst.y = a.y - b.y;
	      dst.z = a.z - b.z;
	      return dst;
	    }
	  }, {
	    key: "multiply",
	    value: function multiply(a, b, dst) {
	      dst.x = a.x * b.x;
	      dst.y = a.y * b.y;
	      dst.z = a.z * b.z;
	      return dst;
	    }
	  }, {
	    key: "scaleTo",
	    value: function scaleTo(a, s, dst) {
	      dst.x = a.x * s;
	      dst.y = a.y * s;
	      dst.z = a.z * s;
	      return dst;
	    }
	  }, {
	    key: "dot",
	    value: function dot(a, b) {
	      return a.x * b.x + a.y * b.y + a.z * b.z;
	    }
	  }, {
	    key: "cross",
	    value: function cross(a, b, dst) {
	      dst.x = a.y * b.z - a.z * b.y;
	      dst.y = a.z * b.x - a.x * b.z;
	      dst.z = a.x * b.y - a.y * b.x;
	      return dst;
	    }
	  }, {
	    key: "lerp",
	    value: function lerp(a, b, f, dst) {
	      dst.x = a.x + (b.x - a.x) * f;
	      dst.y = a.y + (b.y - a.y) * f;
	      dst.z = a.z + (b.z - a.z) * f;
	      return dst;
	    }
	  }, {
	    key: "distance",
	    value: function distance(a, b) {
	      var dx = a.x - b.x;
	      var dy = a.y - b.y;
	      var dz = a.z - b.z;
	      return Math.sqrt(dx * dx + dy * dy + dz * dz);
	    }
	  }, {
	    key: "distanceSquare",
	    value: function distanceSquare(a, b) {
	      var dx = a.x - b.x;
	      var dy = a.y - b.y;
	      var dz = a.z - b.z;
	      return dx * dx + dy * dy + dz * dz;
	    }
	  }]);

	  return Vector3;
	}();

	Vector3.Right = new Vector3(1, 0, 0);
	Vector3.Up = new Vector3(0, 1, 0);

	var obj_file_capsule$1 = './models/capsule.obj';
	var obj_file_sphere$1 = './models/sphere.obj';
	var obj_main_texture$1 = './imgs/wall01_diffuse.jpg';
	var obj_normal_map = './imgs/wall01_normal.jpg';
	var box_main_texture = './imgs/box_diffuse.jpg';
	var box_normal_map = './imgs/box_normal.jpg';
	var plane_main_texture$1 = './imgs/wall02_diffuse.png';
	var plane_normal_map = './imgs/wall02_normal.png';
	var brick_main_texture = './imgs/brickwall_diffuse.jpg';
	var brick_normal_map = './imgs/brickwall_normal.jpg';
	var proj_texture$1 = './imgs/t1.png';

	var AppNormalMap =
	/*#__PURE__*/
	function () {
	  function AppNormalMap() {
	    _classCallCheck(this, AppNormalMap);

	    this._time = 0;
	    this._rotX = 0;
	    this._rotY = 0;
	    this._tempQuat = new mini3d.Quaternion();
	    this._tempVec3 = new mini3d.Vector3();
	  }

	  _createClass(AppNormalMap, [{
	    key: "onInit",
	    value: function onInit() {
	      var assetList = [[obj_file_capsule$1, mini3d.AssetType.Text], [obj_file_sphere$1, mini3d.AssetType.Text], [obj_main_texture$1, mini3d.AssetType.Image], [obj_normal_map, mini3d.AssetType.Image], [box_main_texture, mini3d.AssetType.Image], [box_normal_map, mini3d.AssetType.Image], [plane_main_texture$1, mini3d.AssetType.Image], [plane_normal_map, mini3d.AssetType.Image], [brick_main_texture, mini3d.AssetType.Image], [brick_normal_map, mini3d.AssetType.Image], [proj_texture$1, mini3d.AssetType.Image]];
	      mini3d.assetManager.loadAssetList(assetList, function () {
	        this.start();
	      }.bind(this));
	    }
	  }, {
	    key: "onResize",
	    value: function onResize(width, height) {
	      if (this._scene) {
	        this._scene.onScreenResize(width, height);
	      }
	    }
	  }, {
	    key: "start",
	    value: function start() {
	      this.createWorld();
	      mini3d.eventManager.addEventHandler(mini3d.SystemEvent.touchMove, function (event, data) {
	        var dx = data.dx;
	        var dy = data.dy;

	        var clampAngle = function clampAngle(angle, min, max) {
	          if (angle < -360) angle += 360;
	          if (angle > 360) angle -= 360;
	          return Math.max(Math.min(angle, max), min);
	        };

	        this._rotX = clampAngle(this._rotX + dy, -90.0, 90.0);
	        this._rotY += dx; //先旋转qy,再旋转qx

	        var qx = mini3d.Quaternion.axisAngle(mini3d.Vector3.Right, this._rotX);
	        var qy = mini3d.Quaternion.axisAngle(mini3d.Vector3.Up, this._rotY);
	        mini3d.Quaternion.multiply(qx, qy, this._tempQuat);
	        this._mesh1.localRotation = this._tempQuat;
	        this._mesh2.localRotation = this._tempQuat;
	      }.bind(this));
	    }
	  }, {
	    key: "createGround",
	    value: function createGround() {
	      var groundMesh = mini3d.Plane.createMesh(20, 10, 20, 10);
	      var matGround = new mini3d.MatNormalMap();
	      matGround.mainTexture = mini3d.textureManager.getTexture(plane_main_texture$1);
	      matGround.mainTexture.setRepeat();
	      matGround.mainTextureST = [3, 3, 0, 0];
	      matGround.normalMap = mini3d.textureManager.getTexture(plane_normal_map);
	      matGround.normalMap.setRepeat();
	      matGround.normalMapST = [3, 3, 0, 0];
	      matGround.specular = [0.8, 0.8, 0.8];

	      var groundNode = this._scene.root.addMeshNode(groundMesh, matGround);

	      groundNode.localPosition.set(0, 0, 0);
	    }
	  }, {
	    key: "createWall",
	    value: function createWall() {
	      var wallMesh = mini3d.Plane.createMesh(20, 10, 20, 10);
	      var matWall = new mini3d.MatNormalMap();
	      matWall.mainTexture = mini3d.textureManager.getTexture(brick_main_texture);
	      matWall.mainTexture.setRepeat();
	      matWall.mainTextureST = [3, 3, 0, 0];
	      matWall.normalMap = mini3d.textureManager.getTexture(brick_normal_map);
	      matWall.normalMap.setRepeat();
	      matWall.normalMapST = [3, 3, 0, 0];
	      matWall.specular = [0.8, 0.8, 0.8];
	      return this._scene.root.addMeshNode(wallMesh, matWall);
	    }
	  }, {
	    key: "createWorld",
	    value: function createWorld() {
	      // Load meshes
	      var capusleData = mini3d.assetManager.getAsset(obj_file_capsule$1).data;
	      var capusleMesh = mini3d.objFileLoader.load(capusleData, 1.0, true);
	      var sphereData = mini3d.assetManager.getAsset(obj_file_sphere$1).data;
	      var sphereMesh = mini3d.objFileLoader.load(sphereData, 1.0, true); // Create scene

	      this._scene = new mini3d.Scene(); // Create the ground

	      this.createGround(); // Create walls

	      var wall1 = this.createWall();
	      wall1.localPosition.set(0, 5, -5);
	      wall1.localRotation.setFromEulerAngles(new Vector3(90, 0, 0)); // Create an empty mesh root node

	      var meshRoot = this._scene.root.addEmptyNode(); //meshRoot.localPosition.set(-1, 1, 1);
	      //meshRoot.localScale.set(0.8, 1, 1);
	      //meshRoot.localRotation.setFromAxisAngle(new mini3d.Vector3(0, 1, 0), 45);
	      // Create mesh node 1


	      var material1 = new mini3d.MatNormalMap();
	      material1.mainTexture = mini3d.textureManager.getTexture(obj_main_texture$1);
	      material1.normalMap = mini3d.textureManager.getTexture(obj_normal_map);
	      material1.colorTint = [1.0, 1.0, 1.0];
	      material1.specular = [0.8, 0.8, 0.8];
	      this._mesh1 = meshRoot.addMeshNode(capusleMesh, material1);

	      this._mesh1.localPosition.set(1, 1, 0); // Create mesh node 2


	      var material2 = new mini3d.MatNormalMapW();
	      material2.mainTexture = mini3d.textureManager.getTexture(box_main_texture);
	      material2.normalMap = mini3d.textureManager.getTexture(box_normal_map);
	      material2.colorTint = [1.0, 1.0, 1.0];
	      material2.specular = [0.8, 0.8, 0.8];
	      material2.gloss = 10;
	      this._mesh2 = meshRoot.addMeshNode(mini3d.Cube.createMesh(), material2);

	      this._mesh2.localPosition.set(-1, 1, 0);

	      this._mesh2.localScale.set(0.8, 0.8, 0.8); // Add a directional light node to scene        


	      var mainLight = this._scene.root.addDirectionalLight([0.8, 0.8, 0.8]); //this._tempQuat.setFromEulerAngles(this._tempVec3.set(135,-45,0));
	      //mainLight.localRotation = this._tempQuat;


	      mainLight.lookAt(this._tempVec3.set(-1, -1, -1)); // Add point light 1

	      var lightColor = [0.05, 0.05, 0.05];

	      var pointLight = this._scene.root.addPointLight(lightColor, 10);

	      pointLight.localPosition.set(-5, 6, 0);
	      var lightball = pointLight.addMeshNode(sphereMesh, new mini3d.MatSolidColor([0.9, 0.9, 0.9])); //点光源身上放一个小球以显示他的位置   

	      lightball.localScale.set(0.2, 0.2, 0.2);
	      this._pointLight1 = pointLight; // Add point light 2

	      lightColor = [0.05, 0.05, 0.05];
	      pointLight = this._scene.root.addPointLight(lightColor, 10);
	      pointLight.localPosition.set(5, 6, 0);
	      lightball = pointLight.addMeshNode(sphereMesh, new mini3d.MatSolidColor([0.9, 0.9, 0.9]));
	      lightball.localScale.set(0.2, 0.2, 0.2);
	      this._pointLight2 = pointLight; // Add a perspective camera

	      this._cameraNode = this._scene.root.addPerspectiveCamera(60, mini3d.canvas.width / mini3d.canvas.height, 1.0, 1000);

	      this._cameraNode.localPosition.set(0, 2, 6);

	      this._cameraNode.lookAt(new mini3d.Vector3(0, 1, 0));

	      this._cameraNode.camera.clearColor = [0.34, 0.98, 1]; // Add projector
	      //this._projector = this._scene.root.addProjector(60, 1.0, 1.0, 1000.0);
	      //this._projector.localPosition.set(0, 3, 0);
	      //this._projector.lookAt(new mini3d.Vector3(0, 0, 0));
	      //this._projector.projector.material.projTexture = mini3d.textureManager.getTexture(proj_texture);
	    }
	  }, {
	    key: "onUpdate",
	    value: function onUpdate(dt) {
	      if (this._scene) {
	        this._time += dt;

	        this._scene.update(); //灯光做圆周运动


	        var cosv = Math.cos(this._time / 1500);
	        var sinv = Math.sin(this._time / 1500);
	        var radius = 5;
	        this._pointLight1.localPosition.x = radius * cosv * cosv;
	        this._pointLight1.localPosition.z = radius * sinv * cosv;
	        this._pointLight1.localPosition.y = 0.5 + radius * (0.5 + 0.5 * sinv) * 0.5;

	        this._pointLight1.setTransformDirty();

	        this._pointLight2.localPosition.x = -radius * cosv * cosv;
	        this._pointLight2.localPosition.z = -radius * sinv * cosv;
	        this._pointLight2.localPosition.y = 0.5 + radius * (0.5 + 0.5 * sinv) * 0.5;

	        this._pointLight2.setTransformDirty(); //move projector
	        //this._projector.localPosition.x = radius*cosv;
	        ////this._projector.localPosition.z = radius*sinv;
	        ////this._projector.localRotation.setFromEulerAngles(new mini3d.Vector3(60*sinv,0,0));
	        //this._projector.setTransformDirty();


	        this._scene.render();
	      }
	    }
	  }]);

	  return AppNormalMap;
	}();

	var obj_file_sphere$2 = './models/sphere.obj';
	var box_main_texture$1 = './imgs/box_diffuse.jpg';
	var box_normal_map$1 = './imgs/box_normal.jpg';
	var plane_main_texture$2 = './imgs/wall02_diffuse.png';
	var plane_normal_map$1 = './imgs/wall02_normal.png';
	var brick_main_texture$1 = './imgs/brickwall_diffuse.jpg';
	var brick_normal_map$1 = './imgs/brickwall_normal.jpg';

	var AppMirror =
	/*#__PURE__*/
	function () {
	  function AppMirror() {
	    _classCallCheck(this, AppMirror);

	    this._time = 0;
	    this._rotX = 0;
	    this._rotY = 0;
	    this._tempQuat = new mini3d.Quaternion();
	    this._tempVec3 = new mini3d.Vector3();
	  }

	  _createClass(AppMirror, [{
	    key: "onInit",
	    value: function onInit() {
	      var assetList = [[obj_file_sphere$2, mini3d.AssetType.Text], [box_main_texture$1, mini3d.AssetType.Image], [box_normal_map$1, mini3d.AssetType.Image], [plane_main_texture$2, mini3d.AssetType.Image], [plane_normal_map$1, mini3d.AssetType.Image], [brick_main_texture$1, mini3d.AssetType.Image], [brick_normal_map$1, mini3d.AssetType.Image]];
	      mini3d.assetManager.loadAssetList(assetList, function () {
	        this.start();
	      }.bind(this));
	    }
	  }, {
	    key: "onResize",
	    value: function onResize(width, height) {
	      if (this._scene) {
	        this._scene.onScreenResize(width, height);
	      }
	    }
	  }, {
	    key: "start",
	    value: function start() {
	      this.createWorld();
	      mini3d.eventManager.addEventHandler(mini3d.SystemEvent.touchMove, function (event, data) {
	        var dx = data.dx;
	        var dy = data.dy;

	        var clampAngle = function clampAngle(angle, min, max) {
	          if (angle < -360) angle += 360;
	          if (angle > 360) angle -= 360;
	          return Math.max(Math.min(angle, max), min);
	        };

	        this._rotX = clampAngle(this._rotX + dy, -90.0, 90.0);
	        this._rotY += dx;
	        var qx = mini3d.Quaternion.axisAngle(mini3d.Vector3.Right, this._rotX);
	        var qy = mini3d.Quaternion.axisAngle(mini3d.Vector3.Up, this._rotY);
	        mini3d.Quaternion.multiply(qx, qy, this._tempQuat);
	        this._mirror.localRotation = this._tempQuat;
	      }.bind(this));
	    }
	  }, {
	    key: "createGround",
	    value: function createGround() {
	      var groundMesh = mini3d.Plane.createMesh(20, 10, 20, 10);
	      var matGround = new mini3d.MatNormalMap();
	      matGround.mainTexture = mini3d.textureManager.getTexture(plane_main_texture$2);
	      matGround.mainTexture.setRepeat();
	      matGround.mainTextureST = [3, 3, 0, 0];
	      matGround.normalMap = mini3d.textureManager.getTexture(plane_normal_map$1);
	      matGround.normalMap.setRepeat();
	      matGround.normalMapST = [3, 3, 0, 0];
	      matGround.specular = [0.8, 0.8, 0.8];

	      var groundNode = this._scene.root.addMeshNode(groundMesh, matGround);

	      groundNode.localPosition.set(0, 0, 0);
	    }
	  }, {
	    key: "createWall",
	    value: function createWall() {
	      var wallMesh = mini3d.Plane.createMesh(10, 10, 10, 10);
	      var matWall = new mini3d.MatNormalMap();
	      matWall.mainTexture = mini3d.textureManager.getTexture(brick_main_texture$1);
	      matWall.mainTexture.setRepeat();
	      matWall.mainTextureST = [3, 3, 0, 0];
	      matWall.normalMap = mini3d.textureManager.getTexture(brick_normal_map$1);
	      matWall.normalMap.setRepeat();
	      matWall.normalMapST = [3, 3, 0, 0];
	      matWall.specular = [0.8, 0.8, 0.8];
	      return this._scene.root.addMeshNode(wallMesh, matWall);
	    }
	  }, {
	    key: "createMirror",
	    value: function createMirror(texture) {
	      var mirrorRoot = this._scene.root.addEmptyNode();

	      var mirrorMesh = mini3d.Plane.createMesh(6, 3, 6, 3);
	      var matMirror = new mini3d.MatMirror();
	      matMirror.mainTexture = texture;
	      var node = mirrorRoot.addMeshNode(mirrorMesh, matMirror);
	      node.localRotation.setFromEulerAngles(this._tempVec3.set(90, 0, 0));
	      mirrorRoot.localPosition.set(0, 2, -4);
	      return mirrorRoot;
	    }
	  }, {
	    key: "createWorld",
	    value: function createWorld() {
	      // Load meshes
	      var sphereData = mini3d.assetManager.getAsset(obj_file_sphere$2).data;
	      var sphereMesh = mini3d.objFileLoader.load(sphereData, 1.0, true); // Create scene

	      this._scene = new mini3d.Scene(); // Create the ground

	      this.createGround(); // Create walls

	      var wall1 = this.createWall();
	      wall1.localPosition.set(0, 5, -5);
	      wall1.localRotation.setFromEulerAngles(new Vector3(90, 0, 0));
	      var wall2 = this.createWall();
	      wall2.localPosition.set(-5, 5, 0);
	      wall2.localRotation.setFromEulerAngles(new Vector3(90, 90, 0));
	      var wall3 = this.createWall();
	      wall3.localPosition.set(5, 5, 0);
	      wall3.localRotation.setFromEulerAngles(new Vector3(90, -90, 0));
	      var wall4 = this.createWall();
	      wall4.localPosition.set(0, 5, 5);
	      wall4.localRotation.setFromEulerAngles(new Vector3(90, 180, 0)); // Create an empty mesh root node

	      var meshRoot = this._scene.root.addEmptyNode(); //meshRoot.localPosition.set(-1, 1, 1);
	      //meshRoot.localScale.set(0.8, 1, 1);
	      //meshRoot.localRotation.setFromAxisAngle(new mini3d.Vector3(0, 1, 0), 45);    
	      // Create box


	      var matBox = new mini3d.MatNormalMapW();
	      matBox.mainTexture = mini3d.textureManager.getTexture(box_main_texture$1);
	      matBox.normalMap = mini3d.textureManager.getTexture(box_normal_map$1);
	      matBox.colorTint = [1.0, 1.0, 1.0];
	      matBox.specular = [0.8, 0.8, 0.8];
	      matBox.gloss = 10;
	      var box = meshRoot.addMeshNode(mini3d.Cube.createMesh(), matBox);
	      box.localPosition.set(-1, 1, 0);
	      box.localScale.set(0.8, 0.8, 0.8);
	      this._box = box; // Create ball

	      var matBall = new mini3d.MatNormalMap();
	      matBall.mainTexture = mini3d.textureManager.getTexture(plane_main_texture$2);
	      matBall.normalMap = mini3d.textureManager.getTexture(plane_normal_map$1);
	      matBall.colorTint = [1.0, 1.0, 1.0];
	      matBall.specular = [0.8, 0.8, 0.8];
	      var ball = box.addMeshNode(sphereMesh, matBall);
	      ball.localPosition.set(0, 1.5, 0); // ball2

	      var matBall2 = new mini3d.MatPixelLight();
	      matBall2.mainTexture = mini3d.textureManager.getTexture(box_main_texture$1);
	      matBall2.colorTint = [1.0, 1.0, 1.0];
	      matBall2.specular = [0.8, 0.8, 0.8];
	      var ball2 = meshRoot.addMeshNode(sphereMesh, matBall2);
	      ball2.localPosition.set(1, 2, -1);
	      this._ball2 = ball2; // Add a directional light node to scene        

	      var mainLight = this._scene.root.addDirectionalLight([0.8, 0.8, 0.8]); //this._tempQuat.setFromEulerAngles(this._tempVec3.set(135,-45,0));
	      //mainLight.localRotation = this._tempQuat;


	      mainLight.lookAt(this._tempVec3.set(-1, -1, -1)); // Add point light 1

	      var lightColor = [0.0, 0.05, 0.0];

	      var pointLight = this._scene.root.addPointLight(lightColor, 10);

	      pointLight.localPosition.set(-5, 6, 0);
	      var lightball = pointLight.addMeshNode(sphereMesh, new mini3d.MatSolidColor([0.5, 0.9, 0.5])); //点光源身上放一个小球以显示他的位置   

	      lightball.localScale.set(0.2, 0.2, 0.2);
	      this._pointLight1 = pointLight; // Add point light 2

	      lightColor = [0.05, 0.0, 0.0];
	      pointLight = this._scene.root.addPointLight(lightColor, 10);
	      pointLight.localPosition.set(5, 6, 0);
	      lightball = pointLight.addMeshNode(sphereMesh, new mini3d.MatSolidColor([0.9, 0.5, 0.5]));
	      lightball.localScale.set(0.2, 0.2, 0.2);
	      this._pointLight2 = pointLight; // Add a perspective camera

	      this._cameraNode = this._scene.root.addPerspectiveCamera(60, mini3d.canvas.width / mini3d.canvas.height, 1.0, 1000);

	      this._cameraNode.localPosition.set(-1, 4, 5);

	      this._cameraNode.lookAt(new mini3d.Vector3(0, 1, 0));

	      this._cameraNode.camera.clearColor = [0.34, 0.98, 1]; // Add a render texture and mirror node

	      var mirrorWidth = 2048;
	      var mirrorHeight = 1024;
	      this._renderTexture = new mini3d.RenderTexture(mirrorWidth, mirrorHeight);
	      var mirror = this.createMirror(this._renderTexture.texture2D);
	      this._mirror = mirror; // Add a camera to the mirror

	      this._renderCamera = mirror.addPerspectiveCamera(60, mirrorWidth / mirrorHeight, 0.2, 100); // //说明：因为Plane创建是顶点分布在本地坐标系的xz平面上的,因此镜子默认是面朝本地+y的，为了将镜子立起来绕x轴旋转了90度
	      // //这样camera挂到镜子结点上，如果不做任何旋转，其本地z轴是冲着世界-y轴的，且由于camera是看向本地-z的
	      // //所以直接挂上camera是看着天的（世界+y)。因此此处让camera绕的本地x轴旋转90度，这样它照着世界+z，和镜子看上去的面向一致。
	      // //但仅仅这样还不行，因为这样camera的up方向是指向世界-y,照到的世界是倒着的。因此要先让camera绕本地z轴旋转180度。
	      // //注：引擎中欧拉角转四元数是按ZXY顺序
	      // //（ps:未来可能应该把引擎生成的平面的朝向改成+z)
	      // this._renderCamera.localRotation.setFromEulerAngles(this._tempVec3.set(90,0,180));
	      // //上面使用欧拉角太麻烦，因为没有编辑器可以边转边看，由于此次我们知道镜子相机朝向的世界位置是+z，因此可以直接使用lookAt
	      // //但这个方法不适用于制作预制件，或者不知道将要把镜子朝哪儿放的情况
	      //this._renderCamera.lookAt(new mini3d.Vector3(0, 0, 1));
	      //更新：我给镜子加了一个空的父节点，然后把camera挂到这个父节点上，这样只要把camera的z轴调转就行了。。
	      //保留上面的注释吧，使用欧拉角确实麻烦，还是应该让所有模型的朝向一致

	      this._renderCamera.localRotation.setFromEulerAngles(this._tempVec3.set(0, 180, 0));

	      this._renderCamera.camera.clearColor = [0.34, 0.98, 1];
	      this._renderCamera.camera.target = this._renderTexture;
	    }
	  }, {
	    key: "onUpdate",
	    value: function onUpdate(dt) {
	      if (this._scene) {
	        this._time += dt;

	        this._scene.update(); //灯光做圆周运动


	        var cosv = Math.cos(this._time / 1500);
	        var sinv = Math.sin(this._time / 1500);
	        var radius = 5;
	        this._pointLight1.localPosition.x = radius * cosv * cosv;
	        this._pointLight1.localPosition.z = radius * sinv * cosv;
	        this._pointLight1.localPosition.y = 0.5 + radius * (0.5 + 0.5 * sinv) * 0.5;

	        this._pointLight1.setTransformDirty();

	        this._pointLight2.localPosition.x = -radius * cosv * cosv;
	        this._pointLight2.localPosition.z = -radius * sinv * cosv;
	        this._pointLight2.localPosition.y = 0.5 + radius * (0.5 + 0.5 * sinv) * 0.5;

	        this._pointLight2.setTransformDirty();

	        this._box.localRotation = this._tempQuat.setFromEulerAngles(this._tempVec3.set(10 * cosv, 10 * sinv, 0));
	        this._ball2.localPosition.y = 0.5 + radius * (0.5 + 0.5 * sinv) * 0.5;

	        this._ball2.setTransformDirty();

	        this._scene.render();
	      }
	    }
	  }]);

	  return AppMirror;
	}();

	var obj_file_capsule$2 = './models/capsule.obj';
	var obj_file_sphere$3 = './models/sphere.obj';
	var obj_main_texture$2 = './imgs/wall01_diffuse.jpg';
	var obj_normal_map$1 = './imgs/wall01_normal.jpg';
	var box_main_texture$2 = './imgs/box_diffuse.jpg';
	var box_normal_map$2 = './imgs/box_normal.jpg';
	var plane_main_texture$3 = './imgs/wall02_diffuse.png';
	var plane_normal_map$2 = './imgs/wall02_normal.png';
	var brick_main_texture$2 = './imgs/brickwall_diffuse.jpg';
	var brick_normal_map$2 = './imgs/brickwall_normal.jpg';

	var AppPostProcessing =
	/*#__PURE__*/
	function () {
	  function AppPostProcessing() {
	    _classCallCheck(this, AppPostProcessing);

	    this._time = 0;
	    this._rotX = 0;
	    this._rotY = 0;
	    this._tempQuat = new mini3d.Quaternion();
	    this._tempVec3 = new mini3d.Vector3();
	  }

	  _createClass(AppPostProcessing, [{
	    key: "onInit",
	    value: function onInit() {
	      var assetList = [[obj_file_capsule$2, mini3d.AssetType.Text], [obj_file_sphere$3, mini3d.AssetType.Text], [obj_main_texture$2, mini3d.AssetType.Image], [obj_normal_map$1, mini3d.AssetType.Image], [box_main_texture$2, mini3d.AssetType.Image], [box_normal_map$2, mini3d.AssetType.Image], [plane_main_texture$3, mini3d.AssetType.Image], [plane_normal_map$2, mini3d.AssetType.Image], [brick_main_texture$2, mini3d.AssetType.Image], [brick_normal_map$2, mini3d.AssetType.Image]];
	      mini3d.assetManager.loadAssetList(assetList, function () {
	        this.start();
	      }.bind(this));
	    }
	  }, {
	    key: "onResize",
	    value: function onResize(width, height) {
	      if (this._scene) {
	        this._scene.onScreenResize(width, height);
	      }
	    }
	  }, {
	    key: "start",
	    value: function start() {
	      this.createWorld();
	      mini3d.eventManager.addEventHandler(mini3d.SystemEvent.touchMove, function (event, data) {
	        var dx = data.dx;
	        var dy = data.dy;

	        var clampAngle = function clampAngle(angle, min, max) {
	          if (angle < -360) angle += 360;
	          if (angle > 360) angle -= 360;
	          return Math.max(Math.min(angle, max), min);
	        };

	        this._rotX = clampAngle(this._rotX + dy, -90.0, 90.0);
	        this._rotY += dx; //先旋转qy,再旋转qx

	        var qx = mini3d.Quaternion.axisAngle(mini3d.Vector3.Right, this._rotX);
	        var qy = mini3d.Quaternion.axisAngle(mini3d.Vector3.Up, this._rotY);
	        mini3d.Quaternion.multiply(qx, qy, this._tempQuat);
	        this._mesh1.localRotation = this._tempQuat;
	        this._mesh2.localRotation = this._tempQuat;
	      }.bind(this));
	    }
	  }, {
	    key: "createGround",
	    value: function createGround() {
	      var groundMesh = mini3d.Plane.createMesh(20, 10, 20, 10);
	      var matGround = new mini3d.MatNormalMap();
	      matGround.mainTexture = mini3d.textureManager.getTexture(plane_main_texture$3);
	      matGround.mainTexture.setRepeat();
	      matGround.mainTextureST = [3, 3, 0, 0];
	      matGround.normalMap = mini3d.textureManager.getTexture(plane_normal_map$2);
	      matGround.normalMap.setRepeat();
	      matGround.normalMapST = [3, 3, 0, 0];
	      matGround.specular = [0.5, 0.5, 0.5];

	      var groundNode = this._scene.root.addMeshNode(groundMesh, matGround);

	      groundNode.localPosition.set(0, 0, 0);
	    }
	  }, {
	    key: "createWall",
	    value: function createWall() {
	      var wallMesh = mini3d.Plane.createMesh(20, 10, 20, 10);
	      var matWall = new mini3d.MatNormalMap();
	      matWall.mainTexture = mini3d.textureManager.getTexture(brick_main_texture$2);
	      matWall.mainTexture.setRepeat();
	      matWall.mainTextureST = [3, 3, 0, 0];
	      matWall.normalMap = mini3d.textureManager.getTexture(brick_normal_map$2);
	      matWall.normalMap.setRepeat();
	      matWall.normalMapST = [3, 3, 0, 0];
	      matWall.specular = [0.8, 0.8, 0.8];
	      return this._scene.root.addMeshNode(wallMesh, matWall);
	    }
	  }, {
	    key: "createWorld",
	    value: function createWorld() {
	      // Load meshes
	      var capusleData = mini3d.assetManager.getAsset(obj_file_capsule$2).data;
	      var capusleMesh = mini3d.objFileLoader.load(capusleData, 1.0, true);
	      var sphereData = mini3d.assetManager.getAsset(obj_file_sphere$3).data;
	      var sphereMesh = mini3d.objFileLoader.load(sphereData, 1.0, true); // Create scene

	      this._scene = new mini3d.Scene(); // Create the ground

	      this.createGround(); // Create walls

	      var wall1 = this.createWall();
	      wall1.localPosition.set(0, 5, -5);
	      wall1.localRotation.setFromEulerAngles(new Vector3(90, 0, 0)); // Create an empty mesh root node

	      var meshRoot = this._scene.root.addEmptyNode(); //meshRoot.localPosition.set(-1, 1, 1);
	      //meshRoot.localScale.set(0.8, 1, 1);
	      //meshRoot.localRotation.setFromAxisAngle(new mini3d.Vector3(0, 1, 0), 45);
	      // Create mesh node 1


	      var material1 = new mini3d.MatNormalMap();
	      material1.mainTexture = mini3d.textureManager.getTexture(obj_main_texture$2);
	      material1.normalMap = mini3d.textureManager.getTexture(obj_normal_map$1);
	      material1.colorTint = [1.0, 1.0, 1.0];
	      material1.specular = [0.8, 0.8, 0.8];
	      this._mesh1 = meshRoot.addMeshNode(capusleMesh, material1);

	      this._mesh1.localPosition.set(1.5, 1, 0); // Create mesh node 2


	      var material2 = new mini3d.MatNormalMapW();
	      material2.mainTexture = mini3d.textureManager.getTexture(box_main_texture$2);
	      material2.normalMap = mini3d.textureManager.getTexture(box_normal_map$2);
	      material2.colorTint = [1.0, 1.0, 1.0];
	      material2.specular = [0.8, 0.8, 0.8];
	      material2.gloss = 10;
	      this._mesh2 = meshRoot.addMeshNode(mini3d.Cube.createMesh(), material2);

	      this._mesh2.localPosition.set(-1.5, 1, 0);

	      this._mesh2.localScale.set(0.8, 0.8, 0.8); // Add a directional light node to scene        


	      var mainLight = this._scene.root.addDirectionalLight([0.8, 0.8, 0.8]); //this._tempQuat.setFromEulerAngles(this._tempVec3.set(135,-45,0));
	      //mainLight.localRotation = this._tempQuat;


	      mainLight.lookAt(this._tempVec3.set(-1, -1, -1)); // Add point light 1

	      var lightColor = [0.05, 0.05, 0.05];

	      var pointLight = this._scene.root.addPointLight(lightColor, 10);

	      pointLight.localPosition.set(-5, 6, 0);
	      var lightball = pointLight.addMeshNode(sphereMesh, new mini3d.MatSolidColor([0.9, 0.9, 0.9])); //点光源身上放一个小球以显示他的位置   

	      lightball.localScale.set(0.2, 0.2, 0.2);
	      this._pointLight1 = pointLight; // Add point light 2

	      lightColor = [0.05, 0.05, 0.05];
	      pointLight = this._scene.root.addPointLight(lightColor, 10);
	      pointLight.localPosition.set(5, 6, 0);
	      lightball = pointLight.addMeshNode(sphereMesh, new mini3d.MatSolidColor([0.9, 0.9, 0.9]));
	      lightball.localScale.set(0.2, 0.2, 0.2);
	      this._pointLight2 = pointLight; // Add a perspective camera

	      this._cameraNode = this._scene.root.addPerspectiveCamera(60, mini3d.canvas.width / mini3d.canvas.height, 1.0, 1000);

	      this._cameraNode.localPosition.set(0, 2, 6);

	      this._cameraNode.lookAt(new mini3d.Vector3(0, 1, 0));

	      this._cameraNode.camera.clearColor = [0.34, 0.98, 1];
	      this._matPPWave = new mini3d.MatPP_Wave();

	      this._cameraNode.camera.addPostProcessing(new mini3d.PostEffectLayerOnePass(this._matPPWave));

	      var matPP; // matPP = new mini3d.MatPP_ColorBSC();
	      // matPP.brightness = 0.95;
	      // matPP.saturation = 1.2;
	      // matPP.contrast = 1.0;
	      // this._cameraNode.camera.addPostProcessing(new mini3d.PostEffectLayerOnePass(matPP));

	      matPP = new mini3d.MatPP_Bloom();
	      var bloomEffect = new mini3d.PostEffectBloom(matPP);
	      bloomEffect.brightThreshold = 0.35;
	      bloomEffect.blurSpread = 2.0;
	      bloomEffect.downSample = 8;

	      this._cameraNode.camera.addPostProcessing(bloomEffect); //matPP = new mini3d.MatPP_EdgeDetection();
	      //matPP.edgeOnly = 1.0;
	      //matPP.colorEdge = [0, 0, 0];
	      //matPP.colorBg = [1, 1, 1];
	      //this._cameraNode.camera.addPostProcessing(new mini3d.PostEffectLayerOnePass(matPP));
	      //this._matPPEdge = matPP;
	      //matPP = new mini3d.MatPP_Blur();
	      //this._postEffectBlur = new mini3d.PostEffectBlur(matPP);
	      //this._cameraNode.camera.addPostProcessing(this._postEffectBlur);
	      // matPP = new mini3d.MatPP_Vignette();
	      // matPP.color = [0.1,0.1,0.9];
	      // matPP.intensity = 3.0;
	      // this._cameraNode.camera.addPostProcessing(new mini3d.PostEffectLayerOnePass(matPP));

	    }
	  }, {
	    key: "onUpdate",
	    value: function onUpdate(dt) {
	      if (this._scene) {
	        this._time += dt;

	        this._scene.update();

	        this._matPPWave.time = this._time * 0.8 / 1000; //let factor = (1 + Math.sin(this._time/2000))*0.5;
	        //this._matPPEdge.edgeOnly = factor;
	        //this._postEffectBlur.blurSpread = factor<0.2? 0: factor*0.6;
	        //灯光做圆周运动

	        var cosv = Math.cos(this._time / 1500);
	        var sinv = Math.sin(this._time / 1500);
	        var radius = 5;
	        this._pointLight1.localPosition.x = radius * cosv * cosv;
	        this._pointLight1.localPosition.z = radius * sinv * cosv;
	        this._pointLight1.localPosition.y = 0.5 + radius * (0.5 + 0.5 * sinv) * 0.5;

	        this._pointLight1.setTransformDirty();

	        this._pointLight2.localPosition.x = -radius * cosv * cosv;
	        this._pointLight2.localPosition.z = -radius * sinv * cosv;
	        this._pointLight2.localPosition.y = 0.5 + radius * (0.5 + 0.5 * sinv) * 0.5;

	        this._pointLight2.setTransformDirty();

	        this._scene.render();
	      }
	    }
	  }]);

	  return AppPostProcessing;
	}();

	function exampleObjLoader() {
	  var app = new AppObjLoader();
	  mini3d.init('webgl', app);
	}

	function exampleSimpleScene() {
	  var app = new AppSimpleScene();
	  mini3d.init('webgl', app);
	}

	function exampleNormalMap() {
	  var app = new AppNormalMap();
	  mini3d.init('webgl', app);
	}

	function exampleMirror() {
	  var app = new AppMirror();
	  mini3d.init('webgl', app);
	}

	function examplePostProcessing() {
	  var app = new AppPostProcessing();
	  mini3d.init('webgl', app);
	}

	var examples = [{
	  name: 'Load .Obj Mesh',
	  img: 'load_obj.jpg',
	  entry: exampleObjLoader
	}, {
	  name: 'Simple Scene & Projector',
	  img: 'simple_scene.jpg',
	  entry: exampleSimpleScene
	}, {
	  name: 'Normal Map',
	  img: 'normalmap.jpg',
	  entry: exampleNormalMap
	}, {
	  name: 'Mirror',
	  img: 'mirror.jpg',
	  entry: exampleMirror
	}, {
	  name: 'PostProcessing',
	  img: 'pp1.jpg',
	  entry: examplePostProcessing
	}];
	function main() {
	  return examples;
	}

	return main;

}());
//# sourceMappingURL=bundle.js.map
