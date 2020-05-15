//镜子材质
import { Material, SystemUniforms } from "./material";
import { VertexSemantic } from "../core/vertexFormat";
import { LightMode } from "./renderPass";

let vs = `
attribute vec4 a_Position;
attribute vec2 a_Texcoord;
uniform mat4 u_mvpMatrix;
varying vec2 v_texcoord;
void main(){
    gl_Position = u_mvpMatrix * a_Position;
    v_texcoord = a_Texcoord.xy;
    v_texcoord.x = 1.0 - v_texcoord.x;
    v_texcoord.y = 1.0 - v_texcoord.y;
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

let g_shader = null;

class MatMirror extends Material{
    constructor(){
        super();
        
        if(g_shader==null){
            g_shader = Material.createShader(vs, fs, [
                {'semantic':VertexSemantic.POSITION, 'name':'a_Position'},
                {'semantic':VertexSemantic.UV0 , 'name':'a_Texcoord'}
            ]);
        }     

        this.addRenderPass(g_shader, LightMode.None);              

        //default uniforms
        this._mainTexture = null;
    }

    //Override
    get systemUniforms(){
        return [SystemUniforms.MvpMatrix]; 
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

export { MatMirror };