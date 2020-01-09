var main = (function () {
   'use strict';

   var vs_file = './shaders/basic_color.vs';
   var fs_file = './shaders/basic_color.fs';

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
   var rotZ = 0;

   function example() {
     var gl = mini3d.gl;
     var vs = mini3d.assetManager.getAsset(vs_file).data;
     var fs = mini3d.assetManager.getAsset(fs_file).data;
     var shader = new mini3d.Shader();

     if (!shader.create(vs, fs)) {
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
     setupInput(function (dx, dy, rotateZ) {
       if (rotateZ) {
         rotZ += dx;
       } else {
         rotX = Math.max(Math.min(rotX + dy, 90.0), -90.0); //rotX += dy;

         rotY += dx;
       }

       draw(mesh, shader);
     });
     gl.clearColor(0, 0, 0, 1);
     gl.clearDepth(1.0);
     gl.enable(gl.DEPTH_TEST);
     draw(mesh, shader);
   }

   function draw(mesh, shader) {
     //rotate order: x-y-z
     modelMatrix.setRotate(rotZ, 0, 0, 1); //rot around z-axis

     modelMatrix.rotate(rotY, 0.0, 1.0, 0.0); //rot around y-axis

     modelMatrix.rotate(rotX, 1.0, 0.0, 0.0); //rot around x-axis

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
     var rotateZ = false;

     mini3d.canvas.onmousedown = function (event) {
       var x = event.clientX;
       var y = event.clientY;
       var rect = event.target.getBoundingClientRect();

       if (x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom) {
         lastX = x;
         lastY = y;
         dragging = true;
         rotateZ = event.ctrlKey;
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
           onDrag(dx, dy, rotateZ);
         }
       }

       lastX = x;
       lastY = y;
     };
   }

   function main() {
     var assetList = [[vs_file, mini3d.AssetType.Text], [fs_file, mini3d.AssetType.Text]];
     mini3d.assetManager.loadAssetList(assetList, function () {
       example();
     });
   }

   return main;

}());
//# sourceMappingURL=bundle.js.map
