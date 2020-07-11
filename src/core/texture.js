import { gl, glExt, glAbility, sysConfig } from "./gl";

class Texture2D {
    constructor(){
        this._id = gl.createTexture();
        this._width = 2;
        this._height = 2;

        if (!this._id) {
            console.error('Failed to create the texture object');            
        }
    }

    destroy(){
        gl.deleteTexture(this._id);
        this._id = 0;
    }

    get width(){
        return this._width;
    }

    get height(){
        return this._height;
    }

    get texelSize(){
        return [1.0/this._width, 1.0/this._height];
    }

    create(image, withAlpha=false){
        this._width = image.width;
        this._height = image.height;

        // Bind the texture object to the target
        gl.bindTexture(gl.TEXTURE_2D, this._id);
        
        // Set the texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        
        this.setClamp();
        
        // Set the texture image data
        const level = 0;
        let internalFormat = withAlpha ? gl.RGBA : gl.RGB;
        let srcFormat = withAlpha ? gl.RGBA : gl.RGB;

        //TODO:暂时不使用sRGB，因为还要区分是普通diffuse贴图还是mask, normal map等贴图，只有颜色相关的贴图需要使用sRGB
        //实际上贴图是否使用sRGB需要根据贴图类型指定，暂时不设置，直接在shader里面处理贴图
        // if(sysConfig.gammaCorrection){
        //     if(glAbility.WebGL2){
        //         internalFormat = withAlpha ? gl.SRGB8_ALPHA8 : gl.SRGB8;
        //     } else if(glExt.sRGB){
        //         internalFormat = withAlpha ? glExt.sRGB.SRGB_ALPHA_EXT : glExt.sRGB.SRGB_EXT;
        //         srcFormat = withAlpha ? glExt.sRGB.SRGB_ALPHA_EXT : glExt.sRGB.SRGB_EXT;
        //     }
        // }
        
        const srcType = gl.UNSIGNED_BYTE;
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

        gl.bindTexture(gl.TEXTURE_2D, null);

    }

    createEmpty(width, height, withAlpha=false){
        const level = 0;
        const internalFormat = withAlpha ? gl.RGBA : gl.RGB;        
        const border = 0;
        const srcFormat = withAlpha ? gl.RGBA : gl.RGB;
        const srcType = gl.UNSIGNED_BYTE;

        this._width = width;
        this._height = height;

        gl.bindTexture(gl.TEXTURE_2D, this._id);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.bindTexture(gl.TEXTURE_2D, null);

        this.setClamp();
    }

    createDefault(){
        const level = 0;
        const internalFormat = gl.RGBA;  
        let n = 8;
        const width = n;
        const height = n;    
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        let colors = [];        
        for(let i=0; i<n; ++i){
            for(let j=0; j<n; ++j){
                (i+j)%2==0 ? colors.push(255,255,255,255) : colors.push(0,0,0,255); //RGBA                
            }
        }
        const pixelData = new Uint8Array(colors);

        this._width = width;
        this._height = height;

        gl.bindTexture(gl.TEXTURE_2D, this._id);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixelData);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    createDefaultBump(){
        const level = 0;
        const internalFormat = gl.RGB;  
        let n = 4;
        const width = n;
        const height = n;    
        const border = 0;
        const srcFormat = gl.RGB;
        const srcType = gl.UNSIGNED_BYTE;
        let colors = [];        
        for(let i=0; i<n; ++i){
            for(let j=0; j<n; ++j){            
                colors.push(128,128,255); //RGB                          
            }
        }
        const pixelData = new Uint8Array(colors);

        this._width = width;
        this._height = height;

        gl.bindTexture(gl.TEXTURE_2D, this._id);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixelData);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
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

    setRepeat(){
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