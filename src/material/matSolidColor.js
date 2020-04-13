import { Material, SystemUniforms } from "./material";
import { VertexSemantic } from "../core/vertexFormat";

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
}

`;

let g_shader = null;

class MatSolidColor extends Material{
    constructor(){
        super();

        if(g_shader==null){
            g_shader = Material.createShader(vs, fs, [
                {'semantic':VertexSemantic.POSITION, 'name':'a_Position'}               
            ]);
        }

        this.addRenderPass(g_shader);

        //default uniforms
        this.color = [1.0, 1.0, 1.0];            
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