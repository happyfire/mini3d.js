import { gl } from "./gl";

class Shader{
    
    constructor(){          
        this.program = null;    
    }

    create(vshader, fshader){
        let vertexShader = this.loadShader(gl.VERTEX_SHADER, vshader);
        let fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fshader);
        if (!vertexShader || !fragmentShader) {
            return false;
        }

        // Create a program object
        this.program = gl.createProgram();
        if (!this.program) {
            return false;
        }

        // Attach the shader objects
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);

        // Link the program object
        gl.linkProgram(this.program);

        // Check the result of linking
        let linked = gl.getProgramParameter(this.program, gl.LINK_STATUS);
        if (!linked) {
            let error = gl.getProgramInfoLog(this.program);
            console.log('Failed to link program: ' + error);
            gl.deleteProgram(this.program);
            gl.deleteShader(fragmentShader);
            gl.deleteShader(vertexShader);
            this.program = null;    
            return false;        
        }
        return true;
    }

    loadShader(type, source){
        let shader = gl.createShader(type);
        if (shader == null) {
            console.log('unable to create shader');
            return null;
        }

        // Set the shader program
        gl.shaderSource(shader, source);

         // Compile the shader
        gl.compileShader(shader);

        // Check the result of compilation
        let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            let error = gl.getShaderInfoLog(shader);
            console.log('Failed to compile shader: ' + error);
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    use(){
        if(this.program){
            gl.useProgram(this.program);
        }
    }

}

export { Shader };
