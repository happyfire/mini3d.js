import { SceneNode } from "./SceneNode";
import { SystemComponents } from "./systemComps";
import { MeshRenderer } from "./components/meshRenderer";
import { Camera } from "./components/camera";

class SceneNodeFactory{

    static createMeshNode(mesh, shader){
        let meshRenderer = new MeshRenderer();
        meshRenderer.setMesh(mesh);
        meshRenderer.setShader(shader);
        
        let node = new SceneNode();
        node.addComponent(SystemComponents.Renderer, meshRenderer);        
        return node;        
    }

    static createPerspectiveCamera(fovy, aspect, near, far){
        let camera = new Camera();
        camera.setPerspective(fovy, aspect, near, far);
        
        let node = new SceneNode();
        node.addComponent(SystemComponents.Camera, camera);
        return node;
    }

}

export { SceneNodeFactory };