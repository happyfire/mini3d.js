let vs_file = './shaders/basic_light.vs';
let fs_file = './shaders/basic_light.fs';
let vs_scolor_file = './shaders/basic_light.vs';
let fs_scolor_file = './shaders/basic_light.fs';
let obj_file = './models/dragon.obj';

class AppSimpleScene {
    constructor() {
        this._inited = false;
        this._shader = null;

        this._rotX = 0;
        this._rotY = 0;
        this._rotDegree = 0;
        this._tempQuat = new mini3d.Quaternion();
        this._tempVec3 = new mini3d.Vector3();
    }

    onInit() {
        let assetList = [
            [vs_file, mini3d.AssetType.Text],
            [fs_file, mini3d.AssetType.Text],
            [vs_scolor_file, mini3d.AssetType.Text],
            [fs_scolor_file, mini3d.AssetType.Text],
            [obj_file, mini3d.AssetType.Text]
        ]

        mini3d.assetManager.loadAssetList(assetList, function () {
            this._inited = true;
            this.start();
        }.bind(this));
    }

    onResize(width, height) {
        if (this._scene) {
            this._scene.onScreenResize(width, height);
        }
    }

    onUpdate(dt) {
        if (this._scene) {
            this._scene.update();

            //this._mesh2.localRotation.setFromEulerAngles(new mini3d.Vector3(this._rotDegree, this._rotDegree, this._rotDegree));
            //this._rotDegree += dt*100/1000;
            //this._rotDegree %= 360;                       

            //this._mesh1.lookAt(this._mesh2.worldPosition, mini3d.Vector3.Up, 0.1);
            //this._cameraNode.lookAt(this._mesh1.worldPosition);                        


            this._scene.render();
        }
    }

    start() {
        // let vs = mini3d.assetManager.getAsset(vs_file).data;
        // let fs = mini3d.assetManager.getAsset(fs_file).data;

        // let vs_scolor = mini3d.assetManager.getAsset(vs_scolor_file).data;
        // let fs_scolor = mini3d.assetManager.getAsset(fs_scolor_file).data;
       

        this.createWorld();
        
        mini3d.eventManager.addEventHandler(mini3d.SystemEvent.touchMove, function (event, data) {
            let factor = 300 / mini3d.canvas.width;
            let dx = data.dx * factor;
            let dy = data.dy * factor;

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

            this._tempVec3.copyFrom(this._mesh2.localPosition);
            this._tempVec3.y -= 0.05 * dy;
            this._tempVec3.x += 0.05 * dx;
            this._mesh2.localPosition = this._tempVec3;

        }.bind(this));



    }

    createWorld() {
        this._material1 = new mini3d.MatBasicLight();
        this._material2 = new mini3d.MatBasicLight();
        this._materialSolidColor = new mini3d.MatSolidColor(); 

        this._scene = new mini3d.Scene();

        let planeMesh = mini3d.Plane.createMesh(10, 10, 10, 10, true);
        this._planeNode = this._scene.root.addMeshNode(planeMesh, this._materialSolidColor);
        this._planeNode.localPosition.set(0,0,0);
        this._materialSolidColor.setColor([1.0,1.0,0.0]);


        let objFileString = mini3d.assetManager.getAsset(obj_file).data;
        let mesh = mini3d.objFileLoader.load(objFileString, 0.5);   
        //let mesh = mini3d.Cube.createMesh();

        let meshRoot = this._scene.root.addEmptyNode();        
        //meshRoot.localPosition.set(-1, 1, 1);
        //meshRoot.localScale.set(0.8, 1, 1);
        //meshRoot.localRotation.setFromAxisAngle(new mini3d.Vector3(0, 1, 0), 90);

        let mesh1 = meshRoot.addMeshNode(mesh, this._material1);
        mesh1.localPosition.set(1, 0, 0);
        mesh1.localScale.set(0.5, 0.5, 0.5);
        this._mesh1 = mesh1;
        this._material1.diffuse = [1.0,1.0,1.0];
        this._material1.specular = [1.0, 1.0, 1.0];

        let mesh2 = this._scene.root.addMeshNode(mesh, this._material2);
        mesh2.localPosition.set(-1, 1, 0);
        mesh2.localScale.set(0.3, 0.3, 0.3);
        this._mesh2 = mesh2;
        this._material2.diffuse = [1.0,1.0,1.0];
        this._material2.specular = [1.0, 1.0, 1.0];

        let light = this._scene.root.addDirectionalLight([1,1,1]);


        this._cameraNode = this._scene.root.addPerspectiveCamera(60, mini3d.canvas.width / mini3d.canvas.height, 1.0, 100);        
        this._cameraNode.localPosition.set(0, 3, 10);
        this._cameraNode.lookAt(new mini3d.Vector3(0, 0, 0));

    }
}

export default AppSimpleScene;