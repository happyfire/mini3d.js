import { gl } from "./gl";

class Mesh{    
    constructor(){        
        this._positions = null;
        this._posCompCnt = 3;
        this._colors= null;
        this._colorCompCnt = 3;  
        this._vbo = gl.createBuffer();
        this._vcount = 0;      
    }

    get vbo(){
        return this._vbo;
    }

    get vcount(){
        return this._vcount;
    }

    get FSIZE(){
        return this._FSIZE;
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
    }
}

export { Mesh };
