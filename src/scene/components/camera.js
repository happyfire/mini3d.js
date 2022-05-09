import { Matrix4 } from '../../math/matrix4'
import { Component } from './Component';
import { RenderTexture } from '../../core/renderTexture';
import { canvas, gl } from '../../core/gl';
import { PostProcessingChain } from '../../postprocessing/postProcessingChain';

class Camera extends Component{
    constructor(){
        super();

        this._fovy = 75;
        this._aspect = 0.75;
        this._near = 0.1;
        this._far = 100.0;
        this._projMatrix = new Matrix4();
        this._viewMatrix = new Matrix4();
        this._viewProjMatrix = new Matrix4();

        this._clearColor = [0, 0, 0];
        this._renderTexture = null;
        this._tempRenderTexture = null;
        this._postProcessingChain = null;
    }

    set clearColor(v){
        this._clearColor = v;
    }

    set target(v){
        this._renderTexture = v;
        this._onTargetResize(this._renderTexture.width, this._renderTexture.height);
    }

    get target(){
        return this._renderTexture;
    }

    getViewProjMatrix(){
        return this._viewProjMatrix;
    }

    setPerspective(fovy, aspect, near, far){
        this._fovy = fovy;
        this._aspect = aspect;
        this._near = near;
        this._far = far; 
        this._projMatrix.setPerspective(this._fovy, this._aspect, this._near, this._far);
    }

    setOrtho(left, right, bottom, top, near, far){ 
        this._projMatrix.setOrtho(left, right, bottom, top, near, far);        
    }

    onScreenResize(width, height){
        if(this._renderTexture==null){
            this._onTargetResize(width, height);
        } else if(this._renderTexture.isFullScreen){
            this._onTargetResize(width, height);
            this._renderTexture.onScreenResize(width, height);
        }
    }

    _onTargetResize(width, height){
        this._aspect = width/height;
        this._projMatrix.setPerspective(this._fovy, this._aspect, this._near, this._far); 
    }

    _updateViewProjMatrix(){
        this._viewProjMatrix.set(this._projMatrix);   
        this._viewProjMatrix.multiply(this._viewMatrix);
    }

    //TODO: 渲染相关代码从Camera中拿出来（为以后实现不同的scene renderer做准备）
    //TODO: ShadowMap渲染只需要灯光矩阵和renderTexture，所以要从camera中解耦这些
    beforeRender(){
        if(this._renderTexture!=null){
            this._renderTexture.bind();
        }

        this._viewMatrix.setInverseOf(this.node.worldMatrix);
        
        this._updateViewProjMatrix();//TODO:不需要每次渲染之前都重新计算，当proj矩阵需重新计算（例如screen resize，动态修改fov之后），或camera的world matrix变化了需要重新计算view matrix

        //TODO:每个camera设置自己的clear color，并且在gl层缓存，避免重复设置相同的值
        gl.clearColor(this._clearColor[0], this._clearColor[1], this._clearColor[2], 1);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);

        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);                
    }

    afterRender(){
        if(this._renderTexture!=null){
            this._renderTexture.unbind();
        }

        if(this._postProcessingChain){
            this._postProcessingChain.render(this);
        }
    }

    enablePostProcessing(enabled){
        if(enabled){
            this._tempRenderTexture = new RenderTexture(canvas.width, canvas.height, true);
            this.target = new RenderTexture(canvas.width, canvas.height, true);
            this._postProcessingChain = new PostProcessingChain(this);
        } else {
            if(this._tempRenderTexture){
                this._tempRenderTexture.destroy();
                this._tempRenderTexture = null;
            }
            if(this._renderTexture){
                this._renderTexture.destroy();
                this._renderTexture = null;
            }
            if(this._postProcessingChain){
                this._postProcessingChain.destroy();
                this._postProcessingChain = null;
            }
        }
    }

    addPostProcessing(postEffectLayer){
        if(this._postProcessingChain==null){
            this.enablePostProcessing(true);
        }
        
        this._postProcessingChain.add(postEffectLayer);
    }

}

export { Camera };