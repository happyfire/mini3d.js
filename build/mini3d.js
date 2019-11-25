var mini3d = (function (exports) {
   'use strict';

   exports.gl = null;

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
       exports.gl = context;
       exports.gl.viewport(0, 0, canvas.width, canvas.height);
   }

   class Matrix4 {
       constructor(){
           this.elements = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
       }

       translate(x, y, z) {
           var e = this.elements;
           e[12] += e[0] * x + e[4] * y + e[8]  * z;
           e[13] += e[1] * x + e[5] * y + e[9]  * z;
           e[14] += e[2] * x + e[6] * y + e[10] * z;
           e[15] += e[3] * x + e[7] * y + e[11] * z;
           return this;
       };

       /**
        * Set the viewing matrix.
        * @param eyeX, eyeY, eyeZ The position of the eye point.
        * @param centerX, centerY, centerZ The position of the reference point.
        * @param upX, upY, upZ The direction of the up vector.
        * @return this
        */
       setLookAtGL(eyeX, eyeY, eyeZ, targetX, targetY, targetZ, upX, upY, upZ){
           // N = eye - target
           var nx, ny, nz;
           nx = eyeX - targetX;
           ny = eyeY - targetY;
           nz = eyeZ - targetZ;
           var rl = 1/Math.sqrt(nx*nx+ny*ny+nz*nz);
           nx *= rl;
           ny *= rl;
           nz *= rl;
           // U = UP cross N
           var ux, uy, uz;
           ux = upY * nz - upZ * ny;
           uy = upZ * nx - upX * nz;
           uz = upX * ny - upY * nx;
           rl = 1/Math.sqrt(ux*ux+uy*uy+uz*uz);
           ux *= rl;
           uy *= rl;
           uz *= rl;
           // V = N cross U
           var vx, vy, vz;
           vx = ny * uz - nz * uy;
           vy = nz * ux - nx * uz;
           vz = nx * uy - ny * ux;
           rl = 1/Math.sqrt(vx*vx+vy*vy+vz*vz);
           vx *= rl;
           vy *= rl;
           vz *= rl;
       
           var e = this.elements;
           e[0] = ux;
           e[1] = vx;
           e[2] = nx;
           e[3] = 0;
       
           e[4] = uy;
           e[5] = vy;
           e[6] = ny;
           e[7] = 0;
       
           e[8] = uz;
           e[9] = vz;
           e[10] = nz;
           e[11] = 0;
       
           e[12] = 0;
           e[13] = 0;
           e[14] = 0;
           e[15] = 1;
       
           return this.translate(-eyeX, -eyeY, -eyeZ);
       };
   }

   class UniformInfo{
       constructor(name, location, type, size, isArray){
           this.name = name;
           this.location = location; //WebGLUniformLocation
           this.type = type;
           this.size = size;   
           this.isArray = isArray;     
       }
   }

   class Shader{
       
       constructor(){          
           this.program = null;   
           this._attributes = {}; // {[name:string]:number}
           this._uniforms = {};  // {[name:string]:WebGLUniformLocation}
       }

       create(vshader, fshader){
           let vertexShader = this.loadShader(exports.gl.VERTEX_SHADER, vshader);
           let fragmentShader = this.loadShader(exports.gl.FRAGMENT_SHADER, fshader);
           if (!vertexShader || !fragmentShader) {
               return false;
           }

           // Create a program object
           this.program = exports.gl.createProgram();
           if (!this.program) {
               return false;
           }

           // Attach the shader objects
           exports.gl.attachShader(this.program, vertexShader);
           exports.gl.attachShader(this.program, fragmentShader);

           // Link the program object
           exports.gl.linkProgram(this.program);

           // Check the result of linking
           let linked = exports.gl.getProgramParameter(this.program, exports.gl.LINK_STATUS);
           if (!linked) {
               let error = exports.gl.getProgramInfoLog(this.program);
               console.log('Failed to link program: ' + error);
               exports.gl.deleteProgram(this.program);
               exports.gl.deleteShader(fragmentShader);
               exports.gl.deleteShader(vertexShader);
               this.program = null;    
               return false;        
           }

           this.findoutAttributes();
           this.findoutUniforms();

           return true;
       }

       loadShader(type, source){
           let shader = exports.gl.createShader(type);
           if (shader == null) {
               console.log('unable to create shader');
               return null;
           }

           // Set the shader program
           exports.gl.shaderSource(shader, source);

            // Compile the shader
           exports.gl.compileShader(shader);

           // Check the result of compilation
           let compiled = exports.gl.getShaderParameter(shader, exports.gl.COMPILE_STATUS);
           if (!compiled) {
               let error = exports.gl.getShaderInfoLog(shader);
               console.log('Failed to compile shader: ' + error);
               exports.gl.deleteShader(shader);
               return null;
           }

           return shader;
       }

       findoutAttributes(){
           let attributeCount = exports.gl.getProgramParameter(this.program, exports.gl.ACTIVE_ATTRIBUTES);
           for(let i=0; i<attributeCount; ++i){
               let info = exports.gl.getActiveAttrib(this.program, i);
               if(!info){
                   break;
               }

               this._attributes[info.name] = exports.gl.getAttribLocation(this.program, info.name);
           }

           console.log('attributes',this._attributes);
       }

       findoutUniforms(){
           let uniformCount = exports.gl.getProgramParameter(this.program, exports.gl.ACTIVE_UNIFORMS);
           for(let i=0; i<uniformCount; ++i){
               let info = exports.gl.getActiveUniform(this.program, i);
               if(!info){
                   break;
               }

               let location = exports.gl.getUniformLocation(this.program, info.name);
               let isArray = info.size > 1 && info.name.substr(-3) === '[0]';
               let uniformInfo = new UniformInfo(info.name, location, info.type, info.size, isArray);
               this._uniforms[info.name] = uniformInfo;
           }

           console.log('uniforms',this._uniforms);
       }

       setUniform(name, value){
           let info = this._uniforms[name];
           if(!info){
               console.error('can not find uniform named '+name);
               return;
           }
           switch(info.type){
               case exports.gl.FLOAT:{
                   if(info.isArray){
                       exports.gl.uniform1fv(info.location, value);
                   } else {
                       exports.gl.uniform1f(info.location, value);
                   }
                   break;
               }
               case exports.gl.FLOAT_VEC2:{
                   exports.gl.uniform2fv(info.location, value);
                   break;
               }
               case exports.gl.FLOAT_VEC3:{
                   exports.gl.uniform3fv(info.location, value);
                   break;
               }
               case exports.gl.FLOAT_VEC4:{
                   exports.gl.uniform4fv(info.location, value);
                   break;
               }
               case exports.gl.FLOAT_MAT4:{
                   exports.gl.uniformMatrix4fv(info.location, false, value);
                   break;
               }
               default:{
                   console.error('uniform type not support', info.type);
                   break;
               }
           }
       }

       setAttribute(name, bufferAttrib){
           let location = this._attributes[name];
           if(location==null){
               console.error('can not find attribute named '+name);
               return;
           }
           exports.gl.bindBuffer(exports.gl.ARRAY_BUFFER, bufferAttrib.vbo);
           exports.gl.vertexAttribPointer(location, 
               bufferAttrib.size, 
               bufferAttrib.type, 
               bufferAttrib.normalized, 
               bufferAttrib.stride, 
               bufferAttrib.offset);
           exports.gl.enableVertexAttribArray(location);                
       }

       disableAttribute(name){
           let location = this._attributes[name];
           if(location==null){
               console.error('can not find attribute named '+name);
               return;
           }

           exports.gl.disableVertexAttribArray(location);        
       }

       use(){
           if(this.program){
               exports.gl.useProgram(this.program);
           }
       }

   }

   class BufferAttribInfo{
       constructor(vbo, size, stride, offset){
           this.vbo = vbo;
           this.size = size;
           this.type = exports.gl.FLOAT;
           this.normalized = false;
           this.stride = stride;
           this.offset = offset;
       }
   }

   class Mesh{    
       constructor(){        
           this._positions = null;
           this._posCompCnt = 3;
           this._colors= null;
           this._colorCompCnt = 3;  
           this._vbo = exports.gl.createBuffer();
           this._vcount = 0;     
           
           this._attribPos = null;
           this._attribColor = null;
       }

       get vbo(){
           return this._vbo;
       }

       get vcount(){
           return this._vcount;
       }

       destroy(){
           exports.gl.deleteBuffer(this._vbo);        
       }

       setPositions(positions, compCnt){
           this._positions = positions;
           this._posCompCnt = compCnt;
       }

       setColors(colors, compCnt){
           this._colors = colors;
           this._colorCompCnt = compCnt;
       }   

       apply(){
           if(this._positions == null || this._positions.length==0){
               return;
           }

           let vertexCount = this._positions.length / this._posCompCnt;
           let hasColor = this._colors && this._colors.length > 0;        

           let data = [];
           for(let i=0; i<vertexCount; i++){
               for(let k=0; k<this._posCompCnt; k++){
                   data.push(this._positions[i*this._posCompCnt+k]);
               }            
               if(hasColor){
                   for(let k=0; k<this._colorCompCnt; k++){
                       data.push(this._colors[i*this._colorCompCnt+k]);
                   }                
               }
           }

           let buffer = new Float32Array(data);

           this._vcount =  vertexCount;
           exports.gl.bindBuffer(exports.gl.ARRAY_BUFFER, this._vbo);
           exports.gl.bufferData(exports.gl.ARRAY_BUFFER, buffer, exports.gl.STATIC_DRAW);
           exports.gl.bindBuffer(exports.gl.ARRAY_BUFFER, null);
           
           this._FSIZE = buffer.BYTES_PER_ELEMENT;

           let vertexSize = this._posCompCnt;
           if(hasColor){
               vertexSize += this._colorCompCnt;
           }

           this._attribPos = new BufferAttribInfo(this._vbo, this._posCompCnt, vertexSize*this._FSIZE, 0);
           if(hasColor){
               this._attribColor = new BufferAttribInfo(this._vbo, this._colorCompCnt, vertexSize*this._FSIZE, this._posCompCnt*this._FSIZE);
           }
           
       }

       draw(shader){
           exports.gl.bindBuffer(exports.gl.ARRAY_BUFFER, this._vbo);
           shader.setAttribute('a_Position', this._attribPos);
           if(this._attribColor){
               shader.setAttribute('a_Color', this._attribColor);
           }
                
           exports.gl.drawArrays(exports.gl.TRIANGLES, 0, this._vcount);

           shader.disableAttribute('a_Position');
           if(this._attribColor){
               shader.disableAttribute('a_Color');
           }
           exports.gl.bindBuffer(exports.gl.ARRAY_BUFFER, null);
       }
   }

   exports.Matrix4 = Matrix4;
   exports.Mesh = Mesh;
   exports.Shader = Shader;
   exports.init = init;

   return exports;

}({}));
//# sourceMappingURL=mini3d.js.map
