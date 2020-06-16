//PostProcessing: Modify brightness, saturation and contrast
import { MatPP_Base } from "./matPP_Base";

let fs = `
#ifdef GL_ES
precision mediump float;
#endif
uniform sampler2D u_texMain;
uniform float u_brightness;
uniform float u_saturation;
uniform float u_contrast;

varying vec2 v_texcoord;
void main(){  
    vec4 tex = texture2D(u_texMain, v_texcoord);
    
    //Apply brightness
    vec3 final = tex.rgb * u_brightness;

    //Apply saturation
    float luminance = 0.2125 * tex.r + 0.7154 * tex.g + 0.0721 * tex.b;  
    vec3 luminanceColor = vec3(luminance,luminance,luminance);
    final = mix(luminanceColor, final, u_saturation);

    //Apply contrast
    vec3 avgColor = vec3(0.5, 0.5, 0.5);
    final = mix(avgColor, final, u_contrast);

    gl_FragColor = vec4(final, tex.a);
}
`;

class MatPP_ColorBSC extends MatPP_Base{
    constructor(){
        super(fs);  
        
        this._brightness = 1.0;
        this._saturation = 1.0;
        this._contrast = 1.0;
    }

    //Override
    setCustomUniformValues(pass){                           
        super.setCustomUniformValues(pass);
        pass.shader.setUniformSafe('u_brightness', this._brightness);
        pass.shader.setUniformSafe('u_saturation', this._saturation);
        pass.shader.setUniformSafe('u_contrast', this._contrast);
    }

    set brightness(v){
        this._brightness = v;
    }

    get brightness(){
        return this._brightness;
    }

    set saturation(v){
        this._saturation = v;
    }

    get saturation(){
        return this._saturation;
    }

    set contrast(v){
        this._contrast = v;
    }

    get contrast(){
        return this._contrast;
    }
}

export { MatPP_ColorBSC };