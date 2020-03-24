import { SceneNode } from "./SceneNode";
import { SystemComponents } from "./systemComps";

class Scene{
    constructor(){
        this.root = new SceneNode();
        this.cameras = [];
    }

    getRoot(){
        return this.root;
    }

    addChild(child){ 
        this.root.addChild(child);

        //TODO: camera 应该可以加到任意节点上，因此不能在这儿获取。应该有个专门的方法
        let camera = child.getComponent(SystemComponents.Camera);
        if(camera!=null){
            this.cameras.push(camera);
        }
    }

    onScreenResize(width, height){
        for(let camera of this.cameras){
            camera.onScreenResize(width, height); //TODO:渲染目前如果是texture则不需要执行
        }
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

        //TODO: camera需要排序，按指定顺序渲染
        for(let camera of this.cameras){
            camera.beforeRender();

            for(let c of this.root.children){
                c.render(camera);
            }

            camera.afterRender();
        }

        
    }

}

export { Scene };