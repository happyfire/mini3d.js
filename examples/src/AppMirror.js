import { Vector3 } from "../../src/math/vector3";

let obj_file_sphere = './models/sphere.obj';
let box_main_texture = './imgs/box_diffuse.jpg';
let box_normal_map = './imgs/box_normal.jpg';
let plane_main_texture = './imgs/wall02_diffuse.png';
let plane_normal_map = './imgs/wall02_normal.png';
let brick_main_texture = './imgs/brickwall_diffuse.jpg';
let brick_normal_map = './imgs/brickwall_normal.jpg';

class AppMirror {
    constructor() {             
        this._time = 0;     
        this._rotX = 0;
        this._rotY = 0;           
        this._tempQuat = new mini3d.Quaternion();
        this._tempVec3 = new mini3d.Vector3();
    }

    onInit() {
        let assetList = [
            [obj_file_sphere, mini3d.AssetType.Text],
            [box_main_texture, mini3d.AssetType.Image],
            [box_normal_map, mini3d.AssetType.Image],
            [plane_main_texture, mini3d.AssetType.Image],
            [plane_normal_map, mini3d.AssetType.Image],
            [brick_main_texture, mini3d.AssetType.Image],
            [brick_normal_map, mini3d.AssetType.Image]
        ]

        mini3d.assetManager.loadAssetList(assetList, function () {            
            this.start();
        }.bind(this));
    }

    onResize(width, height) {
        if (this._scene) {
            this._scene.onScreenResize(width, height);
        }
    }    

    start() {
        this.createWorld();
        
        mini3d.eventManager.addEventHandler(mini3d.SystemEvent.touchMove, function (event, data) {            
            let dx = data.dx;
            let dy = data.dy;

            let clampAngle = function (angle, min, max) {
                if (angle < -360) angle += 360;
                if (angle > 360) angle -= 360;
                return Math.max(Math.min(angle, max), min);
            }
            this._rotX = clampAngle(this._rotX + dy, -90.0, 90.0);
            this._rotY += dx;

            let qx = mini3d.Quaternion.axisAngle(mini3d.Vector3.Right, this._rotX);
            let qy = mini3d.Quaternion.axisAngle(mini3d.Vector3.Up, this._rotY);
            mini3d.Quaternion.multiply(qx, qy, this._tempQuat);

            this._mirror.localRotation = this._tempQuat;            

        }.bind(this));
    }

    createGround(){
        let groundMesh = mini3d.Plane.createMesh(20, 10, 20, 10);
        let matGround = new mini3d.MatNormalMap();
        matGround.mainTexture = mini3d.textureManager.getTexture(plane_main_texture);
        matGround.mainTexture.setRepeat();
        matGround.mainTextureST = [3,3,0,0];
        matGround.normalMap = mini3d.textureManager.getTexture(plane_normal_map);
        matGround.normalMap.setRepeat();
        matGround.normalMapST = [3,3,0,0];
        matGround.specular = [0.8, 0.8, 0.8];
        let groundNode = this._scene.root.addMeshNode(groundMesh, matGround);
        groundNode.localPosition.set(0,0,0); 
    }

    createWall(){
        let wallMesh = mini3d.Plane.createMesh(10, 10, 10, 10);
        let matWall = new mini3d.MatNormalMap();
        matWall.mainTexture =  mini3d.textureManager.getTexture(brick_main_texture);
        matWall.mainTexture.setRepeat();
        matWall.mainTextureST = [3,3,0,0];
        matWall.normalMap = mini3d.textureManager.getTexture(brick_normal_map);
        matWall.normalMap.setRepeat();
        matWall.normalMapST = [3,3,0,0];
        matWall.specular = [0.8, 0.8, 0.8];
        return this._scene.root.addMeshNode(wallMesh, matWall);
    }

    createMirror(texture){
        let mirrorRoot = this._scene.root.addEmptyNode();
        let mirrorMesh = mini3d.Plane.createMesh(6,3,6,3);
        let matMirror = new mini3d.MatMirror();
        matMirror.mainTexture = texture;
        let node = mirrorRoot.addMeshNode(mirrorMesh, matMirror);
        node.localRotation.setFromEulerAngles(this._tempVec3.set(90,0,0));
        
        mirrorRoot.localPosition.set(0, 2, -4);
        return mirrorRoot;
    }

    createWorld() {

        // Load meshes
        let sphereData = mini3d.assetManager.getAsset(obj_file_sphere).data;
        let sphereMesh = mini3d.objFileLoader.load(sphereData, 1.0, true);

        
        // Create scene
        this._scene = new mini3d.Scene();        

        // Create the ground
        this.createGround();  
        
        // Create walls
        let wall1 = this.createWall();
        wall1.localPosition.set(0, 5, -5);
        wall1.localRotation.setFromEulerAngles(new Vector3(90,0,0));
        let wall2 = this.createWall();
        wall2.localPosition.set(-5, 5, 0);
        wall2.localRotation.setFromEulerAngles(new Vector3(90,90,0));
        let wall3 = this.createWall();
        wall3.localPosition.set(5, 5, 0);
        wall3.localRotation.setFromEulerAngles(new Vector3(90,-90,0));
        let wall4 = this.createWall();
        wall4.localPosition.set(0, 5, 5);
        wall4.localRotation.setFromEulerAngles(new Vector3(90,180,0));
        

        // Create an empty mesh root node
        let meshRoot = this._scene.root.addEmptyNode();        
        //meshRoot.localPosition.set(-1, 1, 1);
        //meshRoot.localScale.set(0.8, 1, 1);
        //meshRoot.localRotation.setFromAxisAngle(new mini3d.Vector3(0, 1, 0), 45);    
        
        // Create box
        let matBox = new mini3d.MatNormalMapW();
        matBox.mainTexture = mini3d.textureManager.getTexture(box_main_texture);
        matBox.normalMap = mini3d.textureManager.getTexture(box_normal_map);        
        matBox.colorTint = [1.0, 1.0, 1.0];
        matBox.specular = [0.8, 0.8, 0.8];
        matBox.gloss = 10;

        let box = meshRoot.addMeshNode(mini3d.Cube.createMesh(), matBox);
        box.localPosition.set(-1, 1, 0);
        box.localScale.set(0.8, 0.8, 0.8);
        this._box = box;

        // Create ball
        let matBall = new mini3d.MatNormalMap();
        matBall.mainTexture = mini3d.textureManager.getTexture(plane_main_texture);
        matBall.normalMap = mini3d.textureManager.getTexture(plane_normal_map);        
        matBall.colorTint = [1.0, 1.0, 1.0];
        matBall.specular = [0.8, 0.8, 0.8];
        let ball = box.addMeshNode(sphereMesh, matBall);
        ball.localPosition.set(0, 1.5, 0);  
        
        // ball2
        let matBall2 = new mini3d.MatPixelLight();
        matBall2.mainTexture = mini3d.textureManager.getTexture(box_main_texture);        
        matBall2.colorTint = [1.0, 1.0, 1.0];
        matBall2.specular = [0.8, 0.8, 0.8];
        let ball2 = meshRoot.addMeshNode(sphereMesh, matBall2);
        ball2.localPosition.set(1, 2, -1); 
        this._ball2 = ball2; 
        
        // Add a directional light node to scene        
        let mainLight = this._scene.root.addDirectionalLight([0.8,0.8,0.8]);
        //this._tempQuat.setFromEulerAngles(this._tempVec3.set(135,-45,0));
        //mainLight.localRotation = this._tempQuat;
        mainLight.lookAt(this._tempVec3.set(-1,-1,-1));

        // Add point light 1
        let lightColor = [0.0,0.05,0.0];
        let pointLight = this._scene.root.addPointLight(lightColor,10);
        pointLight.localPosition.set(-5, 6, 0);
        let lightball = pointLight.addMeshNode(sphereMesh, new mini3d.MatSolidColor([0.5,0.9,0.5])); //点光源身上放一个小球以显示他的位置   
        lightball.localScale.set(0.2,0.2,0.2);
        this._pointLight1 = pointLight;             

        // Add point light 2
        lightColor = [0.05,0.0,0.0];
        pointLight = this._scene.root.addPointLight(lightColor,10);
        pointLight.localPosition.set(5, 6, 0);
        lightball = pointLight.addMeshNode(sphereMesh, new mini3d.MatSolidColor([0.9,0.5,0.5]));
        lightball.localScale.set(0.2,0.2,0.2);
        this._pointLight2 = pointLight;

        // Add a perspective camera
        this._cameraNode = this._scene.root.addPerspectiveCamera(60, mini3d.canvas.width / mini3d.canvas.height, 1.0, 1000);        
        this._cameraNode.localPosition.set(-1, 4, 5);
        this._cameraNode.lookAt(new mini3d.Vector3(0, 1, 0));
        this._cameraNode.camera.clearColor = [0.34,0.98,1];

        // Add a render texture and mirror node
        let mirrorWidth = 512.0;
        let mirrorHeight = 256.0;
        this._renderTexture = new mini3d.RenderTexture(mirrorWidth,mirrorHeight);
        let mirror = this.createMirror(this._renderTexture.texture2D);
        this._mirror = mirror;
        // Add a camera to the mirror
        this._renderCamera = mirror.addPerspectiveCamera(60, mirrorWidth/mirrorHeight, 0.2, 100);        
        // //说明：因为Plane创建是顶点分布在本地坐标系的xz平面上的,因此镜子默认是面朝本地+y的，为了将镜子立起来绕x轴旋转了90度
        // //这样camera挂到镜子结点上，如果不做任何旋转，其本地z轴是冲着世界-y轴的，且由于camera是看向本地-z的
        // //所以直接挂上camera是看着天的（世界+y)。因此此处让camera绕的本地x轴旋转90度，这样它照着世界+z，和镜子看上去的面向一致。
        // //但仅仅这样还不行，因为这样camera的up方向是指向世界-y,照到的世界是倒着的。因此要先让camera绕本地z轴旋转180度。
        // //注：引擎中欧拉角转四元数是按ZXY顺序
        // //（ps:未来可能应该把引擎生成的平面的朝向改成+z)
        // this._renderCamera.localRotation.setFromEulerAngles(this._tempVec3.set(90,0,180));
        // //上面使用欧拉角太麻烦，因为没有编辑器可以边转边看，由于此次我们知道镜子相机朝向的世界位置是+z，因此可以直接使用lookAt
        // //但这个方法不适用于制作预制件，或者不知道将要把镜子朝哪儿放的情况
        //this._renderCamera.lookAt(new mini3d.Vector3(0, 0, 1));

        //更新：我给镜子加了一个空的父节点，然后把camera挂到这个父节点上，这样只要把camera的z轴调转就行了。。
        //保留上面的注释吧，使用欧拉角确实麻烦，还是应该让所有模型的朝向一致
        this._renderCamera.localRotation.setFromEulerAngles(this._tempVec3.set(0,180,0));

        this._renderCamera.camera.clearColor = [0.34,0.98,1];
        this._renderCamera.camera.target = this._renderTexture;

    }

    onUpdate(dt) {
        if (this._scene) {
            this._time += dt;
            this._scene.update();             
           
            //灯光做圆周运动
            let cosv = Math.cos(this._time/1500);
            let sinv = Math.sin(this._time/1500);
            let radius = 5;
            
            this._pointLight1.localPosition.x = radius*cosv*cosv;
            this._pointLight1.localPosition.z = radius*sinv*cosv;
            this._pointLight1.localPosition.y = 0.5 + radius*(0.5+0.5*sinv)*0.5;
            this._pointLight1.setTransformDirty();

            this._pointLight2.localPosition.x = -radius*cosv*cosv;
            this._pointLight2.localPosition.z = -radius*sinv*cosv;
            this._pointLight2.localPosition.y = 0.5 + radius*(0.5+0.5*sinv)*0.5;
            this._pointLight2.setTransformDirty();

            this._box.localRotation = this._tempQuat.setFromEulerAngles(this._tempVec3.set(10*cosv, 10*sinv, 0));
            this._ball2.localPosition.y = 0.5 + radius*(0.5+0.5*sinv)*0.5;
            this._ball2.setTransformDirty();
            
            this._scene.render();
        }
    }
}

export default AppMirror;