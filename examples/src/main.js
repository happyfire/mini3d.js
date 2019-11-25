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
    
    var viewMatrix = new mini3d.Matrix4();
    viewMatrix.setLookAtGL(0.2, 0.25, 0.25,  0, 0, 0,  0, 1, 0);    
    shader.setUniform('u_ViewMatrix', viewMatrix.elements);   

    var mesh = createMesh(gl);    

    gl.clearColor(0, 0, 0, 1);
    //gl.enable(gl.DEPTH_TEST);
    // draw
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    mesh.draw(shader);

}

export default function main(){
    console.log('main');
    example(mini3d.gl);
}
