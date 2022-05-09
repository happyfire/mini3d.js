import { SystemUniforms } from "../../material/material";
import { Component } from "./component";
import { Matrix4 } from "../../math/matrix4";
import { LightType } from "./light";
import { gl } from "../../core/gl";
import { LightMode } from "../../material/renderPass";


class MeshRenderer extends Component{
    constructor(){
        super();

        this.mesh = null;
        this.material = null;
        this.castShadow = false;
        this.receiveShadow = false;

        this._mvpMatrix = new Matrix4();
        this._objectToWorld = new Matrix4();
        this._worldToObject = new Matrix4();
    }

    setMaterial(material){
        this.material = material;
    }

    setMesh(mesh){
        this.mesh = mesh;
    }

    render(scene, camera, mainLight, addlights, projectors){

        let systemUniforms = this.material.systemUniforms;
        let uniformContext = {};

        //TODO: PerObject uniforms 和 PerMaterial uniforms要分开，为以后batch set pass call做准备

        for(let sysu of systemUniforms){
            switch(sysu){
                case SystemUniforms.MvpMatrix:{
                    this._mvpMatrix.set(camera.getViewProjMatrix());
                    this._mvpMatrix.multiply(this.node.worldMatrix);
                    uniformContext[SystemUniforms.MvpMatrix] = this._mvpMatrix.elements;
                    break;
                }
                case SystemUniforms.Object2World:{
                    this._objectToWorld.set(this.node.worldMatrix);
                    uniformContext[SystemUniforms.Object2World] = this._objectToWorld.elements;
                    break;
                }
                case SystemUniforms.World2Object:{
                    this._worldToObject.setInverseOf(this.node.worldMatrix);//TODO: 此矩阵缓存到node
                    uniformContext[SystemUniforms.World2Object] = this._worldToObject.elements;
                    break;
                }
                case SystemUniforms.WorldCameraPos:{
                    let pos = camera.node.worldPosition;
                    uniformContext[SystemUniforms.WorldCameraPos] = [pos.x, pos.y, pos.z];
                    break;
                }
                case SystemUniforms.SceneAmbient:{
                    uniformContext[SystemUniforms.SceneAmbient] = scene.ambientColor;
                    break;
                }

            }
        }        


        //避免render to texture时渲染使用了该RT的材质，否则会出现错误 Feedback loop formed between Framebuffer and active Texture.
        //TODO:有RT的camera的渲染要独立出来先渲染。另外要实现camera stack
        if(camera.target!=null && camera.target.texture2D == this.material.mainTexture){
            return;
        }

        //逐pass渲染，对于 ForwardAdd pass 会渲染多次叠加效果
        for(let pass of this.material.renderPasses){            
            if(pass.lightMode == LightMode.ForwardBase && mainLight!=null){
                 //平行光的方向为Light结点的z轴朝向,但是shader里面用的光的方向是指向光源的，所以这里取反
                let lightForward = mainLight.node.forward.negative();
                uniformContext[SystemUniforms.WorldLightPos] = [lightForward.x, lightForward.y, lightForward.z, 0.0];
                uniformContext[SystemUniforms.LightColor] = mainLight.color;
                this.material.renderPass(this.mesh, uniformContext, pass);

            } else if(pass.lightMode == LightMode.ForwardAdd){
                let idx = 1;
                for(let light of addlights){
                    if(light.type == LightType.Directional){
                        let lightForward = mainLight.node.forward.negative();
                        uniformContext[SystemUniforms.WorldLightPos] = [lightForward.x, lightForward.y, lightForward.z, 0.0];                        
                    } else {
                        let pos =  light.node.worldPosition;
                        uniformContext[SystemUniforms.WorldLightPos] = [pos.x, pos.y, pos.z, 1.0];
                    }
                    
                    uniformContext[SystemUniforms.LightColor] = light.color;
                    
                    //让多个灯光pass混合
                    //状态设置为 blend one one; ztest lequal; zwrite off;
                    //TODO:全局状态管理（下同）
                    if(idx==1){
                        gl.enable(gl.BLEND);
                        gl.blendFunc(gl.ONE, gl.ONE);
                        gl.depthMask(false);
                        gl.depthFunc(gl.LEQUAL);
                    }
                            
                    this.material.renderPass(this.mesh, uniformContext, pass);              
                    idx++;
                }
                gl.disable(gl.BLEND);                
                gl.depthMask(true);   
                gl.depthFunc(gl.LESS);             

            } else if(pass.lightMode == LightMode.ShadowCaster){
                
            } else {
                //非光照pass
                this.material.renderPass(this.mesh, uniformContext, pass); 
            }
        }  
        
        //使用projector渲染投影材质
        if(projectors != null && projectors.length > 0){
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.ONE, gl.ONE);
            gl.depthMask(false);
            gl.depthFunc(gl.LEQUAL);
                    
            let matTmp = new Matrix4();
            
            for(let projector of projectors){
                projector.updateMatrix();
                let materialProj = projector.material;
                matTmp.set(projector.getProjectorMatrix());
                matTmp.multiply(this.node.worldMatrix);
                materialProj.projMatrix = matTmp.elements;
                materialProj.renderPass(this.mesh, uniformContext, materialProj.renderPasses[0]);
            }

            gl.disable(gl.BLEND);
            gl.depthMask(true);   
            gl.depthFunc(gl.LESS);         
        }
        
    }

}

export { MeshRenderer };