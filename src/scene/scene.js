import { SceneNode } from "./SceneNode";

class Scene{
    constructor(){
        this.root = new SceneNode();

    }

    getRoot(){
        return this.root;
    }

    addChild(child){
        this.root.addChild(child);
    }

    update(){
        this.root.updateWorldMatrix();
    }

    render(){
        //TODO: 找出camera, 灯光和可渲染结点，逐camera进行forward rendering
        //1. camera frustum culling
        //2. 逐队列渲染
        //   2-1. 不透明物体队列，按材质实例将node分组，然后排序（从前往后）
        //   2-2, 透明物体队列，按z序从后往前排列

        for(let c of this.root.children){
            c.render();
        }
    }
}

export { Scene };