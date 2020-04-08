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

class MatSolidColor extends Material{
    constructor(){
        super();
        let pass = this.addRenderPass(vs, fs);
        pass.setAttributesMap([
            {'semantic':VertexSemantic.POSITION, 'name':'a_Position'}
        ]);

        pass.shader.use();          
        
        pass.shader.setUniform('u_Color', [0.0,1.0,0.0]);
    }

    //Override
    get systemUniforms(){
        return [SystemUniforms.MvpMatrix]; 
    }

    // //Override
    // setSysUniformValues(pass, context){
    //     pass.shader.setUniform('u_mvpMatrix', context[SystemUniforms.MvpMatrix]);        
    // }


}

export { MatSolidColor };