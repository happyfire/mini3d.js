import { ScreenQuard } from '../../geometry/screenQuard';
import { gl } from '../../core/gl';

class PostProcessing {
    constructor(){
        this._quardMesh = ScreenQuard.createMesh();
        this._materials = [];
    }

    add(material){
        this._materials.push(material);
    }

    render(camera){
        gl.depthFunc(gl.ALWAYS);
        gl.depthMask(false);

        let matCnt = this._materials.length;

        let srcTexture = camera._renderTexture;
        let dstTexture = matCnt > 1 ? camera._tempRenderTexture : null;

        for(let i=0; i<matCnt; ++i){
            let material = this._materials[i];

            if(dstTexture){
                dstTexture.beforeRender();
            }

            for(let pass of material.renderPasses){
                material.mainTexture = srcTexture.texture2D;
                if(material.texelSize){
                    material.texelSize = srcTexture.texture2D.texelSize;
                }
                material.renderPass(this._quardMesh, null, pass);
            }

            let tmp = srcTexture;
            srcTexture = dstTexture;
            dstTexture = tmp;

            if(i==matCnt-2){
                if(dstTexture){
                    dstTexture.afterRender();
                    dstTexture = null;
                }   
            }
        }

        

        gl.depthFunc(gl.LESS);
        gl.depthMask(true);
    }
}

export { PostProcessing };