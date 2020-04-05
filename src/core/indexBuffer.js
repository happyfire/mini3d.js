import { gl } from "./gl";

class IndexBuffer{
    constructor(wireframe=false){
        this._wireframe = wireframe;
        this._indexCount = 0;
        this._mode = this._wireframe? gl.LINES : gl.TRIANGLES;
        this._type = gl.UNSIGNED_SHORT;
        this._vbo = gl.createBuffer();
        this._bufferData = null;
    }

    setData(data){
        if(this._wireframe){
            this._bufferData = [];
            let vcnt = data.length/3;
            for(let i=0; i<vcnt; i++){
                let a = data[i*3];
                let b = data[i*3+1];
                let c = data[i*3+2];
                this._bufferData.push(a,b,b,c,c,a);
            }
        } else {
            this._bufferData = data;
        }
    }

    get vbo(){
        return this._vbo;
    }

    get indexCount(){
        return this._indexCount;
    }

    get mode(){
        return this._mode;
    }

    get type(){
        return this._type;
    }

    destroy(){
        gl.deleteBuffer(this._vbo);  
        this._vbo = 0;
    }

    upload(){
        if(this._bufferData==null){
            console.error("buffer data is null.");
            return;
        }
        let useByte = this._bufferData.length<=256;
        let buffer = useByte ? new Uint8Array(this._bufferData) : new Uint16Array(this._bufferData);
        this._type = useByte ? gl.UNSIGNED_BYTE : gl.UNSIGNED_SHORT;
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._vbo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buffer, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        this._indexCount = buffer.length;
        this._bufferData = null;
    }
}

export { IndexBuffer };