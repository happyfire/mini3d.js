let gl = null;

function init(canvasId, width=-1, height=-1){
    let canvas;
    if(canvasId != null){
        canvas = document.getElementById(canvasId);
        if(canvas === undefined){
            console.error("cannot find a canvas named:"+canvasId);
            return;
        }
    } else {
        canvas = document.createElement("canvas");       
        document.body.appendChild(canvas);
        canvas.width = 400;
        canvas.height = 400;
    }

    if(width > 0 && height > 0){
        canvas.width = width;
        canvas.height = height;
    }

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
    gl = context;
};

export { init, gl };

