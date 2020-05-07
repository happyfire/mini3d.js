import { Material, SystemUniforms } from "./material";
import { VertexSemantic } from "../core/vertexFormat";

let vs = `
attribute vec4 a_Position;
attribute vec3 a_Normal;
attribute vec2 a_Texcoord;
    
uniform mat4 u_mvpMatrix;
uniform mat4 u_world2Object;
uniform mat4 u_object2World;

uniform vec3 u_worldCameraPos; // world space camera position
uniform vec3 u_LightColor; // Light color
uniform vec4 u_worldLightPos;   // World space light direction or position, if w==0 the light is directional

uniform vec3 u_ambient; // scene ambient
uniform vec3 u_diffuse; // diffuse color
uniform vec3 u_specular; // specular;
uniform float u_gloss; //gloss

varying vec3 v_color;
varying vec2 v_texcoord;

void main(){
    gl_Position = u_mvpMatrix * a_Position;   
    
    vec4 worldPos = u_object2World*a_Position;
    
    vec3 worldNormal = normalize(a_Normal * mat3(u_world2Object));
    vec3 worldLightDir;
    float atten = 1.0;

    vec3 ambient = vec3(0.0);

    if(u_worldLightPos.w==1.0){ //点光源
        vec3 lightver = u_worldLightPos.xyz-worldPos.xyz;
        float dis = length(lightver);
        worldLightDir = normalize(lightver);
        vec3 a = vec3(0.01);
        atten = 1.0/(a.x + a.y*dis + a.z*dis*dis);
    } else {
        worldLightDir = normalize(u_worldLightPos.xyz);
        ambient = u_ambient; //只有平行光加ambient,TODO:还是得把pass拆开
    }
    
    vec3 diffuse = u_diffuse * u_LightColor * max(0.0, dot(worldLightDir, worldNormal));
    
    vec3 reflectDir = normalize(reflect(-worldLightDir, worldNormal));
    vec3 viewDir = normalize(u_worldCameraPos - worldPos.xyz);
    vec3 specular = u_specular * u_LightColor * pow(max(0.0, dot(reflectDir,viewDir)), u_gloss);

    v_color = ambient + (diffuse + specular)*atten;    
    v_texcoord = a_Texcoord;
}

`;

let fs = `
#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_texMain;

varying vec3 v_color;
varying vec2 v_texcoord;

void main(){
    vec4 tex = texture2D(u_texMain, v_texcoord);
    gl_FragColor = tex * vec4(v_color,1.0);
}

`;

let g_shader = null;

class MatBasicLight extends Material{
    constructor(){
        super();

        this.useLight = true;
        
        if(g_shader==null){
            g_shader = Material.createShader(vs, fs, [
                {'semantic':VertexSemantic.POSITION, 'name':'a_Position'},
                {'semantic':VertexSemantic.NORMAL , 'name':'a_Normal'},
                {'semantic':VertexSemantic.UV0 , 'name':'a_Texcoord'}
            ]);
        }
        

        this.addRenderPass(g_shader);                

        //default uniforms
        this._mainTexture = null; //TODO: 系统提供默认纹理（如白色，黑白格）
        this._diffuse = [1.0, 1.0, 1.0];
        this._specular = [1.0, 1.0, 1.0];
        this._gloss = 20;    
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
        pass.shader.setUniform('u_diffuse', this._diffuse);
        pass.shader.setUniform('u_specular', this._specular);
        pass.shader.setUniform('u_gloss', this._gloss);
        this._mainTexture.bind();
        pass.shader.setUniform('u_texMain', 0);
    }

    set diffuse(v){
        this._diffuse = v;
    }

    set specular(v){
        this._specular = v;
    }

    set gloss(v){
        this._gloss = v;
    }

    set mainTexture(v){
        this._mainTexture = v;
    }
}

export { MatBasicLight };