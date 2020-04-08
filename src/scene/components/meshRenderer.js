import { SystemUniforms } from "../../material/material";

class MeshRenderer{
    constructor(){
        this.mesh = null;
        this.material = null;

        this._mvpMatrix = new mini3d.Matrix4();
        this._normalMatrix = new mini3d.Matrix4();
    }

    setNode(node){
        this.node = node;
    }

    setMaterial(material){
        this.material = material;
    }

    setMesh(mesh){
        this.mesh = mesh;
    }

    render(camera){

        let systemUniforms = this.material.systemUniforms;
        let uniformContext = {};

        for(let sysu of systemUniforms){
            switch(sysu){
                case SystemUniforms.MvpMatrix:{
                    this._mvpMatrix.set(camera.getViewProjMatrix());
                    this._mvpMatrix.multiply(this.node.worldMatrix);
                    uniformContext[SystemUniforms.MvpMatrix] = this._mvpMatrix.elements;
                    break;
                }
                case SystemUniforms.NormalMatrix:{
                    this._normalMatrix.setInverseOf(this.node.worldMatrix);
                    this._normalMatrix.transpose();  
                    uniformContext[SystemUniforms.NormalMatrix] = this._normalMatrix.elements;
                    break;
                }

            }
        }

        this.material.render(this.mesh, uniformContext);                
    }

}

export { MeshRenderer };