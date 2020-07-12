import { ScreenQuard } from '../../geometry/screenQuard';
import { gl } from '../../core/gl';
import { PostEffectLayer } from '../../postprocessing/postEffectLayer';

class PostProcessing {
    constructor(){
        this._quardMesh = ScreenQuard.createMesh();
        this._postEffectLayers = [];
    }

    destroy(){
        if(this._quardMesh){
            this._quardMesh.destroy();
            this._quardMesh = null;
        }
    }

    add(material){
        // this._materials.push(material);
        let layer = new PostEffectLayer(material);
        this._postEffectLayers.push(layer);
    }

    render(camera){
        gl.depthFunc(gl.ALWAYS);
        gl.depthMask(false);

        let layerCnt = this._postEffectLayers.length;
        let srcTexture = camera._renderTexture;
        let dstTexture = layerCnt > 1 ? camera._tempRenderTexture : null;

        for(let i=0; i<layerCnt; i++){
            if(i==layerCnt-1){
                dstTexture = null;
            }
            let layer = this._postEffectLayers[i];
            layer.render(srcTexture, dstTexture);
            let tmp = srcTexture;
            srcTexture = dstTexture;
            dstTexture = tmp;
        }

        

        gl.depthFunc(gl.LESS);
        gl.depthMask(true);
    }

    // render(camera){
    //     gl.depthFunc(gl.ALWAYS);
    //     gl.depthMask(false);

    //     let matCnt = this._materials.length;

    //     let srcTexture = camera._renderTexture;
    //     let dstTexture = matCnt > 1 ? camera._tempRenderTexture : null;

    //     for(let i=0; i<matCnt; ++i){
    //         let material = this._materials[i];

    //         if(dstTexture){
    //             dstTexture.bind();
    //         }

    //         for(let pass of material.renderPasses){
    //             material.mainTexture = srcTexture.texture2D;
    //             if(material.texelSize){
    //                 material.texelSize = srcTexture.texture2D.texelSize;
    //             }
    //             material.renderPass(this._quardMesh, null, pass);
    //         }

    //         let tmp = srcTexture;
    //         srcTexture = dstTexture;
    //         dstTexture = tmp;

    //         if(i==matCnt-2){
    //             if(dstTexture){
    //                 dstTexture.unbind();
    //                 dstTexture = null;
    //             }   
    //         }
    //     }

        

    //     gl.depthFunc(gl.LESS);
    //     gl.depthMask(true);
    // }
}

export { PostProcessing };