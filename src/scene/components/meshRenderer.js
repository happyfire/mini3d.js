import { SystemUniforms } from "../../material/material";
import { Component } from "./component";
import { Matrix4 } from "../../math/matrix4";
import { LightType } from "./light";
import { gl } from "../../core/gl";


class MeshRenderer extends Component{
    constructor(){
        super();

        this.mesh = null;
        this.material = null;

        this._mvpMatrix = new Matrix4();
        this._normalMatrix = new Matrix4();
        this._objectToWorld = new Matrix4();
        this._worldToObject = new Matrix4();
    }

    setMaterial(material){
        this.material = material;
    }

    setMesh(mesh){
        this.mesh = mesh;
    }

    render(camera, lights){

        let systemUniforms = this.material.systemUniforms;
        let uniformContext = {};

        for(let sysu of systemUniforms){
            switch(sysu){
                case SystemUniforms.MvpMatrix:{
                    this._mvpMatrix.set(camera.getViewProjMatrix());
                    this._mvpMatrix.multiply(this.node.worldMatrix);
                    uniformContext[SystemUniforms.MvpMatrix] = this._mvpMatrix.elements;
                    break;
                }
                case SystemUniforms.NormalMatrix:{
                    this._normalMatrix.setInverseOf(this.node.worldMatrix);
                    this._normalMatrix.transpose();  
                    uniformContext[SystemUniforms.NormalMatrix] = this._normalMatrix.elements;
                    break;
                }
                case SystemUniforms.Object2World:{
                    this._objectToWorld.set(this.node.worldMatrix);
                    uniformContext[SystemUniforms.Object2World] = this._objectToWorld.elements;
                    break;
                }
                case SystemUniforms.World2Object:{
                    this._worldToObject.setInverseOf(this.node.worldMatrix);
                    uniformContext[SystemUniforms.World2Object] = this._worldToObject.elements;
                    break;
                }
                case SystemUniforms.WorldCameraPos:{
                    let pos = camera.node.worldPosition;
                    uniformContext[SystemUniforms.WorldCameraPos] = [pos.x, pos.y, pos.z];
                    break;
                }
                case SystemUniforms.SceneAmbient:{
                    uniformContext[SystemUniforms.SceneAmbient] = [0.1,0.1,0.1];//TODO:get from scene
                    break;
                }

            }
        }
       
        if(this.material.useLight){
            let idx = 0;
            for(let light of lights){                
                if(light.type == LightType.Directional){
                    uniformContext[SystemUniforms.WorldLightPos] = [5.0, 5.0, 5.0, 0.0]; //TODO:平行光的方向根据z轴朝向计算
                } else {
                    let pos =  light.node.worldPosition;
                    uniformContext[SystemUniforms.WorldLightPos] = [pos.x, pos.y, pos.z, 1.0];//TODO:点光源在shader中如何处理？
                }
                
                uniformContext[SystemUniforms.LightColor] = light.color;

                if(idx>0){
                    //TODO:临时解决方案，为了能让多个灯光pass混合
                    gl.enable(gl.BLEND);
                    gl.blendFunc(gl.ONE, gl.ONE);
                    gl.enable(gl.POLYGON_OFFSET_FILL);
                    gl.polygonOffset(0.0, -1.0*idx);
                }

                this.material.render(this.mesh, uniformContext);                

                idx++;
            }

            gl.disable(gl.BLEND);
            gl.disable(gl.POLYGON_OFFSET_FILL);

        } else {
            this.material.render(this.mesh, uniformContext);
        }

        
        
    }

}

export { MeshRenderer };