//PostProcessing base material
import { Material } from "../../material/material";
import { VertexSemantic } from "../../core/vertexFormat";
import { LightMode } from "../../material/renderPass";

let vs = `
attribute vec2 a_Position;
attribute vec2 a_Texcoord;
varying vec2 v_texcoord;
void main(){
    gl_Position = vec4(a_Position, 0.0, 1.0);
    v_texcoord = a_Texcoord;
}
`;

let fs = `
#ifdef GL_ES
precision mediump float;
#endif
uniform sampler2D u_texMain;
varying vec2 v_texcoord;
void main(){    
    gl_FragColor = texture2D(u_texMain, v_texcoord);
}
`;

class MatPP_Base extends Material{
    constructor(fshader, vshader){
        super();

        fshader = fshader || fs;
        vshader = vshader || vs;
        
        //TODO:使用shader manager管理返回对应一对vs/fs唯一的shader
        this._shader = Material.createShader(vshader, fshader, [
                {'semantic':VertexSemantic.POSITION, 'name':'a_Position'},
                {'semantic':VertexSemantic.UV0 , 'name':'a_Texcoord'}
            ]);   

        this.addRenderPass(this._shader, LightMode.None);              

        //default uniforms
        this._mainTexture = null;
    }

    //Override
    get systemUniforms(){
        return []; 
    }

    //Override
    setCustomUniformValues(pass){                           
        if(this._mainTexture){     
            this._mainTexture.bind();
            pass.shader.setUniformSafe('u_texMain', 0);
        }
    }

    set mainTexture(v){
        this._mainTexture = v;
    }

    get mainTexture(){
        return this._mainTexture;
    }

}

export { MatPP_Base };