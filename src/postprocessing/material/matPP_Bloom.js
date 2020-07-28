//PostProcessing: bloom
import { MatPP_Base } from "./matPP_Base";
import { Material } from "../../material/material";
import { VertexSemantic } from "../../core/vertexFormat";
import { LightMode } from "../../material/renderPass";

// vs: extract bright
let vs_extractBright = `
attribute vec2 a_Position;
attribute vec2 a_Texcoord;
varying vec2 v_texcoord;

void main(){
    gl_Position = vec4(a_Position, 0.0, 1.0);
    v_texcoord = a_Texcoord;
}
`;

// fs: extract bright
let fs_extractBright = `
#ifdef GL_ES
precision mediump float;
#endif
uniform sampler2D u_texMain;
uniform float u_brightThreshold;
varying vec2 v_texcoord;

float luminance(vec4 color){
    return dot(color.rgb, vec3(0.2125, 0.7154, 0.0721));
}

void main(){    
    vec4 c = texture2D(u_texMain, v_texcoord);
    float brightness = luminance(c);
    float factor = clamp(brightness - u_brightThreshold, 0.0, 1.0);
    gl_FragColor = c * factor;
}
`

// vs: 竖直方向模糊
let vs_verticalBlur = `
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
let vs_horizontalBlur = `
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

let fs_blur = `
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

// vs: bloom
let vs_bloom = `
attribute vec2 a_Position;
attribute vec2 a_Texcoord;
varying vec4 v_uv;

void main(){
    gl_Position = vec4(a_Position, 0.0, 1.0);
    v_uv.xy = a_Texcoord;
    v_uv.zw = a_Texcoord;
}
`;

// fs: bloom
let fs_bloom = `
#ifdef GL_ES
precision mediump float;
#endif
uniform sampler2D u_texMain;
uniform sampler2D u_texBloom;
varying vec4 v_uv;

void main(){    
    vec4 c = texture2D(u_texMain, v_uv.xy);
    vec4 bloom = texture2D(u_texBloom, v_uv.zw);
    gl_FragColor = c + bloom;
}
`

class MatPP_Bloom extends MatPP_Base{
    constructor(){ 
        super(fs_extractBright, vs_extractBright); // pass0 create in super constructor
        
        this._shaderPass1 = Material.createShader(vs_verticalBlur, fs_blur, [
            {'semantic':VertexSemantic.POSITION, 'name':'a_Position'},
            {'semantic':VertexSemantic.UV0 , 'name':'a_Texcoord'}
        ]); 
        this.addRenderPass(this._shaderPass1, LightMode.None);  
        
        this._shaderPass2 = Material.createShader(vs_horizontalBlur, fs_blur, [
            {'semantic':VertexSemantic.POSITION, 'name':'a_Position'},
            {'semantic':VertexSemantic.UV0 , 'name':'a_Texcoord'}
        ]); 
        this.addRenderPass(this._shaderPass2, LightMode.None);  

        this._shaderPass3 = Material.createShader(vs_bloom, fs_bloom, [
            {'semantic':VertexSemantic.POSITION, 'name':'a_Position'},
            {'semantic':VertexSemantic.UV0 , 'name':'a_Texcoord'}
        ]); 
        this.addRenderPass(this._shaderPass3, LightMode.None);  

        //default uniforms
        this._brightThreshold = 0.5;
        this.texelSize = [1.0/512.0, 1.0/512.0];
        this._blurSize = 1.0;
        this._bloomTexture = null;
        
    }

    //Override
    setCustomUniformValues(pass){                           
        super.setCustomUniformValues(pass);
        pass.shader.setUniformSafe('u_brightThreshold', this._brightThreshold);
        pass.shader.setUniformSafe('u_texelSize', this.texelSize);
        pass.shader.setUniformSafe('u_blurSize', this._blurSize);

        if(pass.index === 3 && this._bloomTexture){     
            this._bloomTexture.bind(1);
            pass.shader.setUniformSafe('u_texBloom', 1);
        }
    }

    set brightThreshold(v){
        this._brightThreshold = v;
    }

    set blurSize(v){
        this._blurSize = v;
    }
    
    set bloomTexture(v){
        this._bloomTexture = v;
    }
    
}


export { MatPP_Bloom };