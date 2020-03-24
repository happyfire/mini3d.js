import { Vector3 } from "../math/vector3";
import { Quaternion } from "../math/quaternion";
import { Matrix4 } from "../math/matrix";
import { SystemComponents } from "./systemComps";

class SceneNode {
    constructor(){
        this.position = new Vector3();
        this.rotation = new Quaternion();
        this.scale = new Vector3(1,1,1);
        this.localMatrix = new Matrix4();
        this.worldMatrix = new Matrix4();
        this.worldPosition = new Vector3();

        this.parent = null;
        this.children = [];

        this._rotationMatrix = new Matrix4();

        this.components = {};
    }

    removeFromParent(){
        if(this.parent){
            let idx = this.parent.children.indexOf(this);
            if(idx>=0){
                this.parent.children.splice(idx, 1);
            }
            this.parent = null;
        }
    }

    setParent(parent){
        this.removeFromParent();
        if(parent){
            parent.children.push(this);
        }
        this.parent = parent;
    }

    addChild(node){
        node.setParent(this);
    }

    lookAt(worldPos){

    }

    lookAtNode(targetNode){
        
    }

    updateLocalMatrix(){
        //TODO:local matrix dirty flag

        this.localMatrix.setTranslate(this.position.x, this.position.y, this.position.z);   
        //TODO:封装rotation操作并cache _rotatoinMatrix
        Quaternion.toMatrix4(this.rotation, this._rotationMatrix);
        this.localMatrix.multiply(this._rotationMatrix);        
        this.localMatrix.scale(this.scale.x, this.scale.y, this.scale.z);   
        
        //TODO:此处可优化，避免矩阵乘法，Matrix4增加fromTRS(pos, rot, scale)方法
    }

    updateWorldMatrix(parentWorldMatrix){
        this.updateLocalMatrix();

        if(parentWorldMatrix){
            Matrix4.multiply(parentWorldMatrix, this.localMatrix, this.worldMatrix);
        } else {
            this.worldMatrix.set(this.localMatrix);
        }

        //TODO:从world matrix中提取出worldPosition


        let worldMatrix = this.worldMatrix;
        this.children.forEach(function(child){
            child.updateWorldMatrix(worldMatrix);
        });

        
    }

    addComponent(type, component){
        this.components[type] = component;
        component.setNode(this);
    }

    getComponent(type){
        return this.components[type];
    }

    render(camera){
        let renderer = this.components[SystemComponents.Renderer];
        if(renderer){
            renderer.render(camera);
        }
    }
}

export { SceneNode };