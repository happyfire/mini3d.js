import { Shader } from "../core/shader";

let LightMode = {
    None: 0,
    ForwardBase: 1,
    ForwardAdd: 2,
    ShadowCaster: 3
}

class RenderPass {
    constructor(lightMode){
        this.index = 0;
        this._shader = null;
        this._lightMode = lightMode;
    }

    set shader(v){
        this._shader = v;
    }

    get shader(){
        return this._shader;
    }

    get lightMode(){
        return this._lightMode;
    }

}

export { LightMode, RenderPass };