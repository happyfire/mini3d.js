import { inputManager } from "../input/inputManager";

let gl = null;
let canvas = null;
let _app = null;
let _prevTime = Date.now();

let glAbility = {};

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

    gl = canvas.getContext("webgl2");
    if(gl!=null){        
        glAbility.WebGL2 = true;
    } else {
        let names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];        
        for(let i=0; i<names.length; ++i){
            try{
                gl = canvas.getContext(names[i]);
            } catch(e){}
            if(gl){
                break;
            }
        }        
        if(gl==null){
            console.error("WebGL not supported.");
            return;
        }
    }

    
    glCheck();

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); //Flip the image's y axis    

    gl.enable(gl.CULL_FACE); //TODO: 状态管理和shadow states

    _app = app;

    inputManager.init(canvas);

    if(_app){
        _app.onInit();    
    }

    window.onresize = onResize;
    console.log(navigator.userAgent);

    onResize();
    loop();
};

//检查gl能力
function glCheck(){    
    glAbility.MAX_TEXTURE_SIZE = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    glAbility.MAX_VIEWPORT_DIMS = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
    glAbility.MAX_CUBE_MAP_TEXTURE_SIZE = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
    glAbility.MAX_RENDERBUFFER_SIZE = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
    //Shaders
    glAbility.MAX_VERTEX_ATTRIBS = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    glAbility.MAX_VERTEX_UNIFORM_VECTORS = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
    glAbility.MAX_VARYING_VECTORS = gl.getParameter(gl.MAX_VARYING_VECTORS);
    glAbility.MAX_COMBINED_TEXTURE_IMAGE_UNITS = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    glAbility.MAX_VERTEX_TEXTURE_IMAGE_UNITS = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    glAbility.MAX_TEXTURE_IMAGE_UNITS = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    glAbility.MAX_FRAGMENT_UNIFORM_VECTORS = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);

    //WebGL 2
    if(glAbility.WebGL2){
        glAbility.MAX_3D_TEXTURE_SIZE = gl.getParameter(gl.MAX_3D_TEXTURE_SIZE);
        glAbility.MAX_ELEMENTS_VERTICES = gl.getParameter(gl.MAX_ELEMENTS_VERTICES);
        glAbility.MAX_ELEMENTS_INDICES = gl.getParameter(gl.MAX_ELEMENTS_INDICES);
        glAbility.MAX_TEXTURE_LOD_BIAS = gl.getParameter(gl.MAX_TEXTURE_LOD_BIAS);
        glAbility.MAX_FRAGMENT_UNIFORM_COMPONENTS = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_COMPONENTS);
        glAbility.MAX_VERTEX_UNIFORM_COMPONENTS = gl.getParameter(gl.MAX_VERTEX_UNIFORM_COMPONENTS);
        glAbility.MAX_ARRAY_TEXTURE_LAYERS = gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS);
        glAbility.MIN_PROGRAM_TEXEL_OFFSET = gl.getParameter(gl.MIN_PROGRAM_TEXEL_OFFSET);
        glAbility.MAX_PROGRAM_TEXEL_OFFSET = gl.getParameter(gl.MAX_PROGRAM_TEXEL_OFFSET);
        glAbility.MAX_VARYING_COMPONENTS = gl.getParameter(gl.MAX_VARYING_COMPONENTS);
        glAbility.MAX_VERTEX_OUTPUT_COMPONENTS = gl.getParameter(gl.MAX_VERTEX_OUTPUT_COMPONENTS);
        glAbility.MAX_FRAGMENT_INPUT_COMPONENTS = gl.getParameter(gl.MAX_FRAGMENT_INPUT_COMPONENTS);
        glAbility.MAX_SERVER_WAIT_TIMEOUT = gl.getParameter(gl.MAX_SERVER_WAIT_TIMEOUT);
        glAbility.MAX_ELEMENT_INDEX = gl.getParameter(gl.MAX_ELEMENT_INDEX);

        //draw buffers
        glAbility.MAX_DRAW_BUFFERS = gl.getParameter(gl.MAX_DRAW_BUFFERS);
        glAbility.MAX_COLOR_ATTACHMENTS = gl.getParameter(gl.MAX_COLOR_ATTACHMENTS);

        //Samplers
        glAbility.MAX_SAMPLES = gl.getParameter(gl.MAX_SAMPLES);

        //Transform feedback
        glAbility.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS = gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS);
        glAbility.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS = gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS);
        glAbility.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS = gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS);

        //Uniforms
        glAbility.MAX_VERTEX_UNIFORM_BLOCKS = gl.getParameter(gl.MAX_VERTEX_UNIFORM_BLOCKS);
        glAbility.MAX_FRAGMENT_UNIFORM_BLOCKS = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_BLOCKS);
        glAbility.MAX_COMBINED_UNIFORM_BLOCKS = gl.getParameter(gl.MAX_COMBINED_UNIFORM_BLOCKS);
        glAbility.MAX_UNIFORM_BUFFER_BINDINGS = gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS);
        glAbility.MAX_UNIFORM_BLOCK_SIZE = gl.getParameter(gl.MAX_UNIFORM_BLOCK_SIZE);
        glAbility.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS = gl.getParameter(gl.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS);
        glAbility.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS = gl.getParameter(gl.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS);
    }

    

    for(let key in glAbility){
        console.log('===>',key, glAbility[key]);
    }
    
}

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

export { init, gl, canvas, glAbility, isMobile };

