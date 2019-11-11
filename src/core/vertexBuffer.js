
class VertexBuffer{
    

    constructor(){
        this._positions = [];
        this._colors=[];
    }

    appendVertexPosition(x,y,z){
        this._positions.push([x,y,z]);
    }

    appendVertexColor(r,g,b){
        this._colors.push([r,g,b]);
    }

    createBuffer(){
        let vertexCount = this._positions.length;
        let hasColor = this._colors.length > 0;        

        let data = [];
        for(let i=0; i<vertexCount; i++){
            let pos = this._positions[i];
            data.push(pos[0],pos[1],pos[2]);
            if(hasColor){
                let color = this._colors[i];
                data.push(color[0],color[1],color[2]);
            }
        }

        let buffer = new Float32Array(data);
        let glBuffer = new mini3d.glBuffer();
        glBuffer.create(buffer, vertexCount);
        return glBuffer;
    }
}

export { VertexBuffer };
