
let VertexSemantic = {    
    POSITION : 'position',        
    NORMAL : 'normal',
    TANGENT : 'tangent',
    COLOR : 'color',
    UV0 : 'uv0',
    UV1 : 'uv1',  
    UV2 : 'uv2', 
    UV3 : 'uv3'
}

//mini3d顶点使用float32类型

class VertexFormat{
    constructor(){
        this.attribs = [];
        this.attribSizeMap = {};
        this._vertexSize = 0;
    }

    addAttrib(attribSemantic, size){       
        this.attribs.push(attribSemantic); 
        this.attribSizeMap[attribSemantic] = size;        
    }

    getVertexSize(){
        if(this._vertexSize === 0){          
            for(let i=0; i<this.attribs.length; ++i){
                let semantic = this.attribs[i];
                this._vertexSize += this.attribSizeMap[semantic];
            }
        }        
        return this._vertexSize;
    }
}

export { VertexFormat, VertexSemantic};