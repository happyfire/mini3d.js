import { Material, SystemUniforms } from "./material";
import { VertexSemantic } from "../core/vertexFormat";
import { sysConfig } from "../core/gl";

let vs = `
attribute vec4 a_Position;

uniform mat4 u_mvpMatrix;

void main(){
    gl_Position = u_mvpMatrix * a_Position;
}

`;

let fs = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec3 u_Color;

void main(){
    gl_FragColor = vec4(u_Color, 1.0);

#ifdef GAMMA_CORRECTION
    gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0/2.2));
#endif
}

`;

let g_shader = null;

class MatSolidColor extends Material{
    constructor(color=null){
        super();

        if(g_shader==null){
            g_shader = Material.createShader(vs, this.getFS(), [
                {'semantic':VertexSemantic.POSITION, 'name':'a_Position'}               
            ]);
        }

        this.addRenderPass(g_shader);

        //default uniforms
        if(color){
            this.color = color;
        } else {
            this.color = [1.0, 1.0, 1.0];
        }
    }

    getFS(){
        let fs_common = "";
        if(sysConfig.gammaCorrection){
            fs_common += "#define GAMMA_CORRECTION\n";
        }
        fs_common += fs;
        return fs_common;
    }

    //Override
    get systemUniforms(){
        return [SystemUniforms.MvpMatrix]; 
    }

    //Override
    setCustomUniformValues(pass){
        pass.shader.setUniform('u_Color', this.color);
    }

    setColor(color){
        this.color = color;
    }


}

export { MatSolidColor };