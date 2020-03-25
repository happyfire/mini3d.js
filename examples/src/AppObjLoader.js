
let vs_file = './shaders/basic_light.vs';
let fs_file = './shaders/basic_light.fs';
let obj_file = './models/dragon.obj';


class AppObjLoader{
    constructor(){
        this._inited = false;
        this._mesh = null;
        this._shader = null;       
        
        this._viewMatrix = new mini3d.Matrix4();
        this._modelMatrix = new mini3d.Matrix4();
        this._viewProjMatrix = new mini3d.Matrix4();
        this._mvpMatrix = new mini3d.Matrix4();
        this._normalMatrix = new mini3d.Matrix4();
        this._rotationQuat = new mini3d.Quaternion();
        this._matRot = new mini3d.Matrix4();

        this._rotX = 0;
        this._rotY = 0;
    }

    onInit(){
        let assetList = [
            [vs_file, mini3d.AssetType.Text],
            [fs_file, mini3d.AssetType.Text],
            [obj_file, mini3d.AssetType.Text]
        ]
    
        mini3d.assetManager.loadAssetList(assetList, function(){                
            this._inited = true;
            this.start();
        }.bind(this));

        this._viewMatrix.setViewByLookAt(.0, .0, 8.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    }

    onResize(width, height){
        this._viewProjMatrix.setPerspective(60.0, width/height, 1.0, 100.0);
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
        this._shader.mapAttributeSemantic(mini3d.VertexSemantic.NORMAL, 'a_Normal');
        this._shader.use();        
    
        let objFileString = mini3d.assetManager.getAsset(obj_file).data;
        this._mesh = mini3d.objFileLoader.load(objFileString, 0.3);                    
        
        let that = this;
        mini3d.eventManager.addEventHandler(mini3d.SystemEvent.touchMove, function(event, data){                           
            let factor = 300/mini3d.canvas.width;      
            let dx = data.dx * factor;
            let dy = data.dy * factor;    
            
            let clampAngle = function(angle, min, max){
                if(angle<-360) angle+=360;
                if(angle>360) angle-=360;
                return Math.max(Math.min(angle, max), min);
            }
            that._rotX = clampAngle(that._rotX + dy, -90.0, 90.0);
            that._rotY += dx;  
    
            //先旋转qy,再旋转qx
            let qx = mini3d.Quaternion.axisAngle(mini3d.Vector3.Right, that._rotX);
            let qy = mini3d.Quaternion.axisAngle(mini3d.Vector3.Up, that._rotY);
            mini3d.Quaternion.multiply(qx, qy, that._rotationQuat);
    
            //欧拉角的约定是先x后y,不是这里要的
            //that._rotationQuat.setFromEulerAngles(new mini3d.Vector3(that._rotX, that._rotY, 0));
    
            mini3d.Quaternion.toMatrix4(that._rotationQuat, that._matRot);
            
            that.draw();
        })
        
    
        gl.clearColor(0, 0, 0, 1);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
    
        this.draw();
    }

    draw(){         
        this._modelMatrix.setTranslate(0, -1.0, 0);               
        this._modelMatrix.multiply(this._matRot);
        this._modelMatrix.scale(1.0, 1.0, 1.0);
    
        this._normalMatrix.setInverseOf(this._modelMatrix)
        this._normalMatrix.transpose();    
    
        this._mvpMatrix.set(this._viewProjMatrix);
        this._mvpMatrix.multiply(this._modelMatrix);
        
        this._shader.setUniform('u_mvpMatrix', this._mvpMatrix.elements);
        this._shader.setUniform('u_NormalMatrix', this._normalMatrix.elements);
        this._shader.setUniform('u_LightColor', [1.0,1.0,1.0]);
        let lightDir = [0.5, 3.0, 4.0];
        this._shader.setUniform('u_LightDir', lightDir);
    
        let gl = mini3d.gl;
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        this._mesh.render(this._shader);
    
    }
}

export default AppObjLoader;