class MeshRenderer{
    constructor(){
        this.mesh = null;
        this.shader = null;
    }

    setShader(shader){
        this.shader = shader;
    }

    setMesh(mesh){
        this.mesh = mesh;
    }

    render(){
        this.mesh.render(this.shader);
    }

}

export { MeshRenderer };