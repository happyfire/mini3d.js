var main = (function () {
    'use strict';

    var VSHADER_SOURCE = "\n    attribute vec4 a_Position;\n    attribute vec4 a_Color;\n    attribute float a_Custom;    \n    uniform mat4 u_mvpMatrix;\n    varying vec4 v_Color;\n    void main(){\n        gl_Position = u_mvpMatrix * a_Position;\n        v_Color = a_Color;\n    }\n";
    var FSHADER_SOURCE = "\n    #ifdef GL_ES\n    precision mediump float;\n    #endif\n    varying vec4 v_Color;\n    void main(){\n        gl_FragColor = v_Color;\n    }\n";

    function createMesh() {
      var format = new mini3d.VertexFormat();
      format.addAttrib(mini3d.VertexSemantic.POSITION, 3);
      format.addAttrib(mini3d.VertexSemantic.COLOR, 3); // cube
      //    v6----- v5
      //   /|      /|
      //  v1------v0|
      //  | |     | |
      //  | |v7---|-|v4
      //  |/      |/
      //  v2------v3

      var mesh = new mini3d.Mesh(format);
      var position_data = [1.0, 1.0, 1.0, //v0
      -1.0, 1.0, 1.0, //v1 
      -1.0, -1.0, 1.0, //v2
      1.0, -1.0, 1.0, //v3
      1.0, -1.0, -1.0, //v4
      1.0, 1.0, -1.0, //v5
      -1.0, 1.0, -1.0, //v6
      -1.0, -1.0, -1.0 //v7
      ];
      var color_data = [1.0, 1.0, 1.0, //v0 white
      1.0, 0.0, 1.0, //v1 magenta
      1.0, 0.0, 0.0, //v2 red
      1.0, 1.0, 0.0, //v3 yellow
      0.0, 1.0, 0.0, //v4 green
      0.0, 1.0, 1.0, //v5 cyan
      0.0, 0.0, 1.0, //v6 blue
      0.0, 0.0, 0.0 //v7 black
      ];
      var triangels = [0, 1, 2, 0, 2, 3, //front
      0, 3, 4, 0, 4, 5, //right
      0, 5, 6, 0, 6, 1, //top
      1, 6, 7, 1, 7, 2, //left
      7, 4, 3, 7, 3, 2, //bottom
      4, 7, 6, 4, 6, 5 //back
      ];
      mesh.setVertexData(mini3d.VertexSemantic.POSITION, position_data);
      mesh.setVertexData(mini3d.VertexSemantic.COLOR, color_data);
      mesh.setTriangles(triangels);
      mesh.upload();
      return mesh;
    }

    var g_eyeX, g_eyeY, g_eyeZ;

    function example(gl) {
      var shader = new mini3d.Shader();

      if (!shader.create(VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Failed to initialize shaders");
        return;
      }

      shader.mapAttributeSemantic(mini3d.VertexSemantic.POSITION, 'a_Position');
      shader.mapAttributeSemantic(mini3d.VertexSemantic.COLOR, 'a_Color');
      shader.use();
      var viewMatrix = new mini3d.Matrix4();
      g_eyeX = 3;
      g_eyeY = 3;
      g_eyeZ = 7;
      var mesh = createMesh();

      document.onkeydown = function (ev) {
        keydown(ev, mesh, shader, viewMatrix);
      }; //let modelMatrix = new mini3d.Matrix4();
      //modelMatrix.setRotate(-10, 0, 0, 1); //Rotate around z-axis
      //let modelViewMatrix = viewMatrix.multiply(modelMatrix);


      gl.clearColor(0, 0, 0, 1);
      gl.clearDepth(1.0);
      gl.enable(gl.DEPTH_TEST);
      draw(mesh, shader, viewMatrix);
    }

    function keydown(ev, mesh, shader, viewMatrix) {
      if (ev.keyCode == 39) {
        //right arrow
        g_eyeX += 0.1;
      } else if (ev.keyCode == 37) {
        //left arrow
        g_eyeX -= 0.1;
      } else {
        return;
      }

      draw(mesh, shader, viewMatrix);
    }

    function draw(mesh, shader, viewMatrix) {
      viewMatrix.setLookAtGL(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0);
      var projMatrix = new mini3d.Matrix4();
      projMatrix.setPerspective(30, mini3d.canvas.width / mini3d.canvas.height, 1, 100);
      var mvpMatrix = projMatrix.multiply(viewMatrix);
      shader.setUniform('u_mvpMatrix', mvpMatrix.elements);
      var gl = mini3d.gl;
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      mesh.render(shader);
    }

    function main() {
      console.log('main');
      example(mini3d.gl);
    }

    return main;

}());
//# sourceMappingURL=bundle.js.map
