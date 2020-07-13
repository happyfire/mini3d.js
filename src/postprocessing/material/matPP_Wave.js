//PostProcessing: 简单的波动特效（可以将系数开放出来）
import { MatPP_Base } from "./matPP_Base";

let fs = `
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D u_texMain;
uniform float u_time;
varying vec2 v_texcoord;
void main(){
    vec2 dv = v_texcoord - vec2(0.5);
    float dis = length(dv);
    float dis_factor = 2.5; //波峰数
    float time_factor = 1.0;
    float wave_factor = 0.01; //振幅系数
    vec2 offset = sin((dis * dis_factor + u_time * time_factor)*3.1415926*2.0) * wave_factor * normalize(dv);
    gl_FragColor = texture2D(u_texMain, v_texcoord+offset);
}
`;

class MatPP_Wave extends MatPP_Base{
    constructor(){
        super(fs);              
        this._time = 0;
    }

    //Override
    setCustomUniformValues(pass){                           
        super.setCustomUniformValues(pass);
        pass.shader.setUniformSafe('u_time', this._time);
    }

    set time(v){
        this._time = v%10;
    }
}

export { MatPP_Wave };