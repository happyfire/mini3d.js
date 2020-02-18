let vs_file = './shaders/tex_color.vs';
let fs_file = './shaders/tex_color.fs';
let tex_file = './imgs/box_diffuse.jpg';

function createMesh(){

    let format = new mini3d.VertexFormat();
    format.addAttrib(mini3d.VertexSemantic.POSITION, 3);
    format.addAttrib(mini3d.VertexSemantic.COLOR, 3);
    format.addAttrib(mini3d.VertexSemantic.UV0, 2);

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
    let uv_data = [
        //v0-v1-v2-v3 front
        1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
        //v0-v3-v4-v5 right
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
        //v0-v5-v6-v1 top
        1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
        //v1-v6-v7-v2 left
        1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
        //v7-v4-v3-v2 bottom
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        //v4-v7-v6-v5 back
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0
    ]

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
    mesh.setVertexData(mini3d.VertexSemantic.UV0, uv_data);
    mesh.setTriangles(triangels);
    mesh.upload();            

    return mesh;   
}

class AppTexturedCube{
    constructor(){
        this._inited = false;
        this._mesh = null;
        this._shader = null;
        this._texture = null;
        
        this._viewMatrix = new mini3d.Matrix4();
        this._modelMatrix = new mini3d.Matrix4();
        this._viewProjMatrix = new mini3d.Matrix4();
        this._mvpMatrix = new mini3d.Matrix4();
        this._rotX = 30;
        this._rotY = 30;
        this._rotZ = 0;
    }

    onInit(){
        let assetList = [
            [vs_file, mini3d.AssetType.Text],
            [fs_file, mini3d.AssetType.Text],
            [tex_file, mini3d.AssetType.Image]
        ]
    
        mini3d.assetManager.loadAssetList(assetList, function(){    
            this._inited = true;            
            this.start();
        }.bind(this));

        this._viewMatrix.setLookAt(.0, .0, 8.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    }

    onResize(width, height){                
        this._viewProjMatrix.setPerspective(30.0, width/height, 1.0, 100.0);
        this._viewProjMatrix.multiply(this._viewMatrix);   
        
        if(this._inited){            
            this.draw();
        }        
    }

    onUpdate(dt){
       
    }

    start(){
        let gl = mini3d.gl;

        let vs = mini3d.assetManager.getAsset(vs_file).data;
        let fs = mini3d.assetManager.getAsset(fs_file).data;

        let shader = new mini3d.Shader();
        if(!shader.create(vs, fs)){
            console.log("Failed to initialize shaders");
            return;
        }

        this._shader = shader;
        this._shader.mapAttributeSemantic(mini3d.VertexSemantic.POSITION, 'a_Position');
        this._shader.mapAttributeSemantic(mini3d.VertexSemantic.COLOR, 'a_Color');    
        this._shader.mapAttributeSemantic(mini3d.VertexSemantic.UV0, 'a_TexCoord');        
        this._shader.use();
    
        this._texture = mini3d.textureManager.getTexture(tex_file);
        this._mesh = createMesh();              
        
        let that = this;
        mini3d.eventManager.addEventHandler(mini3d.SystemEvent.touchMove, function(event, data){      
            let factor = 300/mini3d.canvas.width;      
            let dx = data.dx * factor;
            let dy = data.dy * factor;                        
            that._rotX = Math.max(Math.min(that._rotX + dy, 90.0), -90.0);            
            that._rotY += dx;            
            that.draw();
        });

        
        gl.clearColor(0, 0, 0, 1);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);

        this.draw();
    }    

    draw(){        
    
        //rotate order: y-x-z
        this._modelMatrix.setRotate(this._rotZ, 0, 0, 1); //rot around z-axis
        this._modelMatrix.rotate(this._rotX, 1.0, 0.0, 0.0); //rot around x-axis
        this._modelMatrix.rotate(this._rotY, 0.0, 1.0, 0.0); //rot around y-axis
    
        this._mvpMatrix.set(this._viewProjMatrix);
        this._mvpMatrix.multiply(this._modelMatrix);
        
        this._shader.setUniform('u_mvpMatrix', this._mvpMatrix.elements);
    
        this._texture.bind();
        this._shader.setUniform('u_sampler', 0);
    
        let gl = mini3d.gl;
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        this._mesh.render(this._shader);
    
        this._texture.unbind();
    }
}

export default AppTexturedCube;