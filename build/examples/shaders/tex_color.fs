#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_sampler;

varying vec4 v_Color;
varying vec2 v_TexCoord;

void main(){
    vec4 tex = texture2D(u_sampler, v_TexCoord);
    gl_FragColor = tex * v_Color;
}