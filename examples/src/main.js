var VSHADER_SOURCE=`
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    attribute float a_Custom;
    uniform mat4 u_ViewMatrix;
    varying vec4 v_Color;
    varying float v_Custom;
    void main(){
        gl_Position = u_ViewMatrix * a_Position;
        v_Color = a_Color;
        v_Custom = a_Custom;
    }
`;

var FSHADER_SOURCE=`
    #ifdef GL_ES
    precision mediump float;
    #endif
    varying vec4 v_Color;
    varying float v_Custom;
    void main(){
        gl_FragColor = v_Color * v_Custom;
    }
`;

const Semantic_Custom = 'custom';

function createMesh(){

    let format = new mini3d.VertexFormat();
    format.addAttrib(mini3d.VertexSemantic.POSITION, 3);
    format.addAttrib(mini3d.VertexSemantic.COLOR, 3);
    format.addAttrib(Semantic_Custom, 1);

    let mesh = new mini3d.Mesh(format);    
    let position_data = [
        0.0, 0.5, -0.4,
        -0.5, -0.5, -0.4,
        0.5, -0.5, -0.4,
        0.5, 0.4, -0.2,
        -0.5, 0.4, -0.2,
        0.0, -0.6, -0.2,
        0.0, 0.5, 0.0,
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0
    ];
    let color_data = [
        0.4, 1.0, 0.4,
        0.4, 1.0, 0.4,
        1.0, 0.4, 0.4,
        1.0, 0.4, 0.4,
        1.0, 1.0, 0.4,
        1.0, 1.0, 0.4,
        0.4, 0.4, 1.0,
        0.4, 0.4, 1.0,
        1.0, 0.4, 0.4
    ];
    let custom_data = [
        0.5,
        0.5,
        0.5,
        1,
        1,
        1,
        2,
        2,
        2
    ];

    mesh.setVertexData(mini3d.VertexSemantic.POSITION, position_data);    
    mesh.setVertexData(mini3d.VertexSemantic.COLOR, color_data);
    mesh.setVertexData(Semantic_Custom, custom_data);
    mesh.upload();            

    return mesh;   
}

function example(gl){
    let shader = new mini3d.Shader();
    if(!shader.create(VSHADER_SOURCE, FSHADER_SOURCE)){
        console.log("Failed to initialize shaders");
        return;
    }

    shader.mapAttributeSemantic(mini3d.VertexSemantic.POSITION, 'a_Position');
    shader.mapAttributeSemantic(mini3d.VertexSemantic.COLOR, 'a_Color');
    shader.mapAttributeSemantic(Semantic_Custom, 'a_Custom');

    shader.use();    
    
    var viewMatrix = new mini3d.Matrix4();
    viewMatrix.setLookAtGL(0.2, 0.25, 0.25,  0, 0, 0,  0, 1, 0);    
    shader.setUniform('u_ViewMatrix', viewMatrix.elements);   

    var mesh = createMesh();    

    gl.clearColor(0, 0, 0, 1);
    //gl.enable(gl.DEPTH_TEST);
    // draw
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    mesh.render(shader);

}

export default function main(){
    console.log('main');
    example(mini3d.gl);
}
