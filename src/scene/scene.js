import { SceneNode } from "./SceneNode";

class Scene{
    constructor(){
        this.root = new SceneNode();

    }

    getRoot(){
        return this.root;
    }

    update(){
        this.root.updateWorldMatrix();
    }

    render(){
        
    }
}

export { Scene };