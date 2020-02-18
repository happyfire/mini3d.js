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

	var vs_file = './shaders/tex_color.vs';
	var fs_file = './shaders/tex_color.fs';
	var tex_file = './imgs/box_diffuse.jpg';

	function createMesh() {
	  var format = new mini3d.VertexFormat();
	  format.addAttrib(mini3d.VertexSemantic.POSITION, 3);
	  format.addAttrib(mini3d.VertexSemantic.COLOR, 3);
	  format.addAttrib(mini3d.VertexSemantic.UV0, 2); // cube
	  //       ^ Y
	  //       | 
	  //       |
	  //       / -------> X 
	  //      /
	  //     v
	  //    Z
	  //
	  //    v6----- v5
	  //   /|      /|
	  //  v1------v0|
	  //  | |     | |
	  //  | |v7---|-|v4
	  //  |/      |/
	  //  v2------v3

	  var mesh = new mini3d.Mesh(format); //6个面（12个三角形），24个顶点  

	  var position_data = [//v0-v1-v2-v3 front (0,1,2,3)
	  1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, //v0-v3-v4-v5 right (4,5,6,7)
	  1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, //v0-v5-v6-v1 top (8,9,10,11)
	  1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, //v1-v6-v7-v2 left (12,13,14,15)
	  -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, //v7-v4-v3-v2 bottom (16,17,18,19)
	  -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, //v4-v7-v6-v5 back (20,21,22,23)
	  1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0];
	  var color_data = [//v0-v1-v2-v3 front (blue)
	  0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, //v0-v3-v4-v5 right (green)
	  0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, //v0-v5-v6-v1 top (red)
	  1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //v1-v6-v7-v2 left (yellow)
	  1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, //v7-v4-v3-v2 bottom (white)
	  1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, //v4-v7-v6-v5 back
	  0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0];
	  var uv_data = [//v0-v1-v2-v3 front
	  1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, //v0-v3-v4-v5 right
	  0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, //v0-v5-v6-v1 top
	  1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, //v1-v6-v7-v2 left
	  1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, //v7-v4-v3-v2 bottom
	  0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, //v4-v7-v6-v5 back
	  0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];
	  var triangels = [0, 1, 2, 0, 2, 3, //front
	  4, 5, 6, 4, 6, 7, //right
	  8, 9, 10, 8, 10, 11, //top
	  12, 13, 14, 12, 14, 15, //left
	  16, 17, 18, 16, 18, 19, //bottom
	  20, 21, 22, 20, 22, 23 //back
	  ];
	  mesh.setVertexData(mini3d.VertexSemantic.POSITION, position_data);
	  mesh.setVertexData(mini3d.VertexSemantic.COLOR, color_data);
	  mesh.setVertexData(mini3d.VertexSemantic.UV0, uv_data);
	  mesh.setTriangles(triangels);
	  mesh.upload();
	  return mesh;
	}

	var AppTexturedCube =
	/*#__PURE__*/
	function () {
	  function AppTexturedCube() {
	    _classCallCheck(this, AppTexturedCube);

	    this._inited = false;
	    this._mesh = null;
	    this._shader = null;
	    this._texture = null;
	    this._viewMatrix = new mini3d.Matrix4();
	    this._modelMatrix = new mini3d.Matrix4();
	    this._viewProjMatrix = new mini3d.Matrix4();
	    this._mvpMatrix = new mini3d.Matrix4();
	    this._rotX = 30;
	    this._rotY = 30;
	    this._rotZ = 0;
	  }

	  _createClass(AppTexturedCube, [{
	    key: "onInit",
	    value: function onInit() {
	      var assetList = [[vs_file, mini3d.AssetType.Text], [fs_file, mini3d.AssetType.Text], [tex_file, mini3d.AssetType.Image]];
	      mini3d.assetManager.loadAssetList(assetList, function () {
	        this._inited = true;
	        this.start();
	      }.bind(this));

	      this._viewMatrix.setLookAt(.0, .0, 8.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
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

	      this._shader.mapAttributeSemantic(mini3d.VertexSemantic.COLOR, 'a_Color');

	      this._shader.mapAttributeSemantic(mini3d.VertexSemantic.UV0, 'a_TexCoord');

	      this._shader.use();

	      this._texture = mini3d.textureManager.getTexture(tex_file);
	      this._mesh = createMesh();
	      var that = this;
	      mini3d.eventManager.addEventHandler(mini3d.SystemEvent.touchMove, function (event, data) {
	        var factor = 300 / mini3d.canvas.width;
	        var dx = data.dx * factor;
	        var dy = data.dy * factor;

	        var clampAngle = function clampAngle(angle, min, max) {
	          if (angle < -360) angle += 360;
	          if (angle > 360) angle -= 360;
	          return Math.max(Math.min(angle, max), min);
	        };

	        that._rotX = clampAngle(that._rotX + dy, -90.0, 90.0);
	        that._rotY += dx;
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
	      //rotate order: y-x-z
	      this._modelMatrix.setRotate(this._rotZ, 0, 0, 1); //rot around z-axis


	      this._modelMatrix.rotate(this._rotX, 1.0, 0.0, 0.0); //rot around x-axis


	      this._modelMatrix.rotate(this._rotY, 0.0, 1.0, 0.0); //rot around y-axis


	      this._mvpMatrix.set(this._viewProjMatrix);

	      this._mvpMatrix.multiply(this._modelMatrix);

	      this._shader.setUniform('u_mvpMatrix', this._mvpMatrix.elements);

	      this._texture.bind();

	      this._shader.setUniform('u_sampler', 0);

	      var gl = mini3d.gl;
	      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	      this._mesh.render(this._shader);

	      this._texture.unbind();
	    }
	  }]);

	  return AppTexturedCube;
	}();

	var vs_file$1 = './shaders/basic_light.vs';
	var fs_file$1 = './shaders/basic_light.fs';
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
	      var assetList = [[vs_file$1, mini3d.AssetType.Text], [fs_file$1, mini3d.AssetType.Text], [obj_file, mini3d.AssetType.Text]];
	      mini3d.assetManager.loadAssetList(assetList, function () {
	        this._inited = true;
	        this.start();
	      }.bind(this));

	      this._viewMatrix.setLookAt(.0, .0, 8.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
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
	      var vs = mini3d.assetManager.getAsset(vs_file$1).data;
	      var fs = mini3d.assetManager.getAsset(fs_file$1).data;
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
	        var factor = 300 / mini3d.canvas.width;
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

	function exampleTexturedCube() {
	  var app = new AppTexturedCube();
	  mini3d.init('webgl', app);
	}

	function exampleObjLoader() {
	  var app = new AppObjLoader();
	  mini3d.init('webgl', app);
	}

	var examples = [{
	  name: 'Textured Cube',
	  entry: exampleTexturedCube
	}, {
	  name: 'Load .Obj Mesh',
	  entry: exampleObjLoader
	}];
	function main() {
	  return examples;
	}

	return main;

}());
//# sourceMappingURL=bundle.js.map
