import { GeomertyHelper } from "./geometryHelper";

// A plane on XZ plane and up is Y

class Plane{
    static createMesh(lengthX, lengthZ, xSegments, zSegments, wireframe){    
        if(xSegments<=1){
            xSegments = 1;
        }    
        if(zSegments<=1){
            zSegments = 1;
        }

        let position_data = [];
        let normal_data = [];
        let uv_data = [];
        let tangent_data = [];
        let triangels = [];

        const anchorX = 0.5;
        const anchorZ = 0.5;

        let hwx = lengthX * anchorX;
        let hwz = lengthZ * anchorZ;
    
        for(let iz=0; iz<=zSegments; ++iz){

            let v = iz / zSegments;
            let z = lengthZ*v - hwz;

            for(let ix=0; ix<=xSegments; ++ix){
                let u = ix / xSegments;
                let x = lengthX*u - hwx;                
                
                position_data.push(x,0,z);
                normal_data.push(0, 1, 0);
                uv_data.push(u, v);                

                if(ix<xSegments && iz<zSegments){
                    let line_verts = xSegments + 1;
                    let a = ix + iz * line_verts; //x0z0
                    let b = ix + (iz+1)*line_verts; //x0z1
                    let c = (ix+1) + iz*line_verts; //x1z0
                    let d = (ix+1) + (iz+1)*line_verts; //x1z1
                    
                    triangels.push(b,d,a);
                    triangels.push(a,d,c);
                }
            }
        }

        //计算切线
        GeomertyHelper.calcMeshTangents(triangels, position_data, uv_data, tangent_data);

        let format = new mini3d.VertexFormat();
        format.addAttrib(mini3d.VertexSemantic.POSITION, 3);
        format.addAttrib(mini3d.VertexSemantic.NORMAL, 3);
        format.addAttrib(mini3d.VertexSemantic.TANGENT, 4);
        format.addAttrib(mini3d.VertexSemantic.UV0, 2);

        let mesh = new mini3d.Mesh(format, wireframe); 
        mesh.setVertexData(mini3d.VertexSemantic.POSITION, position_data);    
        mesh.setVertexData(mini3d.VertexSemantic.NORMAL, normal_data);
        mesh.setVertexData(mini3d.VertexSemantic.TANGENT, tangent_data);   
        mesh.setVertexData(mini3d.VertexSemantic.UV0, uv_data);
        mesh.setTriangles(triangels);
        mesh.upload();            
    
        return mesh;  
    }
}

export { Plane };