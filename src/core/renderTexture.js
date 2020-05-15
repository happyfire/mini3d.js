import { gl, canvas } from "./gl";
import { Texture2D } from "./texture";

class RenderTexture{
    constructor(width, height){
        this._width = width;
        this._height = height;
        this._fbo = null;
        this._texture2D = null;
        this._depthBuffer = null;

        this._init();
    }

    get width(){
        return this._width;
    }

    get height(){
        return this._height;
    }

    get texture2D(){
        return this._texture2D;
    }

    destroy(){
        if(this._fbo){
            gl.deleteFramebuffer(this._fbo);
            this._fbo = null;
        } 
        if(this._texture2D){
            this._texture2D.destroy();
            this._texture2D = null;
        } 
        if(this._depthBuffer){
            gl.deleteRenderbuffer(this._depthBuffer);  
            this._depthBuffer = null;
        } 
    }

    _init(){
        // Create FBO
        this._fbo = gl.createFramebuffer();
        if(!this._fbo){
            console.error('Failed to create frame buffer object');
            this.destroy();
            return;
        }

        // Create a texture object and set its size and parameters
        this._texture2D = new Texture2D();
        if(!this._texture2D.id){
            console.error('Failed to create texture object');
            this.destroy();
            return;
        }
        this._texture2D.createEmpty(this._width, this._height);

        // Create a renderbuffer object and set its size and parameters
        this._depthBuffer = gl.createRenderbuffer();
        if(!this._depthBuffer){
            console.error('Failed to create renderbuffer object');
            this.destroy();
            return;
        }

        gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this._width, this._height);

        // Attach the texture and the renderbuffer object to the FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._texture2D.id, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._depthBuffer);

        // Check if FBO is configured correctly
        let e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if(gl.FRAMEBUFFER_COMPLETE !== e){
            console.error('Frame buffer object is incomplete: '+ e.toString());
            this.destroy();
            return;
        }

        // Unbind the buffer object
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);        
    }

    beforeRender(){
        if(!this._fbo || !this._texture2D || !this._depthBuffer){
            console.error("Render texture is invalid.");
            return;
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
        gl.viewport(0, 0, this._width, this._height);
    }

    afterRender(){
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
}

export { RenderTexture };