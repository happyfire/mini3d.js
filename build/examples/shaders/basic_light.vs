attribute vec4 a_Position;
attribute vec3 a_Normal;
    
uniform mat4 u_mvpMatrix;
uniform mat4 u_NormalMatrix;
uniform vec3 u_LightColor; // Light color
uniform vec3 u_LightDir;   // World space light direction
varying vec4 v_Color;

void main(){
    gl_Position = u_mvpMatrix * a_Position;
    vec3 normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 0.0)));
    vec3 light = normalize(u_LightDir);
    float nDotL = max(dot(light, normal), 0.0);
    vec3 diffuse = u_LightColor * nDotL;
    vec3 c = diffuse + vec3(0.1);
    v_Color = vec4(c, 1.0);
}