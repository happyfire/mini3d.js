let gl = null;

function init(canvasId){
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
    }
   
    canvas.width = Math.floor(canvas.clientWidth * window.devicePixelRatio);
    canvas.height = Math.floor(canvas.clientHeight * window.devicePixelRatio);    

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
    gl.viewport(0, 0, canvas.width, canvas.height);
};

export { init, gl };

