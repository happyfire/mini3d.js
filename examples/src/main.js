var VSHADER_SOURCE=`
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    attribute float a_Custom;    
    uniform mat4 u_mvpMatrix;
    varying vec4 v_Color;
    void main(){
        gl_Position = u_mvpMatrix * a_Position;
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

function createMesh(){

    let format = new mini3d.VertexFormat();
    format.addAttrib(mini3d.VertexSemantic.POSITION, 3);
    format.addAttrib(mini3d.VertexSemantic.COLOR, 3);

    // cube
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

    let mesh = new mini3d.Mesh(format);  
    //6个面（12个三角形），24个顶点  
    let position_data = [
        //v0-v1-v2-v3 front (0,1,2,3)
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0, -1.0, 1.0,  1.0, -1.0, 1.0,
        //v0-v3-v4-v5 right (4,5,6,7)
        1.0, 1.0, 1.0,  1.0, -1.0, 1.0,  1.0, -1.0, -1.0,  1.0, 1.0, -1.0,
        //v0-v5-v6-v1 top (8,9,10,11)
        1.0, 1.0, 1.0,  1.0, 1.0, -1.0,  -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
        //v1-v6-v7-v2 left (12,13,14,15)
        -1.0, 1.0, 1.0,  -1.0, 1.0, -1.0,  -1.0, -1.0, -1.0,  -1.0, -1.0, 1.0,
        //v7-v4-v3-v2 bottom (16,17,18,19)
        -1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0, -1.0, 1.0,  -1.0, -1.0, 1.0,
        //v4-v7-v6-v5 back (20,21,22,23)
        1.0, -1.0, -1.0,  -1.0, -1.0, -1.0,  -1.0, 1.0, -1.0,  1.0, 1.0, -1.0        
    ];
    let color_data = [
        //v0-v1-v2-v3 front (blue)
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        //v0-v3-v4-v5 right (green)
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
        //v0-v5-v6-v1 top (red)
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
        //v1-v6-v7-v2 left (yellow)
        1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0,
        //v7-v4-v3-v2 bottom (white)
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
        //v4-v7-v6-v5 back
        0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0
    ];

    let triangels = [
        0,1,2, 0,2,3,       //front
        4,5,6, 4,6,7,       //right
        8,9,10, 8,10,11,    //top
        12,13,14, 12,14,15, //left
        16,17,18, 16,18,19, //bottom
        20,21,22, 20,22,23  //back
    ]


    mesh.setVertexData(mini3d.VertexSemantic.POSITION, position_data);    
    mesh.setVertexData(mini3d.VertexSemantic.COLOR, color_data);   
    mesh.setTriangles(triangels);
    mesh.upload();            

    return mesh;   
}

let g_eyeX, g_eyeY, g_eyeZ;

function example(gl){
    let shader = new mini3d.Shader();
    if(!shader.create(VSHADER_SOURCE, FSHADER_SOURCE)){
        console.log("Failed to initialize shaders");
        return;
    }

    shader.mapAttributeSemantic(mini3d.VertexSemantic.POSITION, 'a_Position');
    shader.mapAttributeSemantic(mini3d.VertexSemantic.COLOR, 'a_Color');    

    shader.use();    
    
    let viewMatrix = new mini3d.Matrix4();
    g_eyeX = 3;
    g_eyeY = 3;
    g_eyeZ = 7;

    var mesh = createMesh(); 

    document.onkeydown = function(ev){
        keydown(ev, mesh, shader, viewMatrix);
    }

         

    //let modelMatrix = new mini3d.Matrix4();
    //modelMatrix.setRotate(-10, 0, 0, 1); //Rotate around z-axis

    //let modelViewMatrix = viewMatrix.multiply(modelMatrix);

    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);

    draw(mesh, shader, viewMatrix);

}

function keydown(ev, mesh, shader, viewMatrix){
    if(ev.keyCode==39){ //right arrow
        g_eyeX += 0.1;
    } else if(ev.keyCode==37){ //left arrow
        g_eyeX -= 0.1;
    } else {
        return;
    }

    draw(mesh, shader, viewMatrix);
}

function draw(mesh, shader, viewMatrix){
    viewMatrix.setLookAtGL(g_eyeX, g_eyeY, g_eyeZ,  0, 0, 0,  0, 1, 0); 
    
    let projMatrix = new mini3d.Matrix4();
    projMatrix.setPerspective(30, mini3d.canvas.width/mini3d.canvas.height, 1, 100);

    let mvpMatrix = projMatrix.multiply(viewMatrix);
    
    shader.setUniform('u_mvpMatrix', mvpMatrix.elements);

    let gl = mini3d.gl;
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    mesh.render(shader);
}

export default function main(){
    console.log('main');
    example(mini3d.gl);
}
