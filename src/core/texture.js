import { gl } from "./gl";

class Texture2D {
    constructor(){
        this._id = gl.createTexture();
        if (!this._id) {
            console.error('Failed to create the texture object');            
        }
    }

    destroy(){
        gl.deleteTexture(this._id);
        this._id = 0;
    }

    create(image){
        // Bind the texture object to the target
        gl.bindTexture(gl.TEXTURE_2D, this._id);
        
        // Set the texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        
        this.setClamp();
        
        // Set the texture image data
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

        gl.bindTexture(gl.TEXTURE_2D, null);

    }

    get id(){
        return this._id;
    }

    bind(unit=0){
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, this._id);
    }

    unbind(){
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    setRepeat()
    {
        gl.bindTexture(gl.TEXTURE_2D, this._id);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    }

    setClamp(){
        gl.bindTexture(gl.TEXTURE_2D, this._id);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
}

export { Texture2D };