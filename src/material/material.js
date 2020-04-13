import { RenderPass } from "./renderPass";
import { Shader } from "../core/shader";

let SystemUniforms = {
    MvpMatrix: 'u_mvpMatrix',
    NormalMatrix: 'u_NormalMatrix',
}

class Material{
    constructor(){          
        this.renderPasses = [];
        this.matrixMvp = true;
        this.matrixNormal = false;
    }

    addRenderPass(shader){
        let pass = new RenderPass();
        pass.shader = shader;
        pass.index = this.renderPasses.length;
        this.renderPasses.push(pass);
        return pass;
    }

    //Override
    get systemUniforms(){
        return [SystemUniforms.MvpMatrix];
    }
        
    //自动设置system uniforms (根据systemUniforms的返回值)
    setSysUniformValues(pass, context){
        let systemUniforms = this.systemUniforms;
        for(let sysu of systemUniforms){ 
            pass.shader.setUniform(sysu, context[sysu]);
        }                
    }

    //Override
    //材质子类中手动设置uniform，需要重载
    setCustomUniformValues(pass){

    }

    render(mesh, context){
        for(let pass of this.renderPasses){            
            pass.shader.use();
            this.setSysUniformValues(pass, context);
            this.setCustomUniformValues(pass);
            mesh.render(pass.shader);
        }
    }

    static createShader(vs, fs, attributesMap){
        let shader = new Shader();
        if (!shader.create(vs, fs)) {
            console.log("Failed to initialize shaders");
            //TODO: set to a default shader
            return null;
        }
        shader.setAttributesMap(attributesMap);
        return shader;
    }


}

export { SystemUniforms, Material };