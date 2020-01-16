attribute vec4 a_Position;
    
uniform mat4 u_mvpMatrix;
varying vec4 v_Color;

void main(){
    gl_Position = u_mvpMatrix * a_Position;
    v_Color = 0.5*(gl_Position + vec4(1,1,1,1));    
}