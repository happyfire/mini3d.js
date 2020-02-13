import { Mesh } from "./mesh";
import { VertexFormat, VertexSemantic } from "./vertexFormat";
import { Vector3 } from "../math/vector3"

class StringParser{
    constructor(str){
        if(str){
            this.init(str);
        }
    }

    init(str){
        this.str = str.trim();        
        this.index = 0;
    }

    getWorldLength(str, start){
        let i=start;
        for(let len=str.length; i<len; i++){
            let c = str.charAt(i);
            if (c == '\t'|| c == ' ' || c == '(' || c == ')' || c == '"'){ 
                break;
            }
        }
        return i-start;
    }

    skipDelimiters(){
        let i = this.index;
        for(let len = this.str.length; i<len; i++){
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
                    continue;
                }
                    
            }
        }       

        let mesh = this._toMesh();
        this.reset();
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
                    face.tIndices.push(ti-1);
                }
            }
        }        

        // Devide to triangels if face contains over 3 points.
        // 即使用三角扇表示多边形。n个顶点需要三角形n-2。
        if(face.vIndices.length > 3){
            let n = face.vIndices.length - 2;
            let newVIndices = new Array(n * 3);
            let newNIndices = new Array(n * 3);
            for(let i=0; i<n; i++){
                newVIndices[i*3] = face.vIndices[0];
                newVIndices[i*3+1] = face.vIndices[i+1];
                newVIndices[i*3+2] = face.vIndices[i+2];
                if(face.nIndices.length>0){
                    newNIndices[i*3] = face.nIndices[0];
                    newNIndices[i*3+1] = face.nIndices[i+1];
                    newNIndices[i*3+2] = face.nIndices[i+2];
                }
            }
            face.vIndices = newVIndices;
            if(face.nIndices.length>0){
                face.nIndices = newNIndices;    
            }            
        }       

        return face;
    }

    _calcFaceNormal(p0, p1, p2){
        let v_10 = new Vector3(p0.x-p1.x, p0.y-p1.y, p0.z-p1.z);
        let v_12 = new Vector3(p2.x-p1.x, p2.y-p1.y, p2.z-p1.z);
        let normal = new Vector3();
        Vector3.cross(v_12, v_10, normal);
        normal.normalize();
        return normal;
    }

    _calcFaceArea(p0, p1, p2){
        let a = Vector3.distance(p0, p1);
        let b = Vector3.distance(p1, p2);
        let c = Vector3.distance(p0, p2);
        let p = (a+b+c)/2;
        return Math.sqrt(p*(p-a)*(p-b)*(p-c));
    }

    _calcAngle(v0, v1){
        v0.normalize();
        v1.normalize();
        return Math.acos(Vector3.dot(v0, v1));
    }

    _toMesh(){
        let format = new VertexFormat();
        format.addAttrib(VertexSemantic.POSITION, 3);        
        format.addAttrib(VertexSemantic.NORMAL, 3);
        
        let texsize = 0;
        if(this._texcoords.length > 0){
            texsize = this._texcoords[0].length;
            format.addAttrib(VertexSemantic.UV0, texsize);
        }

        let mesh = new Mesh(format);        

        let triangels = [];
        let positions = [];
        let normals = [];
        let uvs = [];

        for(let i=0; i<this._vertices.length; i++){
            let v = this._vertices[i];
            positions.push(v.x, v.y, v.z);
        }
       
        if(this._normals.length > 0){
            if(this._normals.length !== this._vertices.length){
                console.warn("obj file normals count not match vertices count");
            }
            for(let i=0; i<this._normals.length; i++){
                let n = this._normals[i];
                normals.push(n.x, n.y, n.z);
            }
        }

        if(this._texcoords.length > 0){
            if(this._texcoords.length !== this._vertices.length){
                console.warn("obj file texcoords count not match vertices count");
            }           
            for(let i=0; i<this._texcoords.length; i++){
                let texcoord = this._texcoords[i];
                for(let j=0; j<texsize; j++){
                    uvs.push(texcoord[j]);
                }
            }            
        }

        for(let i=0; i<this._faces.length; i++){
            let face = this._faces[i];
            for(let j=0; j<face.vIndices.length; j++){    
                let vIdx = face.vIndices[j];                            
                triangels.push(vIdx);                

                if(face.nIndices.length > 0){
                    let nIdx = face.nIndices[j];
                    if(nIdx !== vIdx){
                        console.warn('obj file nIdx not match vIdx');
                    }                  
                }                
            }            
        }

        if(normals.length===0){            
            let triangleCount = triangels.length/3;
            let vertexNormals = [];
            let t = 0;
            for(let i=0; i<triangleCount; ++i){                
                let idx0 = triangels[t];
                let idx1 = triangels[t+1];
                let idx2 = triangels[t+2];
                t+=3;

                let p0x = positions[idx0*3];
                let p0y = positions[idx0*3+1];
                let p0z = positions[idx0*3+2];

                let p1x = positions[idx1*3];
                let p1y = positions[idx1*3+1];
                let p1z = positions[idx1*3+2];

                let p2x = positions[idx2*3];
                let p2y = positions[idx2*3+1];
                let p2z = positions[idx2*3+2];

                let p0 = new Vector3(p0x, p0y, p0z);
                let p1 = new Vector3(p1x, p1y, p1z);
                let p2 = new Vector3(p2x, p2y, p2z);

                let faceN = this._calcFaceNormal(p0, p1, p2);          
                let faceArea = this._calcFaceArea(p0, p1, p2);      

                if(vertexNormals[idx0]==null){
                    vertexNormals[idx0] = new Vector3();
                }
                let angle = this._calcAngle(new Vector3(p1x-p0x, p1y-p0y, p1z-p0z), new Vector3(p2x-p0x, p2y-p0y, p2z-p0z));                
                vertexNormals[idx0].add(Vector3.scaleTo(faceN, angle, new Vector3().scale(faceArea)));

                if(vertexNormals[idx1]==null){
                    vertexNormals[idx1] = new Vector3();
                }
                angle = this._calcAngle(new Vector3(p2x-p1x, p2y-p1y, p2z-p1z), new Vector3(p0x-p1x, p0y-p1y, p0z-p1z));                
                vertexNormals[idx1].add(Vector3.scaleTo(faceN, angle, new Vector3().scale(faceArea)));

                if(vertexNormals[idx2]==null){
                    vertexNormals[idx2] = new Vector3();
                }
                angle = this._calcAngle(new Vector3(p0x-p2x, p0y-p2y, p0z-p2z), new Vector3(p1x-p2x, p1y-p2y, p1z-p2z));                
                vertexNormals[idx2].add(Vector3.scaleTo(faceN, angle, new Vector3().scale(faceArea)));
            }

            for(let i=0; i<vertexNormals.length; ++i){
                let n = vertexNormals[i];                                
                n.normalize();
                normals.push(n.x, n.y, n.z);
            }
        }

        mesh.setVertexData(VertexSemantic.POSITION, positions);
        mesh.setVertexData(VertexSemantic.NORMAL, normals);
        
        if(uvs.length>0){
            mesh.setVertexData(VertexSemantic.UV0, uvs);
        }

        mesh.setTriangles(triangels);
        mesh.upload();

        console.log('vertex count '+this._vertices.length);
        console.log('triangle count '+triangels.length/3);

        return mesh;
    }

}

let objFileLoader = new ObjFileLoader();

export {objFileLoader};