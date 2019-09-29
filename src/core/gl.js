 class GLHelper{
    static initWebGL(canvas){
        let names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
        let context = null;
        for(let i=0; i<names.length; ++i){
            try{
                context = canvas.getContext(names[i]);
            } catch(e){}
            if(context){
                break;
            }
        }
        return context;
    };
}

export { GLHelper };

