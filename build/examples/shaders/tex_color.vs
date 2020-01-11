attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec2 a_TexCoord;
    
uniform mat4 u_mvpMatrix;
varying vec4 v_Color;
varying vec2 v_TexCoord;

void main(){
    gl_Position = u_mvpMatrix * a_Position;
    v_Color = a_Color;
    v_TexCoord = a_TexCoord;
}