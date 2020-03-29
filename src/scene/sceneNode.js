import { Vector3 } from "../math/vector3";
import { Quaternion } from "../math/quaternion";
import { Matrix4 } from "../math/matrix4";
import { math } from "../math/math";
import { SystemComponents } from "./systemComps";

let _tempVec3 = new Vector3();
let _tempQuat = new Quaternion();
let _tempQuat2 = new Quaternion();
let _tempMat4 = new Matrix4();

class SceneNode {
    constructor(){
        this._isStatic = false;
        this._localPosition = new Vector3();
        this._localRotation = new Quaternion();
        this._localScale = new Vector3(1,1,1);

        this._worldPosition = new Vector3();
        this._worldRotation = new Quaternion();

        this.localMatrix = new Matrix4();
        this.worldMatrix = new Matrix4();

        this.parent = null;
        this.children = [];

        this.components = {};

        this._worldDirty = true;
    }

    isStatic(){
        return this._isStatic;
    }
    
    setStatic(isStatic){
        this._isStatic = isStatic;
    }

    setTransformDirty(){
        this._worldDirty = true;
    }

    //注意：所有 local 的 getter 方法，调用会直接获取相应的local成员，如果直接修改这些成员，需要调用 setTransformDirty() 通知Node更新世界矩阵
    //建议如果要修改local属性，调用 setter方法

    get localPosition(){
        return this._localPosition;
    }

    set localPosition(v){
        this._localPosition.copyFrom(v);
        this.setTransformDirty();
    }

    get localRotation(){
        return this._localRotation;
    }

    set localRotation(v){
        this._localRotation.copyFrom(v);
        this.setTransformDirty();
    }

    get localScale(){
        return this._localScale;
    }

    set localScale(v){
        this._localScale.copyFrom(v);
        this.setTransformDirty();
    }



    //注意：所有的world属性，如果要修改必须调用setter
    //调用getter只能用来获取值，在getter的结果上修改是错误的 （可惜js没有const&)

    get worldPosition(){        
        if(this._worldDirty){
            this.updateWorldMatrix();
        }

        return this._worldPosition;
    }

    set worldPosition(v){
        if(this.parent==null || this.parent.parent==null){
            this.localPosition = v;
        } else {            
            _tempMat4.setInverseOf(this.parent.worldMatrix);//TODO:缓存逆矩阵?
            Matrix4.transformPoint(_tempMat4, v, _tempVec3);
            this.localPosition = _tempVec3;
        }        
    }

    get worldRotation(){
        if(this._worldDirty){
            this.updateWorldMatrix();
        }        

        return this._worldRotation;
    }

    set worldRotation(v){
        if(this.parent==null || this.parent.parent==null){
            this.localRotation = v;
        } else {            
            _tempQuat.setInverseOf(this.parent.worldRotation);
            Quaternion.multiply(_tempQuat, v, _tempQuat2);
            this.localRotation = _tempQuat2;
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
        let worldPos = this.worldPosition;
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
            this.worldRotation = Quaternion.slerp(this.worldRotation, _tempQuat, smoothFactor);
        } else {
            this.worldRotation = _tempQuat;
        }
                       
        
    }

    updateLocalMatrix(){        
        this.localMatrix.setTranslate(this._localPosition.x, this._localPosition.y, this._localPosition.z);           
        Quaternion.toMatrix4(this._localRotation, _tempMat4);
        this.localMatrix.multiply(_tempMat4);        
        this.localMatrix.scale(this._localScale.x, this._localScale.y, this._localScale.z);   
        
        //TODO:此处可优化，避免矩阵乘法，Matrix4增加fromTRS(pos, rot, scale)方法
    }

    updateWorldMatrix(){        
        if(this._worldDirty){
            if(!this._isStatic){
                this.updateLocalMatrix();
            }
    
            if(this.parent==null){
                this.worldMatrix.set(this.localMatrix);
            } else {
                Matrix4.multiply(this.parent.worldMatrix, this.localMatrix, this.worldMatrix);
            }
    
            //从world matrix中提取出worldPosition
            let worldMat = this.worldMatrix.elements;
            this._worldPosition.set(worldMat[12], worldMat[13], worldMat[14]);
    
            //独立计算rotation, 而不是从矩阵中解出，防止矩阵蠕动带来的错误数据
            if(this.parent==null){
                this._worldRotation.copyFrom(this._localRotation);
            } else {
                Quaternion.multiply(this.parent._worldRotation, this._localRotation, this._worldRotation);
            }

            this._worldDirty = false;
        }

        
        this.children.forEach(function(child){
            child.updateWorldMatrix();
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