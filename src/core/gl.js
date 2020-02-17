let gl = null;
let canvas = null;
let _app = null;
let _prevTime = Date.now();

function init(canvasId, app){    
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
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); //Flip the image's y axis    

    _app = app;

    if(_app){
        _app.onInit();    
    }

    window.onresize = onResize;
    console.log(navigator.userAgent);

    onResize();
    loop();
};

function onResize(){
    canvas.width = Math.floor(canvas.clientWidth * window.devicePixelRatio);
    canvas.height = Math.floor(canvas.clientHeight * window.devicePixelRatio); 
    
    gl.viewport(0, 0, canvas.width, canvas.height);

    if(_app){
        _app.onResize(canvas.width, canvas.height);
    }
}

function loop(){
    let now = Date.now();
    let dt = now - _prevTime;
    _prevTime = now;

    if(_app){
        _app.onUpdate(dt);
    }
    requestAnimationFrame(loop);
}

let isMobile = function(){    
    if(navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)){
        return true;
    }else{
        return false;
    }        
}();

export { init, gl, canvas, isMobile };

