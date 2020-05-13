import { Vector3 } from "../math/vector3";

// 计算几何体的法线和切线
// 输入的 triangels， positions, uvs都是js数组

class GeomertyHelper{
    // normals ////////////
    static calcMeshNormals(triangels, positions, normals){
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

            let faceN = GeomertyHelper._calcFaceNormal(p0, p1, p2);          
            let faceArea = GeomertyHelper._calcFaceArea(p0, p1, p2);      

            if(vertexNormals[idx0]==null){
                vertexNormals[idx0] = new Vector3();
            }
            let angle = GeomertyHelper._calcAngle(new Vector3(p1x-p0x, p1y-p0y, p1z-p0z), new Vector3(p2x-p0x, p2y-p0y, p2z-p0z));                
            vertexNormals[idx0].add(Vector3.scaleTo(faceN, angle, new Vector3().scale(faceArea)));

            if(vertexNormals[idx1]==null){
                vertexNormals[idx1] = new Vector3();
            }
            angle = GeomertyHelper._calcAngle(new Vector3(p2x-p1x, p2y-p1y, p2z-p1z), new Vector3(p0x-p1x, p0y-p1y, p0z-p1z));                
            vertexNormals[idx1].add(Vector3.scaleTo(faceN, angle, new Vector3().scale(faceArea)));

            if(vertexNormals[idx2]==null){
                vertexNormals[idx2] = new Vector3();
            }
            angle = GeomertyHelper._calcAngle(new Vector3(p0x-p2x, p0y-p2y, p0z-p2z), new Vector3(p1x-p2x, p1y-p2y, p1z-p2z));                
            vertexNormals[idx2].add(Vector3.scaleTo(faceN, angle, new Vector3().scale(faceArea)));
        }

        for(let i=0; i<vertexNormals.length; ++i){
            let n = vertexNormals[i];                                
            n.normalize();
            normals.push(n.x, n.y, n.z);
        }
    }

    static _calcFaceNormal(p0, p1, p2){
        let v_10 = new Vector3(p0.x-p1.x, p0.y-p1.y, p0.z-p1.z);
        let v_12 = new Vector3(p2.x-p1.x, p2.y-p1.y, p2.z-p1.z);
        let normal = new Vector3();
        Vector3.cross(v_12, v_10, normal);        
        normal.normalize();
        return normal;
    }

    static _calcFaceArea(p0, p1, p2){
        let a = Vector3.distance(p0, p1);
        let b = Vector3.distance(p1, p2);
        let c = Vector3.distance(p0, p2);
        let p = (a+b+c)/2;
        return Math.sqrt(p*(p-a)*(p-b)*(p-c));
    }

    static _calcAngle(v0, v1){
        v0.normalize();
        v1.normalize();
        return Math.acos(Vector3.dot(v0, v1));
    }

    // tangents ////////////
    static calcMeshTangents(triangels, positions, uvs, tangents){
        let triangleCount = triangels.length/3;
        let vertexTangents = [];
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

            let u0 = uvs[idx0*2];
            let v0 = uvs[idx0*2+1];
            let uv0 = new Vector3(u0, v0, 0);

            let u1 = uvs[idx1*2];
            let v1 = uvs[idx1*2+1];
            let uv1 = new Vector3(u1, v1, 0);

            let u2 = uvs[idx2*2];
            let v2 = uvs[idx2*2+1];
            let uv2 = new Vector3(u2, v2, 0);

            let faceT = GeomertyHelper._calcFaceTangent(p0, p1, p2, uv0, uv1, uv2); 

            if(vertexTangents[idx0]==null){
                vertexTangents[idx0] = new Vector3();
            }              
            vertexTangents[idx0].add(faceT);
            vertexTangents[idx0].w = faceT.w; //hack w给顶点切线

            if(vertexTangents[idx1]==null){
                vertexTangents[idx1] = new Vector3();
            }            
            vertexTangents[idx1].add(faceT);
            vertexTangents[idx1].w = faceT.w;

            if(vertexTangents[idx2]==null){
                vertexTangents[idx2] = new Vector3();
            }
            vertexTangents[idx2].add(faceT);
            vertexTangents[idx2].w = faceT.w;
        }

        for(let i=0; i<vertexTangents.length; ++i){
            let t = vertexTangents[i];                                
            t.normalize();            
            tangents.push(t.x, t.y, t.z, t.w);
        }
    }

    static _calcFaceTangent(p0, p1, p2, uv0, uv1, uv2){
        let edge1 = Vector3.sub(p1, p0, new Vector3());
        let edge2 = Vector3.sub(p2, p0, new Vector3());
        let deltaUV1 = Vector3.sub(uv1, uv0, new Vector3());
        let deltaUV2 = Vector3.sub(uv2, uv0, new Vector3());
        let f = 1.0 / (deltaUV1.x * deltaUV2.y - deltaUV2.x * deltaUV1.y);
        let tangent = new Vector3();
        tangent.x = f * (deltaUV2.y * edge1.x - deltaUV1.y * edge2.x);
        tangent.y = f * (deltaUV2.y * edge1.y - deltaUV1.y * edge2.y);
        tangent.z = f * (deltaUV2.y * edge1.z - deltaUV1.y * edge2.z);
        tangent.normalize();

        //compute binormal
        let binormal = new Vector3();
        binormal.x = f * (-deltaUV2.x * edge1.x + deltaUV1.x * edge2.x);
        binormal.y = f * (-deltaUV2.x * edge1.y + deltaUV1.x * edge2.y);
        binormal.z = f * (-deltaUV2.x * edge1.z + deltaUV1.x * edge2.z);
        binormal.normalize();

        //计算tangent和binormal的叉积，如果得到的向量和normal是反向的
        //则将tangent.w设置为-1，在shader里面用这个w将计算出来的binormal反向
        //注：这儿计算的并不会反向，但是如果是外部导入的切线，计算时的坐标系的手向不同是可能反向的
        //保留这段代码主要是演示作用，此处计算的tanget的w总是1

        let crossTB = new Vector3();
        Vector3.cross(tangent, binormal, crossTB);
        let normal = new Vector3();
        Vector3.cross(edge1, edge2, normal);
        if(Vector3.dot(crossTB, normal)<0){
            tangent.w = -1; //由于用了Vector3，所以这里hack一个w           
        } else {
            tangent.w = 1;
        }

        return tangent;
    }
}

export { GeomertyHelper };
