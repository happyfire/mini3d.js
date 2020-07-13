import { PostEffectLayer } from "./postEffectLayer";


class PostEffectLayerOnePass extends PostEffectLayer{
    render(chain, srcRT, dstRT){
        chain.blit(srcRT, dstRT, this._material, 0);
    }
}

export { PostEffectLayerOnePass };