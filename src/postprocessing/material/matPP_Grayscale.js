//PostProcessing: Grayscale
import { MatPP_Base } from "./matPP_Base";

let fs = `
#ifdef GL_ES
precision mediump float;
#endif
uniform sampler2D u_texMain;
varying vec2 v_texcoord;
void main(){  
    vec3 color = texture2D(u_texMain, v_texcoord).rgb;
    float gray = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;  
    gl_FragColor = vec4(gray, gray, gray, 1.0);
}
`;

class MatPP_Grayscale extends MatPP_Base{
    constructor(){
        super(fs);              
    }
}

export { MatPP_Grayscale };