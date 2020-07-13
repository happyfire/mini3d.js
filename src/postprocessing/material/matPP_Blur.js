//PostProcessing: gaussian blur
import { MatPP_Base } from "./matPP_Base";
import { Material } from "../../material/material";
import { VertexSemantic } from "../../core/vertexFormat";
import { LightMode } from "../../material/renderPass";

// vs: 竖直方向模糊
let vs_vertical = `
attribute vec2 a_Position;
attribute vec2 a_Texcoord;
uniform vec2 u_texelSize;
uniform float u_blurSize;
varying vec2 v_uvs[5];

void main(){
    gl_Position = vec4(a_Position, 0.0, 1.0);
    vec2 uv = a_Texcoord;

    v_uvs[0] = uv;
    v_uvs[1] = uv + vec2(0.0, u_texelSize.y) * u_blurSize;
    v_uvs[2] = uv - vec2(0.0, u_texelSize.y) * u_blurSize;
    v_uvs[3] = uv + vec2(0.0, u_texelSize.y * 2.0) * u_blurSize;
    v_uvs[4] = uv - vec2(0.0, u_texelSize.y * 2.0) * u_blurSize;
}
`;

// vs: 水平方向模糊
let vs_horizontal = `
attribute vec2 a_Position;
attribute vec2 a_Texcoord;
uniform vec2 u_texelSize;
uniform float u_blurSize;
varying vec2 v_uvs[5];

void main(){
    gl_Position = vec4(a_Position, 0.0, 1.0);
    vec2 uv = a_Texcoord;

    v_uvs[0] = uv;
    v_uvs[1] = uv + vec2(u_texelSize.x, 0.0) * u_blurSize;
    v_uvs[2] = uv - vec2(u_texelSize.x, 0.0) * u_blurSize;
    v_uvs[3] = uv + vec2(u_texelSize.x * 2.0, 0.0) * u_blurSize;
    v_uvs[4] = uv - vec2(u_texelSize.x * 2.0, 0.0) * u_blurSize;
}
`;

let fs = `
#ifdef GL_ES
precision mediump float;
#endif
uniform sampler2D u_texMain;

varying vec2 v_uvs[5];

void main(){  
    float weights[3];
    weights[0] = 0.4026;
    weights[1] = 0.2442;
    weights[2] = 0.0545;
    
    vec3 sum = texture2D(u_texMain, v_uvs[0]).rgb * weights[0];
    for(int i=1; i<3; i++){
        sum += texture2D(u_texMain, v_uvs[i*2-1]).rgb * weights[i];
        sum += texture2D(u_texMain, v_uvs[i*2]).rgb * weights[i];
    }
    
    gl_FragColor = vec4(sum, 1.0);
}
`;

class MatPP_Blur extends MatPP_Base{
    constructor(){ 
        super(fs, vs_vertical); // pass0 create in super constructor
        
        this._shaderPass1 = Material.createShader(vs_horizontal, fs, [
            {'semantic':VertexSemantic.POSITION, 'name':'a_Position'},
            {'semantic':VertexSemantic.UV0 , 'name':'a_Texcoord'}
        ]); 
        this.addRenderPass(this._shaderPass1, LightMode.None);              

        //default uniforms
        this.texelSize = [1.0/512.0, 1.0/512.0];
        this._blurSize = 1.0;
        
    }

    //Override
    setCustomUniformValues(pass){                           
        super.setCustomUniformValues(pass);
        pass.shader.setUniformSafe('u_texelSize', this.texelSize);
        pass.shader.setUniformSafe('u_blurSize', this._blurSize);
    }

    set blurSize(v){
        this._blurSize = v;
    }
}

export { MatPP_Blur };