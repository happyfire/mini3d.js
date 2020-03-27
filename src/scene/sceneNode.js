import { Vector3 } from "../math/vector3";
import { Quaternion } from "../math/quaternion";
import { Matrix4 } from "../math/matrix4";
import { math } from "../math/math";
import { SystemComponents } from "./systemComps";

let _tempVec3 = new Vector3();
let _tempQuat = new Quaternion();
let _tempMat4 = new Matrix4();

class SceneNode {
    constructor(){
        this._isStatic = false;
        this.localPosition = new Vector3();
        this.localRotation = new Quaternion();
        this.localScale = new Vector3(1,1,1);

        this._worldPosition = new Vector3();
        this._worldRotation = new Quaternion();

        this.localMatrix = new Matrix4();
        this.worldMatrix = new Matrix4();

        this.parent = null;
        this.children = [];

        this.components = {};
    }

    isStatic(){
        return this._isStatic;
    }
    
    setStatic(isStatic){
        this._isStatic = isStatic;
    }

    get position(){
        if(this.parent==null || this.parent.parent==null){
            return this.localPosition;
        } else {
            //TODO
        }        
    }

    set position(v){
        if(this.parent==null || this.parent.parent==null){
            this.localPosition.copyFrom(v);
        } else {
            //TODO
        }
    }

    get rotation(){
        if(this.parent==null || this.parent.parent==null){
            return this.localRotation;
        } else {
            //TODO
        } 
    }

    setWorldRotation(v){
        if(this.parent==null || this.parent.parent==null){
            this.localRotation.copyFrom(v);
        } else {
            //TODO
        }
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

    lookAt(target, up, smoothFactor){
        up = up || Vector3.Up;
        let worldPos = this.position;
        if(Math.abs(worldPos.x-target.x)<math.ZeroEpsilon 
            && Math.abs(worldPos.y-target.y)<math.ZeroEpsilon 
            && Math.abs(worldPos.z-target.z)<math.ZeroEpsilon){
                return;
        }

        if(this.getComponent(SystemComponents.Camera)){
            _tempQuat.setLookRotation(target, worldPos, up);//因为对于OpenGL的camera来说，LookAt是让局部的-z轴指向target，因此这儿对调一下。
        } else {
            _tempQuat.setLookRotation(worldPos, target, up);
        }

        if(smoothFactor != null){
            this.setWorldRotation( Quaternion.slerp(this.rotation, _tempQuat, smoothFactor) );
        } else {
            this.setWorldRotation(_tempQuat);
        }
                       
        
    }

    updateLocalMatrix(){        
        this.localMatrix.setTranslate(this.localPosition.x, this.localPosition.y, this.localPosition.z);           
        Quaternion.toMatrix4(this.localRotation, _tempMat4);
        this.localMatrix.multiply(_tempMat4);        
        this.localMatrix.scale(this.localScale.x, this.localScale.y, this.localScale.z);   
        
        //TODO:此处可优化，避免矩阵乘法，Matrix4增加fromTRS(pos, rot, scale)方法
    }

    updateWorldMatrix(parentWorldMatrix){
        if(!this._isStatic){
            this.updateLocalMatrix();
        }
        

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