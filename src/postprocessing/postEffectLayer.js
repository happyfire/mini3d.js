import { ScreenQuard } from "../geometry/screenQuard";
import { gl } from "../core/gl";

class PostEffectLayer {
    constructor(material){
        this._material = material;
        this._quardMesh = ScreenQuard.createMesh();
    }

    blit(srcRT, dstRT, material, passId){
        if(dstRT){
            dstRT.bind();
        }
        material.mainTexture = srcRT.texture2D;
        if(material.texelSize){
            material.texelSize = srcRT.texture2D.texelSize;
        }
        material.renderPass(this._quardMesh, null, material.renderPasses[passId]);
        if(dstRT){
            dstRT.unbind();
        }
    }

    render(srcRT, dstRT){
        
        this.blit(srcRT, dstRT, this._material, 0);
        
    }
}

export { PostEffectLayer };