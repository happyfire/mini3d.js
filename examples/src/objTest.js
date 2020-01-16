let vs_file = './shaders/basic_light.vs';
let fs_file = './shaders/basic_light.fs';
let obj_file = './models/bunny.obj';

function createMesh(){
    let objFileString = mini3d.assetManager.getAsset(obj_file).data;
    let mesh = mini3d.objFileLoader.load(objFileString, 0.5);             
    return mesh;   
}

let modelMatrix = new mini3d.Matrix4();
let viewProjMatrix = new mini3d.Matrix4();
let mvpMatrix = new mini3d.Matrix4();
let rotX = 0;
let rotY = 0;
let rotZ = 0;

function example(){
    let gl = mini3d.gl;

    let vs = mini3d.assetManager.getAsset(vs_file).data;
    let fs = mini3d.assetManager.getAsset(fs_file).data;

    let shader = new mini3d.Shader();
    if(!shader.create(vs, fs)){
        console.log("Failed to initialize shaders");
        return;
    }

    shader.mapAttributeSemantic(mini3d.VertexSemantic.POSITION, 'a_Position');
    shader.mapAttributeSemantic(mini3d.VertexSemantic.NORMAL, 'a_Normal');
    
    shader.use();        

    let mesh = createMesh();     

    let viewMatrix = new mini3d.Matrix4();
    viewMatrix.setLookAt(.0, .0, 8.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    viewProjMatrix.setPerspective(30.0, mini3d.canvas.width/mini3d.canvas.height, 1.0, 100.0);
    viewProjMatrix.multiply(viewMatrix);

    setupInput(function(dx, dy, rotateZ){
        
        if(rotateZ){
            rotZ += dx;
        } else {
            rotX = Math.max(Math.min(rotX + dy, 90.0), -90.0);
            //rotX += dy;
            rotY += dx;
        }
        draw(mesh, shader);
    })
    

    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);

    draw(mesh, shader);
}


function draw(mesh, shader){        
    
    //rotate order: x-y-z
    modelMatrix.setRotate(rotZ, 0, 0, 1); //rot around z-axis
    modelMatrix.rotate(rotY, 0.0, 1.0, 0.0); //rot around y-axis
    modelMatrix.rotate(rotX, 1.0, 0.0, 0.0); //rot around x-axis

    mvpMatrix.set(viewProjMatrix);
    mvpMatrix.multiply(modelMatrix);
    
    shader.setUniform('u_mvpMatrix', mvpMatrix.elements);
    shader.setUniform('u_LightColor', [1.0,1.0,1.0]);
    let lightDir = [0.5, 3.0, 4.0];
    shader.setUniform('u_LightDir', lightDir);

    let gl = mini3d.gl;
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    mesh.render(shader);

}

function setupInput(onDrag){
    let dragging = false;
    let lastX = -1, lastY = -1;
    let rotateZ = false;

    mini3d.canvas.onmousedown = function(event){             
        let x = event.clientX;
        let y = event.clientY;
        let rect = event.target.getBoundingClientRect();
        if(x>=rect.left && x<rect.right && y>=rect.top && y<rect.bottom){
            lastX = x;
            lastY = y;
            dragging = true;            
            rotateZ = event.ctrlKey;            
        }
    }

    mini3d.canvas.onmouseup = function(event){
        dragging = false;        
    }

    mini3d.canvas.onmousemove = function(event){        
        let x = event.clientX;
        let y = event.clientY;
        if(dragging){
            let factor = 300/mini3d.canvas.height;
            let dx = factor * (x-lastX);
            let dy = factor * (y-lastY);
            if(onDrag){
                onDrag(dx, dy, rotateZ);
            }            
        }
        lastX = x;
        lastY = y;
    }
}

export default function objTest(){
    let assetList = [
        [vs_file, mini3d.AssetType.Text],
        [fs_file, mini3d.AssetType.Text],
        [obj_file, mini3d.AssetType.Text]
    ]

    mini3d.assetManager.loadAssetList(assetList, function(){                
        example();
    });
}