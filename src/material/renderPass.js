import { Shader } from "../core/shader";

class RenderPass {
    constructor(){
        this.index = 0;
        this._shader = null;
    }

    create(vs, fs){
        let shader = new Shader();
        if (!shader.create(vs, fs)) {
            console.log("Failed to initialize shaders");
            //TODO: set to a default shader
            return;
        }
        this._shader = shader;
    }

    setAttributesMap(attributesMap){
        for(let attr of attributesMap){
            let semantic = attr['semantic'];
            let name = attr['name'];
            this._shader.mapAttributeSemantic(semantic, name);
        }
    }

    get shader(){
        return this._shader;
    }

    

}

export { RenderPass };