import { Shader } from "../core/shader";

class RenderPass {
    constructor(){
        this.index = 0;
        this._shader = null;
    }

    set shader(v){
        this._shader = v;
    }

    get shader(){
        return this._shader;
    }

    

}

export { RenderPass };