import { Vector3 } from "../math/vector3";

// A plane on XZ plane and up is Y

class Plane{
    static createMesh(lengthX, lengthZ, xSegments, zSegments, wireframe){        
        let position_data = [];
        let normal_data = [];
        let uv_data = [];
        let triangels = [];

        let hwx = lengthX * 0.5;
        let hwz = lengthZ * 0.5;
        let c00 = new Vector3(-hwx, 0, hwz);
        let c10 = new Vector3(hwx, 0, hwz);
        let c01 = new Vector3(-hwx, 0, -hwz);

        let temp1 = new Vector3();
        let temp2 = new Vector3();
        let temp3 = new Vector3();
        let r = new Vector3();

        for(let iz=0; iz<=zSegments; ++iz){
            for(let ix=0; ix<=xSegments; ++ix){
                let u = ix / xSegments;
                let v = iz / zSegments;

                Vector3.lerp(c00, c10, u, temp1);
                Vector3.lerp(c00, c01, v, temp2);
                Vector3.sub(temp2, c00, temp3);
                Vector3.add(temp1, temp3, r);

                position_data.push(r.x, r.y, r.z);
                normal_data.push(0, 1, 0);
                uv_data.push(u, v);

                if(ix<xSegments && iz<zSegments){
                    let useg1 = xSegments + 1;
                    let a = ix + iz * useg1;
                    let b = ix + (iz+1)*useg1;
                    let c = (ix+1) + (iz+1)*useg1;
                    let d = (ix+1) + iz*useg1;

                    triangels.push(a,d,b);
                    triangels.push(d,c,b);
                }
            }
        }


        let format = new mini3d.VertexFormat();
        format.addAttrib(mini3d.VertexSemantic.POSITION, 3);
        format.addAttrib(mini3d.VertexSemantic.NORMAL, 3);
        format.addAttrib(mini3d.VertexSemantic.UV0, 2);

        let mesh = new mini3d.Mesh(format, wireframe); 
        mesh.setVertexData(mini3d.VertexSemantic.POSITION, position_data);    
        mesh.setVertexData(mini3d.VertexSemantic.NORMAL, normal_data);   
        mesh.setVertexData(mini3d.VertexSemantic.UV0, uv_data);
        mesh.setTriangles(triangels);
        mesh.upload();            
    
        return mesh;  
    }
}

export { Plane };