//PostProcessing: Inversion
import { MatPP_Base } from "./matPP_Base";

let fs = `
#ifdef GL_ES
precision mediump float;
#endif
uniform sampler2D u_texMain;
varying vec2 v_texcoord;
void main(){    
    gl_FragColor = vec4(vec3(1.0 - texture2D(u_texMain, v_texcoord).rgb), 1.0);
}
`;

class MatPP_Inversion extends MatPP_Base{
    constructor(){
        super(fs);              
    }
}

export { MatPP_Inversion };