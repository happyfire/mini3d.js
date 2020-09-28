import { Material, SystemUniforms } from "./material";
import { VertexSemantic } from "../core/vertexFormat";
import { textureManager } from "../core/textureManager";

let vs = `
attribute vec4 a_Position;

uniform mat4 u_mvpMatrix;
uniform mat4 u_projectorMatrix;

varying vec4 v_projTexCoord;

void main(){
    gl_Position = u_mvpMatrix * a_Position;
    v_projTexCoord = u_projectorMatrix * a_Position;
}

`;

let fs = `
#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_texProj;
varying vec4 v_projTexCoord;

void main(){
    vec4 projTexColor = vec4(0.0);
    if(v_projTexCoord.z > 0.0){
        projTexColor = texture2DProj(u_texProj, v_projTexCoord);
    }
    gl_FragColor = projTexColor * 0.5;
}

`;

let g_shader = null;

class MatProjector extends Material{
    constructor(){
        super();

        if(g_shader==null){
            g_shader = Material.createShader(vs, this.getFS(), [
                {'semantic':VertexSemantic.POSITION, 'name':'a_Position'}               
            ]);
        }

        this.addRenderPass(g_shader);

        //default uniforms
        this._projMatrix = null;
        this._projTexture = textureManager.getDefaultTexture();
    }

    getFS(){
        let fs_common = "";
        // if(sysConfig.gammaCorrection){
        //     fs_common += "#define GAMMA_CORRECTION\n";
        // }
        fs_common += fs;
        return fs_common;
    }

    //Override
    get systemUniforms(){
        return [SystemUniforms.MvpMatrix]; 
    }

    //Override
    setCustomUniformValues(pass){
        
        pass.shader.setUniformSafe('u_projectorMatrix', this._projMatrix);
            
        if(this._projTexture){
            this._projTexture.bind();
            pass.shader.setUniformSafe('u_texProj', 0);
        } 
    }

    set projTexture(v){
        this._projTexture = v;
        this._projTexture.setClamp();
    }

    get projTexture(){
        return this._projTexture;
    }

    set projMatrix(v){
        this._projMatrix = v;
    }

}

export { MatProjector };