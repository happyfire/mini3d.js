Mini3dBase = function(){

    var initWebGL = function(canvas){
        var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
        var context = null;
        for(var i=0; i<names.length; ++i){
            try{
                context = canvas.getContext(names[i]);
            } catch(e){}
            if(context){
                break;
            }
        }
        return context;
    }

    return {
        initWebGL: initWebGL
    }

}();