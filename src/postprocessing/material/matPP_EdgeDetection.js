//PostProcessing: edge detection
import { MatPP_Base } from "./matPP_Base";

let vs = `
attribute vec2 a_Position;
attribute vec2 a_Texcoord;
uniform vec2 u_texelSize;
varying vec2 v_uvs[9];

void main(){
    gl_Position = vec4(a_Position, 0.0, 1.0);
    vec2 uv = a_Texcoord;

    v_uvs[0] = uv + u_texelSize * vec2(-1.0, 1.0);
    v_uvs[1] = uv + u_texelSize * vec2(0.0, 1.0);
    v_uvs[2] = uv + u_texelSize * vec2(1.0, 1.0);
    v_uvs[3] = uv + u_texelSize * vec2(-1.0, 0.0);
    v_uvs[4] = uv;
    v_uvs[5] = uv + u_texelSize * vec2(1.0, 0.0);
    v_uvs[6] = uv + u_texelSize * vec2(-1.0, -1.0);
    v_uvs[7] = uv + u_texelSize * vec2(0.0, -1.0);
    v_uvs[8] = uv + u_texelSize * vec2(1.0, -1.0);
}
`;

let fs = `
#ifdef GL_ES
precision mediump float;
#endif
uniform sampler2D u_texMain;
uniform float u_edgeOnly;
uniform vec3 u_colorEdge;
uniform vec3 u_colorBg;

varying vec2 v_uvs[9];

float luminance(vec4 color){
    return dot(color.rgb, vec3(0.2125, 0.7154, 0.0721));
}

float sobel(){  
    float Gx[9];
    Gx[0] = -1.0;
    Gx[1] = 0.0;
    Gx[2] = 1.0;
    Gx[3] = -2.0;
    Gx[4] = 0.0;
    Gx[5] = 2.0;
    Gx[6] = -1.0;
    Gx[7] = 0.0;
    Gx[8] = 1.0;
        
    float Gy[9];
    Gy[0] = 1.0;
    Gy[1] = 2.0;
    Gy[2] = 1.0;
    Gy[3] = 0.0;
    Gy[4] = 0.0;
    Gy[5] = 0.0;
    Gy[6] = -1.0;
    Gy[7] = -2.0;
    Gy[8] = -1.0;

    float texColor;
    float edgeX = 0.0;
    float edgeY = 0.0;
    for(int i=0; i<9; i++){
        texColor = luminance(texture2D(u_texMain, v_uvs[i]));
        edgeX += texColor * Gx[i];
        edgeY += texColor * Gy[i];
    }
    float edge = 1.0 - abs(edgeX) - abs(edgeY);
    return edge;
}
    
    
void main(){  
    float edge = sobel();
    vec3 withEdgeColor = mix(u_colorEdge, texture2D(u_texMain, v_uvs[4]).rgb, edge);
    vec3 onlyEdgeColor = mix(u_colorEdge, u_colorBg, edge);
    gl_FragColor = vec4(mix(withEdgeColor, onlyEdgeColor, u_edgeOnly), 1.0);
}
`;

class MatPP_EdgeDetection extends MatPP_Base{
    constructor(){
        super(fs, vs);  
        
        this.texelSize = [1.0/512.0, 1.0/512.0];
        this._edgeOnly = 1.0;
        this._colorEdge = [0.0, 0.0, 0.0];
        this._colorBg = [1.0, 1.0, 1.0];
    }

    //Override
    setCustomUniformValues(pass){                           
        super.setCustomUniformValues(pass);
        pass.shader.setUniformSafe('u_texelSize', this.texelSize);
        pass.shader.setUniformSafe('u_edgeOnly', this._edgeOnly);
        pass.shader.setUniformSafe('u_colorEdge', this._colorEdge);
        pass.shader.setUniformSafe('u_colorBg', this._colorBg);
    }

    set edgeOnly(v){
        this._edgeOnly = v;
    }

    set colorEdge(c){
        this._colorEdge = c;
    }

    set colorBg(c){
        this._colorBg = c;
    }

}

export { MatPP_EdgeDetection };