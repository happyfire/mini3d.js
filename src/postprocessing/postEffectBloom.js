import { PostEffectLayer } from "./postEffectLayer";
import { MatPP_Bloom } from "./material/matPP_Bloom";


class PostEffectBloom extends PostEffectLayer{
    constructor(){
        super(new MatPP_Bloom());

        //亮度阈值
        this._brightThreshold = 0.6;

        //模糊迭代次数（每次迭代分别执行一次竖直和水平方向高斯模糊）
        this._iterations = 3;   //0~4

        //每迭代一次的模糊尺寸扩散速度（值越大越模糊）
        this._blurSpread = 0.6; //0.2~3

        //RT缩小系数，值越大越模糊
        this._downSample = 2; //1~8
    }

    set brightThreshold(v){
        this._brightThreshold = v;
    }

    set iterations(v){
        this._iterations = v;
    }

    set blurSpread(v){
        this._blurSpread = v;
    }

    set downSample(v){
        this._downSample = v;
    }

    render(chain, srcRT, dstRT){
        this._material.brightThreshold = this._brightThreshold;

        let rtW = srcRT.width / this._downSample;
        let rtH = srcRT.height / this._downSample;

        let buffer0 = chain.getTempRT(rtW, rtH);
        chain.blit(srcRT, buffer0, this._material, 0); //Pass0: extract brightness

        for(let i=0; i<this._iterations; ++i){
            this._material.blurSize = 1.0 + i * this._blurSpread;
            let buffer1 = chain.getTempRT(rtW, rtH);

            // render the vertical pass
            chain.blit(buffer0, buffer1, this._material, 1);
            chain.releaseTempRT(buffer0);
            
            buffer0 = buffer1;
            buffer1 = chain.getTempRT(rtW, rtH);

            // render the horizontal pass
            chain.blit(buffer0, buffer1, this._material, 2);
            chain.releaseTempRT(buffer0);
            buffer0 = buffer1;
        }

        this._material.bloomTexture = buffer0.texture2D;
        chain.blit(srcRT, dstRT, this._material, 3); //Pass3: merge bloom

        chain.releaseTempRT(buffer0);
    }
}

export { PostEffectBloom };