import { VertexFormat, VertexSemantic } from "../core/vertexFormat";
import { Mesh } from "../core/mesh";

// Clip Space 全屏矩形，用于PostProcessing

class ScreenQuard{
    static createMesh(wireframe){    
        let position_data = [-1.0, 1.0, -1.0, -1.0, 1.0, -1.0,
                             -1.0, 1.0,  1.0, -1.0, 1.0,  1.0];
        let uv_data = [0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
                       0.0, 1.0, 1.0, 0.0, 1.0, 1.0];

        let format = new VertexFormat();
        format.addAttrib(VertexSemantic.POSITION, 2);
        format.addAttrib(VertexSemantic.UV0, 2);

        let mesh = new Mesh(format, wireframe); 
        mesh.setVertexData(VertexSemantic.POSITION, position_data);    
        mesh.setVertexData(VertexSemantic.UV0, uv_data);
        mesh.upload();            
    
        return mesh;  
    }
}

export { ScreenQuard };