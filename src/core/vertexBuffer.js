import { gl } from "./gl";
import { VertexSemantic } from "./vertexFormat";

class VertexAttribInfo{
    constructor(attribSemantic, attribSize){
        this.semantic = attribSemantic;
        this.size = attribSize;
        this.offset = 0;
        this.data = null;
    }
}

class VertexBuffer{
    constructor(vertexFormat){
        this._vertexCount = 0;
        this._vertexStride = 0; // vertex data size in byte
        this._vertexFormat = vertexFormat;
        this._attribsInfo = {};
        this._bufferData = null;

        this.BYTES_PER_ELEMENT = 4; // for Float32Array

        let attribNum = this._vertexFormat.attribs.length;
        for(let i=0; i<attribNum; ++i){
            let semantic = this._vertexFormat.attribs[i];
            let size = this._vertexFormat.attribSizeMap[semantic];
            if(size==null){
                console.error('VertexBuffer: bad semantic');
            } else {
                let info = new VertexAttribInfo(semantic, size);
                this._attribsInfo[semantic] = info;
            }            
        }

        this._vbo = gl.createBuffer();
    }

    setData(semantic, data){
        this._attribsInfo[semantic].data = data;
    }

    get vbo(){
        return this._vbo;
    }

    get vertexCount(){
        return this._vertexCount;
    }

    get vertexStride(){
        return this._vertexStride;
    }

    destroy(){
        gl.deleteBuffer(this._vbo);  
        this._vbo = 0;      
    }

    //combine vertex attribute datas to a data array
    _compile(){
        let positionInfo = this._attribsInfo[VertexSemantic.POSITION];
        if(positionInfo == null){
            console.error('VertexBuffer: no attrib position');
            return;
        }
        if(positionInfo.data == null || positionInfo.data.length===0){
            console.error('VertexBuffer: position data is empty');
            return;
        }

        this._vertexCount = positionInfo.data.length / positionInfo.size;  
        this._vertexStride = this._vertexFormat.getVertexSize() * this.BYTES_PER_ELEMENT; 
        
        this._bufferData = [];
        for(let i=0; i<this._vertexCount; ++i){
            for(let semantic of this._vertexFormat.attribs){
                let info = this._attribsInfo[semantic];
                if(info==null || info.data==null){
                    console.error('VertexBuffer: bad semantic '+semantic);
                    continue;
                }
                for(let k=0; k<info.size; ++k){
                    let value = info.data[ i * info.size + k ];
                    if(value===undefined){
                        console.error('VertexBuffer: missing value for '+semantic);
                    }
                    this._bufferData.push(value);
                }
            }            
        }

        //compute offset for attrib info, and free info.data
        let offset = 0;
        for(let semantic of this._vertexFormat.attribs){
            let info = this._attribsInfo[semantic];
            info.offset = offset;
            info.data = null;
            offset += info.size * this.BYTES_PER_ELEMENT;
        }
    }

    //upload data to webGL, add free buffer data
    upload(){
        this._compile();

        let buffer = new Float32Array(this._bufferData);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
        gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
                  
        this._bufferData = null;
    }

    bindAttrib(shader){
        for(let semantic of this._vertexFormat.attribs){
            let info = this._attribsInfo[semantic];
            
            let location = shader.getAttributeLocation(semantic);
            if(location>=0){
                gl.vertexAttribPointer(location, 
                    info.size, 
                    gl.FLOAT, //type 
                    false, //normalized, 
                    this._vertexStride, 
                    info.offset);
                gl.enableVertexAttribArray(location);
            }                          
        }
    }

    unbindAttrib(shader){
        for(let semantic of this._vertexFormat.attribs){            
            let location = shader.getAttributeLocation(semantic);
            if(location>=0){
                gl.disableVertexAttribArray(location);
            }                          
        }        
    }
}

export { VertexBuffer };