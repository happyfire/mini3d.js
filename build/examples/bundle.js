var main = (function () {
    'use strict';

    var VSHADER_SOURCE = "\n    attribute vec4 a_Position;\n    attribute vec4 a_Color;\n    attribute float a_Custom;\n    uniform mat4 u_ViewMatrix;\n    varying vec4 v_Color;\n    varying float v_Custom;\n    void main(){\n        gl_Position = u_ViewMatrix * a_Position;\n        v_Color = a_Color;\n        v_Custom = a_Custom;\n    }\n";
    var FSHADER_SOURCE = "\n    #ifdef GL_ES\n    precision mediump float;\n    #endif\n    varying vec4 v_Color;\n    varying float v_Custom;\n    void main(){\n        gl_FragColor = v_Color * v_Custom;\n    }\n";
    var Semantic_Custom = 'custom';

    function createMesh() {
      var format = new mini3d.VertexFormat();
      format.addAttrib(mini3d.VertexSemantic.POSITION, 3);
      format.addAttrib(mini3d.VertexSemantic.COLOR, 3);
      format.addAttrib(Semantic_Custom, 1);
      var mesh = new mini3d.Mesh(format);
      var position_data = [0.0, 0.5, -0.4, -0.5, -0.5, -0.4, 0.5, -0.5, -0.4, 0.5, 0.4, -0.2, -0.5, 0.4, -0.2, 0.0, -0.6, -0.2, 0.0, 0.5, 0.0, -0.5, -0.5, 0.0, 0.5, -0.5, 0.0];
      var color_data = [0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 1.0, 0.4, 0.4];
      var custom_data = [0.5, 0.5, 0.5, 1, 1, 1, 2, 2, 2];
      mesh.setVertexData(mini3d.VertexSemantic.POSITION, position_data);
      mesh.setVertexData(mini3d.VertexSemantic.COLOR, color_data);
      mesh.setVertexData(Semantic_Custom, custom_data);
      mesh.upload();
      return mesh;
    }

    function example(gl) {
      var shader = new mini3d.Shader();

      if (!shader.create(VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Failed to initialize shaders");
        return;
      }

      shader.mapAttributeSemantic(mini3d.VertexSemantic.POSITION, 'a_Position');
      shader.mapAttributeSemantic(mini3d.VertexSemantic.COLOR, 'a_Color');
      shader.mapAttributeSemantic(Semantic_Custom, 'a_Custom');
      shader.use();
      var viewMatrix = new mini3d.Matrix4();
      viewMatrix.setLookAtGL(0.2, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
      shader.setUniform('u_ViewMatrix', viewMatrix.elements);
      var mesh = createMesh();
      gl.clearColor(0, 0, 0, 1); //gl.enable(gl.DEPTH_TEST);
      // draw

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
