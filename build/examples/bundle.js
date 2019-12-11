var main = (function () {
    'use strict';

    var VSHADER_SOURCE = "\n    attribute vec4 a_Position;\n    attribute vec4 a_Color;\n    uniform mat4 u_ViewMatrix;\n    varying vec4 v_Color;\n    void main(){\n        gl_Position = u_ViewMatrix * a_Position;\n        v_Color = a_Color;\n    }\n";
    var FSHADER_SOURCE = "\n    #ifdef GL_ES\n    precision mediump float;\n    #endif\n    varying vec4 v_Color;\n    void main(){\n        gl_FragColor = v_Color;\n    }\n";

    function createMesh(gl) {
      var mesh = new mini3d.Mesh();
      var position_data = [0.0, 0.5, -0.4, -0.5, -0.5, -0.4, 0.5, -0.5, -0.4, 0.5, 0.4, -0.2, -0.5, 0.4, -0.2, 0.0, -0.6, -0.2, 0.0, 0.5, 0.0, -0.5, -0.5, 0.0, 0.5, -0.5, 0.0];
      var color_data = [0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 1.0, 0.4, 0.4];
      mesh.setPositions(position_data, 3);
      mesh.setColors(color_data, 3);
      mesh.apply();
      var format = new mini3d.VertexFormat();
      format.addAttrib(mini3d.VertexAttribSemantic.POSITION, 3);
      format.addAttrib(mini3d.VertexAttribSemantic.COLOR, 3);
      var buffer = new mini3d.VertexBuffer(format);
      buffer.setData(mini3d.VertexAttribSemantic.POSITION, position_data);
      buffer.setData(mini3d.VertexAttribSemantic.COLOR, color_data);
      buffer.uploadData();
      return mesh;
    }

    function example(gl) {
      var shader = new mini3d.Shader();

      if (!shader.create(VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Failed to initialize shaders");
        return;
      }

      shader.use();
      var viewMatrix = new mini3d.Matrix4();
      viewMatrix.setLookAtGL(0.2, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
      shader.setUniform('u_ViewMatrix', viewMatrix.elements);
      var mesh = createMesh();
      gl.clearColor(0, 0, 0, 1); //gl.enable(gl.DEPTH_TEST);
      // draw

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      mesh.draw(shader);
    }

    function main() {
      console.log('main');
      example(mini3d.gl);
    }

    return main;

}());
//# sourceMappingURL=bundle.js.map
