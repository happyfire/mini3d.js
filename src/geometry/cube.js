import { GeomertyHelper } from "./geometryHelper";

class Cube{
    static createMesh(){

        let format = new mini3d.VertexFormat();
        format.addAttrib(mini3d.VertexSemantic.POSITION, 3);
        format.addAttrib(mini3d.VertexSemantic.NORMAL, 3);
        format.addAttrib(mini3d.VertexSemantic.TANGENT, 4);
        format.addAttrib(mini3d.VertexSemantic.UV0, 2);
    
        // cube
        //       ^ Y
        //       | 
        //       |
        //       / -------> X 
        //      /
        //     v
        //    Z
        //
        //    v6----- v5
        //   /|      /|
        //  v1------v0|
        //  | |     | |
        //  | |v7---|-|v4
        //  |/      |/
        //  v2------v3
    
        let mesh = new mini3d.Mesh(format);  
        //6个面（12个三角形），24个顶点  
        let position_data = [
            //v0-v1-v2-v3 front (0,1,2,3)
            1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0, -1.0, 1.0,  1.0, -1.0, 1.0,
            //v0-v3-v4-v5 right (4,5,6,7)
            1.0, 1.0, 1.0,  1.0, -1.0, 1.0,  1.0, -1.0, -1.0,  1.0, 1.0, -1.0,
            //v0-v5-v6-v1 top (8,9,10,11)
            1.0, 1.0, 1.0,  1.0, 1.0, -1.0,  -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
            //v1-v6-v7-v2 left (12,13,14,15)
            -1.0, 1.0, 1.0,  -1.0, 1.0, -1.0,  -1.0, -1.0, -1.0,  -1.0, -1.0, 1.0,
            //v7-v4-v3-v2 bottom (16,17,18,19)
            -1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0, -1.0, 1.0,  -1.0, -1.0, 1.0,
            //v4-v7-v6-v5 back (20,21,22,23)
            1.0, -1.0, -1.0,  -1.0, -1.0, -1.0,  -1.0, 1.0, -1.0,  1.0, 1.0, -1.0        
        ];
        let normal_data = [
            //v0-v1-v2-v3 front
            0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
            //v0-v3-v4-v5 right
            1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,            
            //v0-v5-v6-v1 top
            0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
            //v1-v6-v7-v2 left
            -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
            //v7-v4-v3-v2 bottom
            0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
            //v4-v7-v6-v5 back
            0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0
        ];
        let uv_data = [
            //v0-v1-v2-v3 front
            1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
            //v0-v3-v4-v5 right
            0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
            //v0-v5-v6-v1 top
            1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
            //v1-v6-v7-v2 left
            1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
            //v7-v4-v3-v2 bottom
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            //v4-v7-v6-v5 back
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0
        ]
    
        let triangels = [
            0,1,2, 0,2,3,       //front
            4,5,6, 4,6,7,       //right
            8,9,10, 8,10,11,    //top
            12,13,14, 12,14,15, //left
            16,17,18, 16,18,19, //bottom
            20,21,22, 20,22,23  //back
        ];

        let tangent_data = [];
        GeomertyHelper.calcMeshTangents(triangels, position_data, uv_data, tangent_data);
    
        mesh.setVertexData(mini3d.VertexSemantic.POSITION, position_data);    
        mesh.setVertexData(mini3d.VertexSemantic.NORMAL, normal_data); 
        mesh.setVertexData(mini3d.VertexSemantic.TANGENT, tangent_data);   
        mesh.setVertexData(mini3d.VertexSemantic.UV0, uv_data);
        mesh.setTriangles(triangels);
        mesh.upload();            
    
        return mesh;   
    }
}

export { Cube };