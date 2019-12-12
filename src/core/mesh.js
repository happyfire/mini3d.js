import { gl } from "./gl";
import { VertexBuffer } from "./vertexBuffer";

class Mesh{    
    constructor(vertexFormat){        
        this._vertexBuffer = new VertexBuffer(vertexFormat);
    }

    setVertexData(semantic, data){
        this._vertexBuffer.setData(semantic, data);        
    }  
    
    setTriangles(){

    }

    destroy(){
        this._vertexBuffer.destroy();    
    }      

    upload(){        
        this._vertexBuffer.upload();                               
    }

    render(shader){
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer.vbo);
        
        this._vertexBuffer.bindAttrib(shader);
                  
        gl.drawArrays(gl.TRIANGLES, 0, this._vertexBuffer.vertexCount);

        this._vertexBuffer.unbindAttrib(shader);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}

export { Mesh };
