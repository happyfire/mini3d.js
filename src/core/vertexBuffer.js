import { gl } from "./gl";
import { VertexAttribSemantic} from "./vertexFormat";

class VertexAttribData{
    constructor(attribSemantic, attribSize){
        this.semantic = attribSemantic;
        this.size = attribSize;
        this.data = null;
    }
}

class VertexBuffer{
    constructor(vertexFormat){
        this._vertexCount = 0;
        this._vertexSize = 0;
        this._vertexFormat = vertexFormat;
        this._attribData = {};
        let attribNum = this._vertexFormat.attribs.length;
        for(let i=0; i<attribNum; ++i){
            let semantic = this._vertexFormat.attribs[i];
            let size = this._vertexFormat.attribSizeMap[semantic];
            if(size==null){
                console.error('VertexBuffer: bad semantic');
            } else {
                let attribData = new VertexAttribData(semantic, size);
                this._attribData[semantic] = attribData;
            }            
        }

        this._vbo = gl.createBuffer();
    }

    setData(semantic, data){
        this._attribData[semantic].data = data;
    }

    get vbo(){
        return this._vbo;
    }

    get vertexCount(){
        return this._vertexCount;
    }

    destroy(){
        gl.deleteBuffer(this._vbo);  
        this._vbo = 0;      
    }

    //upload data to webGL
    uploadData(){
        let attribPosition = this._attribData[VertexAttribSemantic.POSITION];
        if(attribPosition == null){
            console.error('VertexBuffer: no attrib position');
            return;
        }
        if(attribPosition.data == null || attribPosition.data.length===0){
            console.error('VertexBuffer: position data is empty');
            return;
        }

        this._vertexCount = attribPosition.data.length / attribPosition.size;  
        this._vertexSize = this._vertexFormat.getVertexSize();       

        let data = [];
        for(let i=0; i<this._vertexCount; ++i){
            for(let semantic of this._vertexFormat.attribs){
                let attribData = this._attribData[semantic];
                if(attribData==null || attribData.data==null){
                    console.error('VertexBuffer: bad semantic '+semantic);
                    continue;
                }
                for(let k=0; k<attribData.size; ++k){
                    data.push(attribData.data[i*attribData.size+k]);
                }
            }            
        }

        let buffer = new Float32Array(data);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
        gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        
        this._FSIZE = buffer.BYTES_PER_ELEMENT;
        
        // this._attribPos = new BufferAttribInfo(this._vbo, this._posCompCnt, vertexSize*this._FSIZE, 0);
        // if(hasColor){
        //     this._attribColor = new BufferAttribInfo(this._vbo, this._colorCompCnt, vertexSize*this._FSIZE, this._posCompCnt*this._FSIZE);
        // }
        
    }
}

export { VertexBuffer };