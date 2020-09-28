import { SceneNode } from "./SceneNode";
import { SystemComponents } from "./systemComps";

class Scene{
    constructor(){
        this._root = new SceneNode();
        this._root._scene = this;
        this.cameras = [];
        this.lights = [];
        this.projectors = [];
        this.renderNodes = [];

        this._ambientColor = [0.1,0.1,0.1];
    }

    set ambientColor(v){
        this._ambientColor = v;
    }

    get ambientColor(){
        return this._ambientColor;
    }

    get root(){
        return this._root;
    }

    onAddNode(node){
        let camera = node.getComponent(SystemComponents.Camera);
        if(camera!=null){
            this.cameras.push(camera);
            return;
        }  

        let light = node.getComponent(SystemComponents.Light);
        if(light!=null){
            this.lights.push(light);
            return;
        }

        let projector = node.getComponent(SystemComponents.Projector);
        if(projector!=null){
            this.projectors.push(projector);
            return;
        }

        this.renderNodes.push(node);        
    }

    onRemoveNode(node){
        let camera = node.getComponent(SystemComponents.Camera);
        if(camera!=null){
            node.camera = null;
            let idx = this.cameras.indexOf(camera);
            if(idx>=0){
                this.cameras.splice(idx, 1);
            }
            return;
        } 

        let projector = node.getComponent(SystemComponents.Projector);
        if(projector!=null){
            node.projector = null;
            let idx = this.projectors.indexOf(projector);
            if(idx>=0){
                this.projectors.splice(idx, 1);
            }
            return;
        }
        
        let light = node.getComponent(SystemComponents.Light);
        if(light!=null){
            node.light = null;
            let idx = this.lights.indexOf(light);
            if(idx>=0){
                this.lights.splice(idx, 1);
            }
            return;
        }
                
        let idx = this.renderNodes.indexOf(node);
        if(idx>=0){
            this.renderNodes.splice(idx, 1);
        }                
    }

    onScreenResize(width, height){
        for(let camera of this.cameras){
            camera.onScreenResize(width, height);
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

            //TODO：按优先级和范围选择灯光，灯光总数要有限制
            for(let rnode of this.renderNodes){
                rnode.render(this, camera, this.lights, this.projectors);
            }

            camera.afterRender();
        }

        
    }

}

export { Scene };