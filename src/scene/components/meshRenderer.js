class MeshRenderer{
    constructor(){
        this.mesh = null;
        this.shader = null;

        this._mvpMatrix = new mini3d.Matrix4();
        this._normalMatrix = new mini3d.Matrix4();
    }

    setNode(node){
        this.node = node;
    }

    setShader(shader){
        this.shader = shader;
    }

    setMesh(mesh){
        this.mesh = mesh;
    }

    render(camera){

        this._normalMatrix.setInverseOf(this.node.worldMatrix);
        this._normalMatrix.transpose();    
    
        this._mvpMatrix.set(camera.getViewProjMatrix());
        this._mvpMatrix.multiply(this.node.worldMatrix);
        
        this.shader.setUniform('u_mvpMatrix', this._mvpMatrix.elements);
        this.shader.setUniform('u_NormalMatrix', this._normalMatrix.elements);
        this.shader.setUniform('u_LightColor', [1.0,1.0,1.0]);
        let lightDir = [0.5, 3.0, 4.0];
        this.shader.setUniform('u_LightDir', lightDir);

        this.mesh.render(this.shader);
    }

}

export { MeshRenderer };