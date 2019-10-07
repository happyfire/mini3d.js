import { gl } from "./gl";

class glBuffer {
    constructor(){
       this.vbo = gl.createBuffer();
       this.vcount = 0;
    }

    create(data, vertexCount){    
        this.vcount =  vertexCount;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        
        this.FSIZE = data.BYTES_PER_ELEMENT;
    }

}

export { glBuffer };