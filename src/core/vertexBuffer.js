
class VertexBuffer{
    

    constructor(){
        this._positions = null;
        this._posCompCnt = 3;
        this._colors= null;
        this._colorCompCnt = 3;
    }

    setPositions(positions, compCnt){
        this._positions = positions;
        this._posCompCnt = compCnt;
    }

    setColors(colors, compCnt){
        this._colors = colors;
        this._colorCompCnt = compCnt;
    }   

    createBuffer(){
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
        let glBuffer = new mini3d.glBuffer();
        glBuffer.create(buffer, vertexCount);
        return glBuffer;
    }
}

export { VertexBuffer };
