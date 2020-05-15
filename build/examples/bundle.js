var main = (function () {
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

  var vs_file = './shaders/tex_color.vs';
  var fs_file = './shaders/tex_color.fs';
  var tex_file = './imgs/box_diffuse.jpg';

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
      this._normalMatrix = new mini3d.Matrix4();
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

        this._shader.mapAttributeSemantic(mini3d.VertexSemantic.UV0, 'a_TexCoord');

        this._shader.use();

        this._texture = mini3d.textureManager.getTexture(tex_file);
        this._mesh = mini3d.Cube.createMesh();
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


        this._normalMatrix.setInverseOf(this._modelMatrix);

        this._normalMatrix.transpose();

        this._mvpMatrix.set(this._viewProjMatrix);

        this._mvpMatrix.multiply(this._modelMatrix);

        this._shader.setUniform('u_mvpMatrix', this._mvpMatrix.elements);

        this._shader.setUniform('u_NormalMatrix', this._normalMatrix.elements);

        this._shader.setUniform('u_LightColor', [1.0, 1.0, 1.0]);

        var lightDir = [0.5, 3.0, 4.0];

        this._shader.setUniform('u_LightDir', lightDir);

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

  var obj_file_capsule = './models/capsule.obj';
  var obj_file_sphere = './models/sphere.obj';
  var obj_main_texture = './imgs/wall01_diffuse.jpg';
  var plane_main_texture = './imgs/wall02_diffuse.png';

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
        var assetList = [[obj_file_capsule, mini3d.AssetType.Text], [obj_file_sphere, mini3d.AssetType.Text], [obj_main_texture, mini3d.AssetType.Image], [plane_main_texture, mini3d.AssetType.Image]];
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

        this._planeNode.localPosition.set(0, 0, 0); // Create an empty mesh root node


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

        this._cameraNode.camera.clearColor = [0.2, 0.5, 0.5];
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

          this._pointLight2.setTransformDirty();

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
        var assetList = [[obj_file_capsule$1, mini3d.AssetType.Text], [obj_file_sphere$1, mini3d.AssetType.Text], [obj_main_texture$1, mini3d.AssetType.Image], [obj_normal_map, mini3d.AssetType.Image], [box_main_texture, mini3d.AssetType.Image], [box_normal_map, mini3d.AssetType.Image], [plane_main_texture$1, mini3d.AssetType.Image], [plane_normal_map, mini3d.AssetType.Image], [brick_main_texture, mini3d.AssetType.Image], [brick_normal_map, mini3d.AssetType.Image]];
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
      key: "createMirror",
      value: function createMirror(texture) {
        var mirrorMesh = mini3d.Plane.createMesh(6, 6, 2, 2);
        var matMirror = new mini3d.MatMirror();
        matMirror.mainTexture = texture;

        var node = this._scene.root.addMeshNode(mirrorMesh, matMirror);

        node.localPosition.set(0, 2, -4);
        node.localRotation.setFromEulerAngles(this._tempVec3.set(90, 0, 0));
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

        this._cameraNode.camera.clearColor = [0.34, 0.98, 1]; // Add a render texture

        this._renderTexture = new mini3d.RenderTexture(512, 512);
        this._renderCamera = this._scene.root.addPerspectiveCamera(60, 1.0, 1.0, 1000);

        this._renderCamera.localPosition.set(0, 2, -6);

        this._renderCamera.lookAt(new mini3d.Vector3(0, 1, 0));

        this._renderCamera.camera.clearColor = [0.34, 0.98, 1];
        this._renderCamera.camera.target = this._renderTexture;
        this.createMirror(this._renderTexture.texture2D);
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

          this._scene.render();
        }
      }
    }]);

    return AppNormalMap;
  }();

  function exampleTexturedCube() {
    var app = new AppTexturedCube();
    mini3d.init('webgl', app);
  }

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

  var examples = [{
    name: 'Textured Cube',
    entry: exampleTexturedCube
  }, {
    name: 'Load .Obj Mesh',
    entry: exampleObjLoader
  }, {
    name: 'Simple Scene',
    entry: exampleSimpleScene
  }, {
    name: 'Normal Map',
    entry: exampleNormalMap
  }];
  function main() {
    return examples;
  }

  return main;

}());
//# sourceMappingURL=bundle.js.map
