let obj_file_capsule = './models/capsule.obj';
let obj_file_sphere = './models/sphere.obj';
let obj_main_texture = './imgs/wall01_diffuse.jpg';
let obj_normal_map = './imgs/wall01_normal.jpg';
let box_main_texture = './imgs/box_diffuse.jpg';
let box_normal_map = './imgs/box_normal.jpg';
let plane_main_texture = './imgs/wall02_diffuse.png';
let plane_normal_map = './imgs/wall02_normal.png';
let brick_main_texture = './imgs/brickwall_diffuse.jpg';
let brick_normal_map = './imgs/brickwall_normal.jpg';

class AppNormalMap {
    constructor() {             
        this._time = 0;     
        this._rotX = 0;
        this._rotY = 0;           
        this._tempQuat = new mini3d.Quaternion();
        this._tempVec3 = new mini3d.Vector3();
    }

    onInit() {
        let assetList = [
            [obj_file_capsule, mini3d.AssetType.Text],
            [obj_file_sphere, mini3d.AssetType.Text],
            [obj_main_texture, mini3d.AssetType.Image],
            [obj_normal_map, mini3d.AssetType.Image],
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
            let factor = 0.01;
            let dx = data.dx;
            let dy = data.dy;

            // this._tempVec3.copyFrom(this._mesh2.localPosition);
            // this._tempVec3.z += dy * factor;
            // this._tempVec3.x += dx * factor;
            // this._mesh2.localPosition = this._tempVec3;

            let clampAngle = function (angle, min, max) {
                if (angle < -360) angle += 360;
                if (angle > 360) angle -= 360;
                return Math.max(Math.min(angle, max), min);
            }
            this._rotX = clampAngle(this._rotX + dy, -90.0, 90.0);
            this._rotY += dx;

            //先旋转qy,再旋转qx
            let qx = mini3d.Quaternion.axisAngle(mini3d.Vector3.Right, this._rotX);
            let qy = mini3d.Quaternion.axisAngle(mini3d.Vector3.Up, this._rotY);
            mini3d.Quaternion.multiply(qx, qy, this._tempQuat);
            this._mesh1.localRotation = this._tempQuat;
            this._mesh2.localRotation = this._tempQuat;

        }.bind(this));
    }

    createWorld() {

        // Load meshes
        let capusleData = mini3d.assetManager.getAsset(obj_file_capsule).data;
        let capusleMesh = mini3d.objFileLoader.load(capusleData, 1.0, true);

        let sphereData = mini3d.assetManager.getAsset(obj_file_sphere).data;
        let sphereMesh = mini3d.objFileLoader.load(sphereData, 1.0, true);

        
        // Create scene
        this._scene = new mini3d.Scene();

        // Create a plane
        let planeMesh = mini3d.Plane.createMesh(20, 20, 20, 20);
        let matPlane = new mini3d.MatPixelLight();
        matPlane.mainTexture = mini3d.textureManager.getTexture(plane_main_texture);
        matPlane.mainTexture.setRepeat();
        matPlane.mainTextureST = [2,2,0,0];
        matPlane.specular = [0.8, 0.8, 0.8];
        this._planeNode = this._scene.root.addMeshNode(planeMesh, matPlane);
        this._planeNode.localPosition.set(0,0,0);       

        // Create an empty mesh root node
        let meshRoot = this._scene.root.addEmptyNode();        
        //meshRoot.localPosition.set(-1, 1, 1);
        //meshRoot.localScale.set(0.8, 1, 1);
        //meshRoot.localRotation.setFromAxisAngle(new mini3d.Vector3(0, 1, 0), 45);

        // Create mesh node 1
        let material1 = new mini3d.MatNormalMap();
        material1.mainTexture = mini3d.textureManager.getTexture(obj_main_texture);
        material1.normalMap = mini3d.textureManager.getTexture(obj_normal_map);        
        material1.colorTint = [1.0, 1.0, 1.0];
        material1.specular = [0.8, 0.8, 0.8];

        this._mesh1 = meshRoot.addMeshNode(capusleMesh, material1);
        this._mesh1.localPosition.set(1, 1, 0);        
        
        // Create mesh node 2
        let material2 = new mini3d.MatNormalMap();
        material2.mainTexture = mini3d.textureManager.getTexture(brick_main_texture);
        material2.normalMap = mini3d.textureManager.getTexture(brick_normal_map);        
        material2.colorTint = [1.0, 1.0, 1.0];
        material2.specular = [0.8, 0.8, 0.8];
        material2.gloss = 10;

        this._mesh2 = meshRoot.addMeshNode(sphereMesh, material2);
        this._mesh2.localPosition.set(-1, 1, 0);
        this._mesh2.localScale.set(2, 2, 2);
        
        // Add a directional light node to scene
        this._scene.root.addDirectionalLight([0.8,0.8,0.8]);

        // Add point light 1
        let lightColor = [0.05,0.05,0.05];
        let pointLight = this._scene.root.addPointLight(lightColor,10);
        pointLight.localPosition.set(-5, 6, 0);
        let lightball = pointLight.addMeshNode(sphereMesh, new mini3d.MatSolidColor([0.9,0.9,0.9])); //点光源身上放一个小球以显示他的位置   
        lightball.localScale.set(0.2,0.2,0.2);
        this._pointLight1 = pointLight;             

        // Add point light 2
        lightColor = [0.05,0.05,0.05];
        pointLight = this._scene.root.addPointLight(lightColor,10);
        pointLight.localPosition.set(5, 6, 0);
        lightball = pointLight.addMeshNode(sphereMesh, new mini3d.MatSolidColor([0.9,0.9,0.9]));
        lightball.localScale.set(0.2,0.2,0.2);
        this._pointLight2 = pointLight;
        
        // Add a perspective camera
        this._cameraNode = this._scene.root.addPerspectiveCamera(60, mini3d.canvas.width / mini3d.canvas.height, 1.0, 1000);        
        this._cameraNode.localPosition.set(0, 1, 5.5);
        this._cameraNode.lookAt(new mini3d.Vector3(0, 1, 0));
        this._cameraNode.camera.clearColor = [0.34,0.98,1];

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

           
            this._scene.render();
        }
    }
}

export default AppNormalMap;