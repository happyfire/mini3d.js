import { gl } from "./gl";
import { VertexBuffer } from "./vertexBuffer";
import { IndexBuffer } from "./indexBuffer";

class Mesh{    
    constructor(vertexFormat, wireframe=false){        
        this._vertexBuffer = new VertexBuffer(vertexFormat);
        this._indexBuffer = null;
        this._wireframe = wireframe;
    }

    setVertexData(semantic, data){
        this._vertexBuffer.setData(semantic, data);        
    }  
    
    setTriangles(data){
        if(this._indexBuffer==null){
            this._indexBuffer = new IndexBuffer(this._wireframe);            
        }
        this._indexBuffer.setData(data);
    }

    destroy(){
        this._vertexBuffer.destroy();    
    }      

    upload(){        
        this._vertexBuffer.upload();   
        if(this._indexBuffer){
            this._indexBuffer.upload();
        }                            
    }

    render(shader){
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer.vbo);
        
        this._vertexBuffer.bindAttrib(shader);
                  
        if(this._indexBuffer){
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer.vbo);
            gl.drawElements(this._indexBuffer.mode, this._indexBuffer.indexCount, this._indexBuffer.type, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        } else {
            gl.drawArrays(gl.TRIANGLES, 0, this._vertexBuffer.vertexCount);
        }
        
        this._vertexBuffer.unbindAttrib(shader);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}

export { Mesh };
