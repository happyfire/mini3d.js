import { Mesh } from "../../src/mini3d";


var VSHADER_SOURCE=`
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform mat4 u_ViewMatrix;
    varying vec4 v_Color;
    void main(){
        gl_Position = u_ViewMatrix * a_Position;
        v_Color = a_Color;
    }
`;

var FSHADER_SOURCE=`
    #ifdef GL_ES
    precision mediump float;
    #endif
    varying vec4 v_Color;
    void main(){
        gl_FragColor = v_Color;
    }
`;

function createMesh(gl){

    let mesh = new mini3d.Mesh();    
    mesh.setPositions([
        0.0, 0.5, -0.4,
        -0.5, -0.5, -0.4,
        0.5, -0.5, -0.4,
        0.5, 0.4, -0.2,
        -0.5, 0.4, -0.2,
        0.0, -0.6, -0.2,
        0.0, 0.5, 0.0,
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0
    ], 3);
    
    mesh.setColors([
        0.4, 1.0, 0.4,
        0.4, 1.0, 0.4,
        1.0, 0.4, 0.4,
        1.0, 0.4, 0.4,
        1.0, 1.0, 0.4,
        1.0, 1.0, 0.4,
        0.4, 0.4, 1.0,
        0.4, 0.4, 1.0,
        1.0, 0.4, 0.4
    ], 3);

    mesh.apply();

    return mesh;   
}

function example(gl){
    let shader = new mini3d.Shader();
    if(!shader.create(VSHADER_SOURCE, FSHADER_SOURCE)){
        console.log("Failed to initialize shaders");
        return;
    }

    shader.use();

    // Get the storage location of attribute variable
    var a_Position = gl.getAttribLocation(shader.program, 'a_Position');
    if(a_Position < 0){
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    var a_Color = gl.getAttribLocation(shader.program, 'a_Color');
    if(a_Color < 0){
        console.log('Failed to get the storage location of a_Color');
        return;
    }

    // Get the storage location of uniform
    var u_ViewMatrix = gl.getUniformLocation(shader.program, 'u_ViewMatrix');
    if(!u_ViewMatrix){
        console.log('Failed to get the storage locations of u_ViewMatrix');
        return;
    }

    var viewMatrix = new mini3d.Matrix4();
    viewMatrix.setLookAtGL(0.2, 0.25, 0.25,  0, 0, 0,  0, 1, 0);    
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

    var mesh = createMesh(gl);
    var n = mesh._vcount;
    var vbo = mesh._vbo;
    var FSIZE = mesh._FSIZE;

    gl.clearColor(0, 0, 0, 1);
    //gl.enable(gl.DEPTH_TEST);
    // draw
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE*6, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE*6, FSIZE*3);
    gl.enableVertexAttribArray(a_Color);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.drawArrays(gl.TRIANGLES, 0, n);

}

export default function main(){
    console.log('main');
    example(mini3d.gl);
}
