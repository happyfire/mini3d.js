import { RenderPass } from "./renderPass";

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

    //Override
    get systemUniforms(){
        return [SystemUniforms.MvpMatrix];
    }

    addRenderPass(vs, fs){
        let pass = new RenderPass();
        pass.create(vs, fs);
        pass.index = this.renderPasses.length;
        this.renderPasses.push(pass);
        return pass;
    }

    //Override
    //如果是单Pass，且uniform的名字使用系统预定义的，则可以直接使用该方法，否则需要重载
    //如果是多Pass，一般都需要重载，根据pass的idx来给不同的pass设置不同的uniform value
    setSysUniformValues(pass, context){
        let systemUniforms = this.systemUniforms;
        for(let sysu of systemUniforms){ 
            pass.shader.setUniform(sysu, context[sysu]);
        }                
    }

    render(mesh, context){
        for(let pass of this.renderPasses){            
            pass.shader.use();
            this.setSysUniformValues(pass, context);
            mesh.render(pass.shader);
        }
    }


}

export { SystemUniforms, Material };