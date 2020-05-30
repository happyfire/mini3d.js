//逐像素光照材质，支持 diffuse 贴图和color tint, 使用blinn-phong高光

import { Material, SystemUniforms } from "./material";
import { VertexSemantic } from "../core/vertexFormat";
import { LightMode } from "./renderPass";
import { textureManager } from "../core/textureManager";

//////////// forward base pass shader /////////////////////

let vs_forwardbase = `
attribute vec4 a_Position;
attribute vec3 a_Normal;
attribute vec2 a_Texcoord;
    
uniform mat4 u_mvpMatrix;
uniform mat4 u_object2World;
uniform mat4 u_world2Object;
uniform vec4 u_texMain_ST; // Main texture tiling and offset

varying vec4 v_worldPos;
varying vec3 v_worldNormal;
varying vec2 v_texcoord;

void main(){
    gl_Position = u_mvpMatrix * a_Position;   
    
    v_worldPos = u_object2World*a_Position;
    v_worldNormal = normalize(a_Normal * mat3(u_world2Object));
    v_texcoord = a_Texcoord.xy * u_texMain_ST.xy + u_texMain_ST.zw;            
}

`;

let fs = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec3 u_worldCameraPos; // world space camera position
uniform vec3 u_LightColor; // Light color
uniform vec4 u_worldLightPos;   // World space light direction or position, if w==0 the light is directional

uniform sampler2D u_texMain;
uniform vec3 u_colorTint;
#ifdef USE_AMBIENT
uniform vec3 u_ambient; // scene ambient
#endif
uniform vec3 u_specular; // specular
uniform float u_gloss; //gloss

varying vec4 v_worldPos;
varying vec3 v_worldNormal;
varying vec2 v_texcoord;


void main(){    
    vec3 worldLightDir;
    float atten = 1.0;    

    if(u_worldLightPos.w==1.0){ //点光源
        vec3 lightver = u_worldLightPos.xyz - v_worldPos.xyz;
        float dis = length(lightver);
        worldLightDir = normalize(lightver);
        vec3 a = vec3(0.01);
        atten = 1.0/(a.x + a.y*dis + a.z*dis*dis);
    } else {
        worldLightDir = normalize(u_worldLightPos.xyz);
    }

    vec3 albedo = texture2D(u_texMain, v_texcoord).rgb * u_colorTint;        
    vec3 diffuse = u_LightColor * albedo * max(0.0, dot(v_worldNormal, worldLightDir));
    
    vec3 viewDir = normalize(u_worldCameraPos - v_worldPos.xyz);
#ifdef LIGHT_MODEL_PHONG
    vec3 reflectDir = normalize(reflect(-worldLightDir, v_worldNormal));
    vec3 specular = u_specular * u_LightColor * pow(max(0.0, dot(reflectDir,viewDir)), u_gloss);
#else
    vec3 halfDir = normalize(worldLightDir + viewDir);
    vec3 specular = u_specular * u_LightColor * pow(max(0.0, dot(v_worldNormal,halfDir)), u_gloss); 
#endif

#ifdef USE_AMBIENT
    vec3 ambient = u_ambient * albedo;
    gl_FragColor = vec4(ambient + (diffuse + specular) * atten, 1.0);
#else
    gl_FragColor = vec4((diffuse + specular) * atten, 1.0);
#endif    
}
`;

let fs_forwardbase = "#define LIGHT_MODEL_PHONG\n #define USE_AMBIENT\n" + fs;

//////////// forward add pass shader /////////////////////

// vs和forward base相同
let vs_forwardadd = vs_forwardbase;

// fs和forwardbase的区别只是fs里面没有加ambient
let fs_forwardadd = "#define LIGHT_MODEL_PHONG\n" + fs;

let g_shaderForwardBase = null;
let g_shaderForwardAdd = null;

class MatPixelLight extends Material{
    constructor(){
        super();
        
        if(g_shaderForwardBase==null){
            g_shaderForwardBase = Material.createShader(vs_forwardbase, fs_forwardbase, [
                {'semantic':VertexSemantic.POSITION, 'name':'a_Position'},
                {'semantic':VertexSemantic.NORMAL , 'name':'a_Normal'},
                {'semantic':VertexSemantic.UV0 , 'name':'a_Texcoord'}
            ]);
        }
        if(g_shaderForwardAdd==null){
            g_shaderForwardAdd = Material.createShader(vs_forwardadd, fs_forwardadd, [
                {'semantic':VertexSemantic.POSITION, 'name':'a_Position'},
                {'semantic':VertexSemantic.NORMAL , 'name':'a_Normal'},
                {'semantic':VertexSemantic.UV0 , 'name':'a_Texcoord'}
            ]);
        }        

        this.addRenderPass(g_shaderForwardBase, LightMode.ForwardBase);  
        this.addRenderPass(g_shaderForwardAdd, LightMode.ForwardAdd);                

        //default uniforms
        this._mainTexture = textureManager.getDefaultTexture();
        this._mainTexture_ST = [1,1,0,0];
        this._specular = [1.0, 1.0, 1.0];
        this._gloss = 20.0;  
        this._colorTint = [1.0, 1.0, 1.0];  
    }

    //Override
    get systemUniforms(){
        return [SystemUniforms.MvpMatrix,
            SystemUniforms.World2Object,
            SystemUniforms.Object2World,
            SystemUniforms.WorldCameraPos,
            SystemUniforms.SceneAmbient,
            SystemUniforms.LightColor, SystemUniforms.WorldLightPos]; 
    }

    //Override
    setCustomUniformValues(pass){                           
        pass.shader.setUniformSafe('u_specular', this._specular);
        pass.shader.setUniformSafe('u_gloss', this._gloss);
        pass.shader.setUniformSafe('u_colorTint', this._colorTint);
        pass.shader.setUniformSafe('u_texMain_ST', this._mainTexture_ST);      
        if(this._mainTexture){
            this._mainTexture.bind();
            pass.shader.setUniformSafe('u_texMain', 0);
        }  
        
    }

    set specular(v){
        this._specular = v;
    }

    set gloss(v){
        this._gloss = v;
    }

    set colorTint(v){
        this._colorTint = v;
    }

    set mainTexture(v){
        this._mainTexture = v;
    }

    get mainTexture(){
        return this._mainTexture;
    }

    set mainTextureST(v){
        this._mainTexture_ST = v;
    }


}

export { MatPixelLight };