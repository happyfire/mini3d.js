
let VertexAttribSemantic = {    
    POSITION : 'position',        
    NORMAL : 'normal',
    TANGENT : 'tangent',
    COLOR : 'color',
    UV0 : 'uv0',
    UV1 : 'uv1',  
    UV2 : 'uv2', 
    UV3 : 'uv3', 
    Custom0 : 'custom0',
    Custom1 : 'custom1',
    Custom2 : 'custom2',
    Custom3 : 'custom3',
    Custom4 : 'custom4',
    Custom5 : 'custom5',
    Custom6 : 'custom6',
    Custom7 : 'custom7'
}

//mini3d顶点使用float32类型

class VertexFormat{
    constructor(){
        this.attribs = [];
        this.attribSizeMap = {};
    }

    addAttrib(attribSemantic, size){       
        this.attribs.push(attribSemantic); 
        this.attribSizeMap[attribSemantic] = size;        
    }

    getVertexSize(){
        let size = 0;
        for(let i=0; i<this.attribs.length; ++i){
            let semantic = this.attribs[i];
            size += this.attribSizeMap[semantic];
        }
        return size;
    }
}

export { VertexFormat, VertexAttribSemantic};