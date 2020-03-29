let vs_file = './shaders/basic_light.vs';
let fs_file = './shaders/basic_light.fs';
let obj_file = './models/dragon.obj';

class AppSimpleScene{
    constructor(){
        this._inited = false;        
        this._shader = null;                       
        
        this._rotX = 0;
        this._rotY = 0;        
        this._rotDegree = 0;
        this._tempQuat = new mini3d.Quaternion();
        this._tempVec3 = new mini3d.Vector3();
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
    }

    onResize(width, height){        
        if(this._scene){
            this._scene.onScreenResize(width, height);
        }         
    }

    onUpdate(dt){
        if(this._scene){

            //this._mesh2.localRotation.setFromEulerAngles(new mini3d.Vector3(this._rotDegree, this._rotDegree, this._rotDegree));
            //this._rotDegree += dt*100/1000;
            //this._rotDegree %= 360;                       
            
            this._mesh1.lookAt(this._mesh2.worldPosition, mini3d.Vector3.Up, 0.1);
            this._cameraNode.lookAt(this._mesh1.worldPosition);                        

            this._scene.update();                                   
            this._scene.render();
        }
    }

    start(){    
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
    
        this.createWorld();
        
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
            //let qx = mini3d.Quaternion.axisAngle(mini3d.Vector3.Right, that._rotX);
            //let qy = mini3d.Quaternion.axisAngle(mini3d.Vector3.Up, that._rotY);
            //mini3d.Quaternion.multiply(qx, qy, that._mesh1.localRotation);

            that._tempVec3.copyFrom(that._mesh2.localPosition);
            that._tempVec3.y -= 0.05*dy;
            that._tempVec3.x += 0.05*dx;
            that._mesh2.localPosition = that._tempVec3;            
                       
        })
                    
    
        
    }

    createWorld(){               
        this._scene = new mini3d.Scene();

        let objFileString = mini3d.assetManager.getAsset(obj_file).data;
        let mesh = mini3d.objFileLoader.load(objFileString, 0.3);    
        
        let meshRenderer = new mini3d.MeshRenderer();
        meshRenderer.setMesh(mesh);
        meshRenderer.setShader(this._shader);

        let meshRoot = new mini3d.SceneNode();
        this._scene.addChild(meshRoot);

        let mesh1 = new mini3d.SceneNode();
        mesh1.addComponent(mini3d.SystemComponents.Renderer, meshRenderer);
        //meshRoot.addChild(mesh1);
        this._scene.addChild(mesh1);

        mesh1.localPosition.set(-2, 0, 0);
        mesh1.localScale.set(0.5,0.5,0.5);        

        this._mesh1 = mesh1;

        let mesh2 = new mini3d.SceneNode();
        let meshRenderer2 = new mini3d.MeshRenderer();
        meshRenderer2.setMesh(mesh);
        meshRenderer2.setShader(this._shader);
        mesh2.addComponent(mini3d.SystemComponents.Renderer, meshRenderer2);
        this._scene.addChild(mesh2);
    
        mesh2.localPosition.set(2, 3.0, 0);
        mesh2.localScale.set(0.3,0.3,0.3);        
        this._mesh2 = mesh2;
        

        let camera = new mini3d.Camera();
        camera.setPerspective(60, mini3d.canvas.width/mini3d.canvas.height, 1.0, 100);
        this._cameraNode = new mini3d.SceneNode();
        this._cameraNode.addComponent(mini3d.SystemComponents.Camera, camera);
        this._scene.addChild(this._cameraNode);
        
        this._cameraNode.localPosition.set(0, 0, 8);       
        this._cameraNode.lookAt(new mini3d.Vector3(0,3,0));         

    }
}

export default AppSimpleScene;