import { Material, SystemUniforms } from "./material";
import { VertexSemantic } from "../core/vertexFormat";

let vs = `
attribute vec4 a_Position;
attribute vec3 a_Normal;
    
uniform mat4 u_mvpMatrix;
uniform mat4 u_NormalMatrix;
uniform vec3 u_diffuseColor; // diffuse color
uniform vec3 u_LightColor; // Light color
uniform vec3 u_LightDir;   // World space light direction
varying vec4 v_Color;

void main(){
    gl_Position = u_mvpMatrix * a_Position;
    vec3 normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 0.0)));
    vec3 light = normalize(u_LightDir);
    float nDotL = max(dot(light, normal), 0.0);
    vec3 diffuse = u_diffuseColor * u_LightColor * nDotL;
    vec3 c = diffuse + vec3(0.1);
    v_Color = vec4(c, 1.0);
}

`;

let fs = `
#ifdef GL_ES
precision mediump float;
#endif

varying vec4 v_Color;

void main(){
    gl_FragColor = v_Color;
}

`;

class MatBasicLight extends Material{
    constructor(){
        super();
        let pass = this.addRenderPass(vs, fs);
        pass.setAttributesMap([
            {'semantic':VertexSemantic.POSITION, 'name':'a_Position'},
            {'semantic':VertexSemantic.NORMAL , 'name':'a_Normal'}
        ]);

        pass.shader.use();          
        
        pass.shader.setUniform('u_LightColor', [1.0,1.0,1.0]);
        let lightDir = [0.5, 3.0, 4.0];
        pass.shader.setUniform('u_LightDir', lightDir);

        this.setDiffuseColor([1.0,1.0,1.0]);
    }

    //Override
    get systemUniforms(){
        return [SystemUniforms.MvpMatrix, SystemUniforms.NormalMatrix]; 
    }

    // //Override
    // setSysUniformValues(pass, context){
    //     pass.shader.setUniform('u_mvpMatrix', context[SystemUniforms.MvpMatrix]);
    //     pass.shader.setUniform('u_NormalMatrix', context[SystemUniforms.NormalMatrix]);
    // }

    setDiffuseColor(diffuse){
        let pass = this.renderPasses[0];
        pass.shader.use();          
        pass.shader.setUniform('u_diffuseColor', diffuse);
    }
}

export { MatBasicLight };