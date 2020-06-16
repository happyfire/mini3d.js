//PostProcessing: Vignette 简单的晕影效果
import { MatPP_Base } from "./matPP_Base";

let fs = `
#ifdef GL_ES
precision mediump float;
#endif
uniform sampler2D u_texMain;
uniform float u_intensity;
uniform vec3 u_color;
varying vec2 v_texcoord;
void main(){
    vec2 coords = v_texcoord;
    coords = (coords-0.5)*2.0;
    float coordDot = dot(coords, coords);
    float mask = 1.0 - coordDot * u_intensity * 0.1;
    vec4 tex = texture2D(u_texMain, v_texcoord);
    vec3 color = mix(u_color, tex.rgb, mask);
    gl_FragColor = vec4(color * mask, tex.a);
}
`;

class MatPP_Vignette extends MatPP_Base{
    constructor(){
        super(fs);  
        this._intensity = 3.0; 
        this._color = [0.0, 0.0, 0.0];
    }

    //Override
    setCustomUniformValues(pass){                           
        super.setCustomUniformValues(pass);
        pass.shader.setUniformSafe('u_intensity', this._intensity);
        pass.shader.setUniformSafe('u_color', this._color);
    }

    set intensity(v){
        this._intensity = v;
    }

    set color(v){
        this._color = v;
    }
}

export { MatPP_Vignette };