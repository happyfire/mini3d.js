
class PostEffectLayer {
    constructor(material){
        this._material = material;
    }

    //override
    render(chain, srcRT, dstRT){
    }
}

export { PostEffectLayer };