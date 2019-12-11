import { gl } from "./gl";


class BufferAttribInfo{
    constructor(vbo, size, stride, offset){
        this.vbo = vbo;
        this.size = size;
        this.type = gl.FLOAT;
        this.normalized = false;
        this.stride = stride;
        this.offset = offset;
    }
}

class Mesh{    
    constructor(){       
        this._positions = null;
        this._posCompCnt = 3;
        this._colors= null;
        this._colorCompCnt = 3;  
        this._vbo = gl.createBuffer();
        this._vcount = 0;     
        
        this._attribPos = null;
        this._attribColor = null;
    }

    get vbo(){
        return this._vbo;
    }

    get vcount(){
        return this._vcount;
    }

    destroy(){
        gl.deleteBuffer(this._vbo);        
    }

    setPositions(positions, compCnt){
        this._positions = positions;
        this._posCompCnt = compCnt;
    }

    setColors(colors, compCnt){
        this._colors = colors;
        this._colorCompCnt = compCnt;
    }   

    apply(){
        if(this._positions == null || this._positions.length==0){
            return;
        }

        let vertexCount = this._positions.length / this._posCompCnt;
        let hasColor = this._colors && this._colors.length > 0;        

        let data = [];
        for(let i=0; i<vertexCount; i++){
            for(let k=0; k<this._posCompCnt; k++){
                data.push(this._positions[i*this._posCompCnt+k]);
            }            
            if(hasColor){
                for(let k=0; k<this._colorCompCnt; k++){
                    data.push(this._colors[i*this._colorCompCnt+k]);
                }                
            }
        }

        let buffer = new Float32Array(data);

        this._vcount =  vertexCount;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
        gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        
        this._FSIZE = buffer.BYTES_PER_ELEMENT;

        let vertexSize = this._posCompCnt;
        if(hasColor){
            vertexSize += this._colorCompCnt;
        }

        this._attribPos = new BufferAttribInfo(this._vbo, this._posCompCnt, vertexSize*this._FSIZE, 0);
        if(hasColor){
            this._attribColor = new BufferAttribInfo(this._vbo, this._colorCompCnt, vertexSize*this._FSIZE, this._posCompCnt*this._FSIZE);
        }
        
    }

    draw(shader){
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
        shader.setAttribute('a_Position', this._attribPos);
        if(this._attribColor){
            shader.setAttribute('a_Color', this._attribColor);
        }
             
        gl.drawArrays(gl.TRIANGLES, 0, this._vcount);

        shader.disableAttribute('a_Position');
        if(this._attribColor){
            shader.disableAttribute('a_Color');
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}

export { Mesh };
