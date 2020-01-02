var main = (function () {
    'use strict';

    var VSHADER_SOURCE = "\n    attribute vec4 a_Position;\n    attribute vec4 a_Color;\n    attribute float a_Custom;    \n    uniform mat4 u_mvpMatrix;\n    varying vec4 v_Color;\n    void main(){\n        gl_Position = u_mvpMatrix * a_Position;\n        v_Color = a_Color;\n    }\n";
    var FSHADER_SOURCE = "\n    #ifdef GL_ES\n    precision mediump float;\n    #endif\n    varying vec4 v_Color;\n    void main(){\n        gl_FragColor = v_Color;\n    }\n";

    function createMesh() {
      var format = new mini3d.VertexFormat();
      format.addAttrib(mini3d.VertexSemantic.POSITION, 3);
      format.addAttrib(mini3d.VertexSemantic.COLOR, 3); // cube
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
      var triangels = [0, 1, 2, 0, 2, 3, //front
      4, 5, 6, 4, 6, 7, //right
      8, 9, 10, 8, 10, 11, //top
      12, 13, 14, 12, 14, 15, //left
      16, 17, 18, 16, 18, 19, //bottom
      20, 21, 22, 20, 22, 23 //back
      ];
      mesh.setVertexData(mini3d.VertexSemantic.POSITION, position_data);
      mesh.setVertexData(mini3d.VertexSemantic.COLOR, color_data);
      mesh.setTriangles(triangels);
      mesh.upload();
      return mesh;
    }

    var modelMatrix = new mini3d.Matrix4();
    var viewProjMatrix = new mini3d.Matrix4();
    var mvpMatrix = new mini3d.Matrix4();
    var rotX = 0;
    var rotY = 0;

    function example() {
      var gl = mini3d.gl;
      var shader = new mini3d.Shader();

      if (!shader.create(VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Failed to initialize shaders");
        return;
      }

      shader.mapAttributeSemantic(mini3d.VertexSemantic.POSITION, 'a_Position');
      shader.mapAttributeSemantic(mini3d.VertexSemantic.COLOR, 'a_Color');
      shader.use();
      var mesh = createMesh();
      var viewMatrix = new mini3d.Matrix4();
      viewMatrix.setLookAt(.0, .0, 8.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
      viewProjMatrix.setPerspective(30.0, mini3d.canvas.width / mini3d.canvas.height, 1.0, 100.0);
      viewProjMatrix.multiply(viewMatrix);
      setupInput(function (dx, dy) {
        rotX = Math.max(Math.min(rotX + dy, 90.0), -90.0); //rotX += dy;

        rotY += dx;
        draw(mesh, shader);
      });
      gl.clearColor(0, 0, 0, 1);
      gl.clearDepth(1.0);
      gl.enable(gl.DEPTH_TEST);
      draw(mesh, shader);
    }

    function draw(mesh, shader) {
      modelMatrix.setRotate(rotX, 1, 0, 0); //rot around x-axis

      modelMatrix.rotate(rotY, 0.0, 1.0, 0.0); //rot around y-axis

      mvpMatrix.set(viewProjMatrix);
      mvpMatrix.multiply(modelMatrix);
      shader.setUniform('u_mvpMatrix', mvpMatrix.elements);
      var gl = mini3d.gl;
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      mesh.render(shader);
    }

    function setupInput(onDrag) {
      var dragging = false;
      var lastX = -1,
          lastY = -1;

      mini3d.canvas.onmousedown = function (event) {
        var x = event.clientX;
        var y = event.clientY;
        var rect = event.target.getBoundingClientRect();

        if (x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom) {
          lastX = x;
          lastY = y;
          dragging = true;
        }
      };

      mini3d.canvas.onmouseup = function (event) {
        dragging = false;
      };

      mini3d.canvas.onmousemove = function (event) {
        var x = event.clientX;
        var y = event.clientY;

        if (dragging) {
          var factor = 300 / mini3d.canvas.height;
          var dx = factor * (x - lastX);
          var dy = factor * (y - lastY);

          if (onDrag) {
            onDrag(dx, dy);
          }
        }

        lastX = x;
        lastY = y;
      };
    }

    function main() {
      example();
    }

    return main;

}());
//# sourceMappingURL=bundle.js.map
