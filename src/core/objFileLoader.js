import { Mesh } from "./mesh";
import { VertexFormat, VertexSemantic } from "./vertexFormat";

class StringParser{
    constructor(str){
        if(str){
            this.init(str);
        }
    }

    init(str){
        this.str = str;
        this.index = 0;
    }

    getWorldLength(str, start){
        let i=start;
        for(len=str.length; i<len; i++){
            let c = str.charAt(i);
            if (c == '\t'|| c == ' ' || c == '(' || c == ')' || c == '"'){ 
                break;
            }
        }
        return i-start;
    }

    skipDelimiters(){
        for(let i=this.index, len = this.str.length; i<len; i++){
            let c = this.str.charAt(i);
            //Skip TAB, Space, '(', ')'
            if(c == '\t' || c == ' ' || c == '(' || c==')' || c=='"'){
                continue;
            }
            break;
        }
        this.index = i;
    }

    skipToNextWord(){
        this.skipDelimiters();
        let n = this.getWorldLength(this.str, this.index);
        this.index += (n+1);
    }

    getWord(){
        this.skipDelimiters();
        let n = this.getWorldLength(this.str, this.index);
        if(n == 0){
            return null;
        }
        let word = this.str.substr(this.index, n);
        this.index += (n+1);
        return word;
    }

    getInt(){
        return parseInt(this.getWord());
    }

    getFloat(){
        return parseFloat(this.getWord());
    }
}

class Face{
    constructor(){
        this.vIndices = [];
        this.nIndices = [];
        this.tIndices = [];
    }
}

class ObjFileLoader{
    constructor(){
        this.reset();
    }

    reset(){
        this._vertices = [];
        this._normals = [];
        this._texcoords = [];
        this._faces = [];     
        this._numIndices = 0;
    }

    load(fileString, scale){
        let lines = fileString.split('\n');
        lines.push(null);
        let index = 0;

        let line;
        let sp = new StringParser();
        while((line = lines[index++]) != null){
            sp.init(line);
            let command = sp.getWord();
            if(command==null) continue;

            switch(command){
                case '#':
                    continue; //Skip comments
                case 'mtllib': 
                    continue; //Skip material chunk
                case 'o':
                case 'g':
                    continue; //Skip Object name
                case 'v': //Read vertex
                {
                    let vertex = this.parseVertex(sp, scale);
                    this._vertices.push(vertex);
                    continue;
                }
                case 'vn'://Read normal
                {
                    let normal = this.parseNormal(sp);
                    this._normals.push(normal);
                    continue;
                }
                case 'vt'://Read texture coordinates
                {
                    let texcoord = this.pasreTexcoord(sp);
                    this._texcoords.push(texcoord);
                    continue;
                }
                case 'f'://Read face
                {
                    let face = this.parseFace(sp);
                    this._faces.push(face);
                    this._numIndices += face.vIndices.length;
                    continue;
                }
                    
            }
        }

        let mesh = this._toMesh();
        this.reset();
        return mesh;
    }

    _toMesh(){
        let format = new VertexFormat();
        format.addAttrib(VertexSemantic.POSITION, 3);
        if(this._normals.length > 0){
            format.addAttrib(VertexFormat.NORMAL, 3);
        }
        let texsize = 0;
        if(this._texcoords.length > 0){
            texsize = this._texcoords[0].length;
            format.addAttrib(VertexFormat.UV0, texsize);
        }
        let mesh = new Mesh(format);
        
        let positionData = [];
        for(let i=0; i<this._vertices.length; i++){
            let vertex = this._vertices[i];
            positionData.push(vertex.x, vertex.y, vertex.z);
        }
        mesh.setVertexData(VertexSemantic.POSITION, positionData);

        if(this._normals.length > 0){
            let normalData = [];
            for(let i=0; i<this._normals.length; i++){
                let normal = this._normals[i];
                normalData.push(normal.x, normal.y, normal.z);
            }
            mesh.setVertexData(VertexSemantic.NORMAL, normalData);
        }

        if(texsize>0){
            let texcoordData = [];
            for(let i=0; i<this._texcoords.length; i++){
                let texcoord = this._texcoords[i];
                for(let j=0; j<texsize; j++){
                    texcoordData.push(texcoord[j]);
                }
            }
            mesh.setVertexData(VertexSemantic.UV0, texcoordData);
        }

        let triangels = [];
        for(let i=0; i<this._faces.length; i++){
            let face = this._faces[i];
            for(let j=0; j<face.vIndices.length; j++){
                triangels.push(face.vIndices[j]);
            }            
        }
        mesh.setTriangles(triangels);
        mesh.upload();

        return mesh;
    }

    parseVertex(sp, scale){
        let x = sp.getFloat() * scale;
        let y = sp.getFloat() * scale;
        let z = sp.getFloat() * scale;
        return {'x':x,'y':y,'z':z};
    }

    parseNormal(sp){
        let x = sp.getFloat();
        let y = sp.getFloat();
        let z = sp.getFloat();
        return {'x':x,'y':y,'z':z};
    }

    pasreTexcoord(sp){
        let texcoord = [];
        for(;;){
            let word = sp.getWord();
            if(word==null) break;
            texcoord.push(word);
        }
        return texcoord;
    }

    parseFace(sp){
        let face = new Face();
        for(;;){
            let word = sp.getWord();
            if(word==null) break;
            let subWords = word.split('/');
            if(subWords.length >= 1){
                let vi = parseInt(subWords[0]) - 1;
                face.vIndices.push(vi);
            }
            if(subWords.length >= 3){
                let ni = parseInt(subWords[2]) - 1;
                face.nIndices.push(ni);
                let ti = parseInt(subWords[1]);
                if(!isNaN(ti)){
                    ti--;
                    face.tIndices.push(ti);
                }
            }
        }

        if(face.nIndices.length == 0){
            //calc face normal
        }

        return face;
    }

}

let objFileLoader = new ObjFileLoader();

export {objFileLoader};