//逐像素光照+法线贴图材质 （切线空间计算光照）

import { Material, SystemUniforms } from "./material";
import { VertexSemantic } from "../core/vertexFormat";
import { LightMode } from "./renderPass";
import { textureManager } from "../core/textureManager";
import { sysConfig } from "../core/gl";

let vs = `
attribute vec4 a_Position;
attribute vec3 a_Normal;
attribute vec4 a_Tangent;
attribute vec2 a_Texcoord;
    
uniform mat4 u_mvpMatrix;
uniform mat4 u_object2World;
uniform mat4 u_world2Object;
uniform vec4 u_texMain_ST; // Main texture tiling and offset
uniform vec4 u_normalMap_ST; // Normal map tiling and offset
uniform vec3 u_worldCameraPos; // world space camera position
uniform vec4 u_worldLightPos;   // World space light direction or position, if w==0 the light is directional

varying vec3 v_tangentLightDir; // tangent space light dir
varying vec3 v_tangentViewDir; // tangent space view dir
varying vec4 v_texcoord;
varying float v_atten;

void main(){
    gl_Position = u_mvpMatrix * a_Position;   
    v_texcoord.xy = a_Texcoord.xy * u_texMain_ST.xy + u_texMain_ST.zw;
    v_texcoord.zw = a_Texcoord.xy * u_normalMap_ST.xy + u_normalMap_ST.zw;

    vec3 worldNormal = normalize(a_Normal * mat3(u_world2Object));
    vec3 worldTangent = normalize(u_object2World*a_Tangent).xyz;
    vec3 worldBinormal = cross(worldNormal, worldTangent) * a_Tangent.w;

    //将TBN向量按行放入矩阵，构造出worldToTangent矩阵
    //注意glsl中mat3是列主的
    mat3 worldToTangent = mat3(worldTangent.x, worldBinormal.x, worldNormal.x,
                               worldTangent.y, worldBinormal.y, worldNormal.y, 
                               worldTangent.z, worldBinormal.z, worldNormal.z);

    vec4 worldPos = u_object2World*a_Position;
    vec3 worldViewDir = normalize(u_worldCameraPos - worldPos.xyz);
    v_tangentViewDir = worldToTangent * worldViewDir;

    vec3 worldLightDir;
    v_atten = 1.0;
    if(u_worldLightPos.w==1.0){ //点光源
        vec3 lightver = u_worldLightPos.xyz - worldPos.xyz;
        float dis = length(lightver);
        worldLightDir = normalize(lightver);
        vec3 a = vec3(0.01);
        v_atten = 1.0/(a.x + a.y*dis + a.z*dis*dis);
    } else {
        worldLightDir = normalize(u_worldLightPos.xyz);
    }
    v_tangentLightDir = worldToTangent * worldLightDir;
}
`;

let fs = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec3 u_LightColor; // Light color

uniform sampler2D u_texMain;
uniform sampler2D u_normalMap;

uniform vec3 u_colorTint;
#ifdef USE_AMBIENT
uniform vec3 u_ambient; // scene ambient
#endif
uniform vec3 u_specular; // specular
uniform float u_gloss; //gloss

varying vec3 v_tangentLightDir; // tangent space light dir
varying vec3 v_tangentViewDir; // tangent space view dir
varying vec4 v_texcoord;
varying float v_atten;

void main(){        
    vec3 tangentLightDir = normalize(v_tangentLightDir);
    vec3 tangentViewDir = normalize(v_tangentViewDir);

#ifdef PACK_NORMAL_MAP
    vec4 packedNormal = texture2D(u_normalMap, v_texcoord.zw);
    vec3 tangentNormal;
    tangentNormal.xy = packedNormal.xy * 2.0 - 1.0;
    tangentNormal.z = sqrt(1.0 - clamp(dot(tangentNormal.xy, tangentNormal.xy), 0.0, 1.0));
#else
    vec3 tangentNormal = texture2D(u_normalMap, v_texcoord.zw).xyz * 2.0 - 1.0;
#endif
    
    vec3 albedo = texture2D(u_texMain, v_texcoord.xy).rgb;
#ifdef GAMMA_CORRECTION
    albedo = pow(albedo, vec3(2.2));
#endif
    albedo = albedo * u_colorTint;

    vec3 diffuse = u_LightColor * albedo * max(0.0, dot(tangentNormal, tangentLightDir));

#ifdef LIGHT_MODEL_PHONG
    vec3 reflectDir = normalize(reflect(-tangentLightDir, tangentNormal));
    vec3 specular = u_LightColor * u_specular * pow(max(0.0, dot(reflectDir,tangentViewDir)), u_gloss);
#else
    vec3 halfDir = normalize(tangentLightDir + tangentViewDir);
    vec3 specular = u_LightColor * u_specular * pow(max(0.0, dot(tangentNormal,halfDir)), u_gloss);
#endif    

#ifdef USE_AMBIENT
    vec3 ambient = u_ambient * albedo;
    gl_FragColor = vec4(ambient + (diffuse + specular) * v_atten, 1.0);
#else
    gl_FragColor = vec4((diffuse + specular) * v_atten, 1.0);
#endif

#ifdef GAMMA_CORRECTION
    gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0/2.2));
#endif
}
`;


let g_shaderForwardBase = null;
let g_shaderForwardAdd = null;

class MatNormalMap extends Material{
    constructor(){
        super();
        
        if(g_shaderForwardBase==null){
            g_shaderForwardBase = Material.createShader(this.getVS_forwardbase(), this.getFS_forwardbase(), [
                {'semantic':VertexSemantic.POSITION, 'name':'a_Position'},
                {'semantic':VertexSemantic.NORMAL , 'name':'a_Normal'},
                {'semantic':VertexSemantic.TANGENT , 'name':'a_Tangent'},
                {'semantic':VertexSemantic.UV0 , 'name':'a_Texcoord'}
            ]);
        }
        if(g_shaderForwardAdd==null){
            g_shaderForwardAdd = Material.createShader(this.getVS_forwardadd(), this.getFS_forwardadd(), [
                {'semantic':VertexSemantic.POSITION, 'name':'a_Position'},
                {'semantic':VertexSemantic.NORMAL , 'name':'a_Normal'},
                {'semantic':VertexSemantic.TANGENT , 'name':'a_Tangent'},
                {'semantic':VertexSemantic.UV0 , 'name':'a_Texcoord'}
            ]);
        }        

        this.addRenderPass(g_shaderForwardBase, LightMode.ForwardBase);  
        this.addRenderPass(g_shaderForwardAdd, LightMode.ForwardAdd);                

        //default uniforms
        this._mainTexture = textureManager.getDefaultTexture();
        this._mainTexture_ST = [1,1,0,0];
        this._normalMap = textureManager.getDefaultBumpTexture();
        this._normalMap_ST = [1,1,0,0];
        this._specular = [1.0, 1.0, 1.0];
        this._gloss = 20.0;  
        this._colorTint = [1.0, 1.0, 1.0];  
    }

    getVS_Common(){
        return vs;
    }

    getFS_Common(){
        let fs_common = "#define LIGHT_MODEL_PHONG\n";
        if(sysConfig.gammaCorrection){
            fs_common += "#define GAMMA_CORRECTION\n";
        }
        fs_common += fs;
        return fs_common;
    }

    getVS_forwardbase(){
        return this.getVS_Common();
    }

    getFS_forwardbase(){
        let fs_forwardbase = "#define USE_AMBIENT\n" + this.getFS_Common();
        return fs_forwardbase;
    }

    getVS_forwardadd(){
        return this.getVS_Common();
    }

    getFS_forwardadd(){
        // fs和forwardbase的区别只是fs里面没有加ambient
        return this.getFS_Common();
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
        pass.shader.setUniformSafe('u_normalMap_ST', this._normalMap_ST);     
        if(this._mainTexture){
            this._mainTexture.bind(0);
            pass.shader.setUniformSafe('u_texMain', 0);
        }  
        if(this._normalMap){
            this._normalMap.bind(1);
            pass.shader.setUniformSafe('u_normalMap', 1);
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

    set normalMap(v){
        this._normalMap = v;
    }

    get normalMap(){
        return this._normalMap;
    }

    set normalMapST(v){
        this._normalMap_ST = v;
    }


}

export { MatNormalMap };