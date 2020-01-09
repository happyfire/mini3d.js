var mini3d = (function (exports) {
   'use strict';

   exports.gl = null;
   exports.canvas = null;

   function init(canvasId){    
       if(canvasId != null){
           exports.canvas = document.getElementById(canvasId);
           if(exports.canvas === undefined){
               console.error("cannot find a canvas named:"+canvasId);
               return;
           }
       } else {
           exports.canvas = document.createElement("canvas");       
           document.body.appendChild(exports.canvas);       
       }
      
       exports.canvas.width = Math.floor(exports.canvas.clientWidth * window.devicePixelRatio);
       exports.canvas.height = Math.floor(exports.canvas.clientHeight * window.devicePixelRatio);    

       let names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
       let context = null;
       for(let i=0; i<names.length; ++i){
           try{
               context = exports.canvas.getContext(names[i]);
           } catch(e){}
           if(context){
               break;
           }
       }
       exports.gl = context;
       exports.gl.viewport(0, 0, exports.canvas.width, exports.canvas.height);
   }

   class Matrix4 {
       constructor(){
           this.elements = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
       }

       /**
        * Set the identity matrix.
        */
       setIdentity(){
           let e = this.elements;
           e[0] = 1; e[4] = 0; e[8] = 0;  e[12] = 0;
           e[1] = 0; e[5] = 1; e[9] = 0;  e[13] = 0;
           e[2] = 0; e[6] = 0; e[10] = 1; e[14] = 0;
           e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
           return this;
       }

       /**
        * Copy matrix.
        */
       set(other){
           let src = other.elements;
           let dst = this.elements;
           if(src === dst){
               return this;
           }

           for(let i=0; i<16; i++){
               dst[i] = src[i];
           }

           return this;
       }

       /**
        * Multiply the matrix from the right.
        * @param {Matrix4} other The multiply matrix
        * @returns this 
        */
       multiply(other){
           let i, e, a, b, ai0, ai1, ai2, ai3;
     
           // Calculate e = a * b
           e = this.elements;
           a = this.elements;
           b = other.elements;
           
           // If e equals b, copy b to temporary matrix.
           if (e === b) {
               b = new Float32Array(16);
               for (i = 0; i < 16; ++i) {
                   b[i] = e[i];
               }
           }
           
           for (i = 0; i < 4; i++) {
               ai0=a[i];  ai1=a[i+4];  ai2=a[i+8];  ai3=a[i+12];
               e[i]    = ai0 * b[0]  + ai1 * b[1]  + ai2 * b[2]  + ai3 * b[3];
               e[i+4]  = ai0 * b[4]  + ai1 * b[5]  + ai2 * b[6]  + ai3 * b[7];
               e[i+8]  = ai0 * b[8]  + ai1 * b[9]  + ai2 * b[10] + ai3 * b[11];
               e[i+12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
           }
           
           return this;
       }

       /**
        * Set the matrix for translation.
        */
       setTranslate(x,y,z){
           let e = this.elements;
           e[0] = 1; e[4] = 0; e[8] = 0;  e[12] = x;
           e[1] = 0; e[5] = 1; e[9] = 0;  e[13] = y;
           e[2] = 0; e[6] = 0; e[10] = 1; e[14] = z;
           e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
           return this;
       }

       /**
        * Multiply the matrix for translation from the right. 
        */
       translate(x, y, z) {
           let e = this.elements;
           e[12] += e[0] * x + e[4] * y + e[8]  * z;
           e[13] += e[1] * x + e[5] * y + e[9]  * z;
           e[14] += e[2] * x + e[6] * y + e[10] * z;
           e[15] += e[3] * x + e[7] * y + e[11] * z;
           return this;
       };

       /**
        * Set the matrix for scaling.
        */
       setScale(sx, sy, sz){
           let e = this.elements;
           e[0] = sx; e[4] = 0;  e[8] = 0;   e[12] = 0;
           e[1] = 0;  e[5] = sy; e[9] = 0;   e[13] = 0;
           e[2] = 0;  e[6] = 0;  e[10] = sz; e[14] = 0;
           e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
           return this;
       }  
       
       /**
        * Multiply the matrix for scaling from the right.
        */
       scale(sx, sy, sz){
           let e = this.elements;
           e[0] *= sx; e[4] *= sy;  e[8] *= sz;
           e[1] *= sx; e[5] *= sy;  e[9] *= sz;
           e[2] *= sx; e[6] *= sy;  e[10] *= sz;
           e[3] *= sx; e[7] *= sy;  e[11] *= sz;
           return this;
       }

       /**
        * Set the matrix for rotation.
        * The vector of rotation axis may not be normalized.
        * @param angle The angle of rotation (degrees)
        * @param x The X coordinate of vector of rotation axis. 
        * @param y The Y coordinate of vector of rotation axis.
        * @param z The Z coordinate of vector of rotation axis.
        */
       setRotate(angle, x, y, z){
           let e, s, c, len, rlen, nc, xy, yz, zx, xs, ys, zs;

           angle = Math.PI * angle / 180;
           e = this.elements;

           s = Math.sin(angle);
           c = Math.cos(angle);

           if (0 !== x && 0 === y && 0 === z) {
               // Rotation around X axis
               if (x < 0) {
               s = -s;
               }
               e[0] = 1;  e[4] = 0;  e[ 8] = 0;  e[12] = 0;
               e[1] = 0;  e[5] = c;  e[ 9] =-s;  e[13] = 0;
               e[2] = 0;  e[6] = s;  e[10] = c;  e[14] = 0;
               e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
           } else if (0 === x && 0 !== y && 0 === z) {
               // Rotation around Y axis
               if (y < 0) {
               s = -s;
               }
               e[0] = c;  e[4] = 0;  e[ 8] = s;  e[12] = 0;
               e[1] = 0;  e[5] = 1;  e[ 9] = 0;  e[13] = 0;
               e[2] =-s;  e[6] = 0;  e[10] = c;  e[14] = 0;
               e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
           } else if (0 === x && 0 === y && 0 !== z) {
               // Rotation around Z axis
               if (z < 0) {
               s = -s;
               }
               e[0] = c;  e[4] =-s;  e[ 8] = 0;  e[12] = 0;
               e[1] = s;  e[5] = c;  e[ 9] = 0;  e[13] = 0;
               e[2] = 0;  e[6] = 0;  e[10] = 1;  e[14] = 0;
               e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
           } else {
               // Rotation around another axis
               len = Math.sqrt(x*x + y*y + z*z);
               if (len !== 1) {
               rlen = 1 / len;
               x *= rlen;
               y *= rlen;
               z *= rlen;
               }
               nc = 1 - c;
               xy = x * y;
               yz = y * z;
               zx = z * x;
               xs = x * s;
               ys = y * s;
               zs = z * s;

               e[ 0] = x*x*nc +  c;
               e[ 1] = xy *nc + zs;
               e[ 2] = zx *nc - ys;
               e[ 3] = 0;

               e[ 4] = xy *nc - zs;
               e[ 5] = y*y*nc +  c;
               e[ 6] = yz *nc + xs;
               e[ 7] = 0;

               e[ 8] = zx *nc + ys;
               e[ 9] = yz *nc - xs;
               e[10] = z*z*nc +  c;
               e[11] = 0;

               e[12] = 0;
               e[13] = 0;
               e[14] = 0;
               e[15] = 1;
           }

           return this;
       }

       /**
        * Multiply the matrix for rotation from the right.
        * The vector of rotation axis may not be normalized.
        */
       rotate(angle, x, y, z){
           return this.multiply(new Matrix4().setRotate(angle, x, y, z));
       }

       /**
        * Set the viewing matrix.
        * @param eyeX, eyeY, eyeZ The position of the eye point.
        * @param centerX, centerY, centerZ The position of the reference point.
        * @param upX, upY, upZ The direction of the up vector.
        * @return this
        */
       setLookAt(eyeX, eyeY, eyeZ, targetX, targetY, targetZ, upX, upY, upZ){
           // N = eye - target
           let nx, ny, nz;
           nx = eyeX - targetX;
           ny = eyeY - targetY;
           nz = eyeZ - targetZ;
           let rl = 1/Math.sqrt(nx*nx+ny*ny+nz*nz);
           nx *= rl;
           ny *= rl;
           nz *= rl;
           // U = UP cross N
           let ux, uy, uz;
           ux = upY * nz - upZ * ny;
           uy = upZ * nx - upX * nz;
           uz = upX * ny - upY * nx;
           rl = 1/Math.sqrt(ux*ux+uy*uy+uz*uz);
           ux *= rl;
           uy *= rl;
           uz *= rl;
           // V = N cross U
           let vx, vy, vz;
           vx = ny * uz - nz * uy;
           vy = nz * ux - nx * uz;
           vz = nx * uy - ny * ux;
           rl = 1/Math.sqrt(vx*vx+vy*vy+vz*vz);
           vx *= rl;
           vy *= rl;
           vz *= rl;
       
           let e = this.elements;
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
       }

       setOrtho(left, right, bottom, top, near, far){ 
           if (left === right || bottom === top || near === far) {
               console.error("wrong param");
               return;
           }

           let rw = 1 / (right - left);
           let rh = 1 / (top - bottom);
           let rd = 1 / (far - near);

           let e = this.elements;

           e[0]  = 2 * rw;
           e[1]  = 0;
           e[2]  = 0;
           e[3]  = 0;

           e[4]  = 0;
           e[5]  = 2 * rh;
           e[6]  = 0;
           e[7]  = 0;

           e[8]  = 0;
           e[9]  = 0;
           e[10] = -2 * rd;
           e[11] = 0;

           e[12] = -(right + left) * rw;
           e[13] = -(top + bottom) * rh;
           e[14] = -(far + near) * rd;
           e[15] = 1;

           return this;
       }

       setFrustum(left, right, bottom, top, near, far){
           if (left === right || bottom === top || near === far) {
               console.error("wrong param");
               return;
           }
           if(near <= 0){
               console.error("wrong near");
               return;
           }
           if(far <= 0){
               console.error("wrong far");
               return;
           }

           let rw = 1 / (right - left);
           let rh = 1 / (top - bottom);
           let rd = 1 / (far - near);

           let e = this.elements;

           e[0]  = 2 * near * rw;
           e[1]  = 0;
           e[2]  = 0;
           e[3]  = 0;

           e[4]  = 0;
           e[5]  = 2 * near * rh;
           e[6]  = 0;
           e[7]  = 0;

           e[8]  = (right + left) * rw;
           e[9]  = (top + bottom) * rh;
           e[10] = -(far + near) * rd;
           e[11] = -1;

           e[12] = 0;
           e[13] = 0;
           e[14] = -2 * near * far * rd;
           e[15] = 0;

           return this;
       }

       setPerspective(fovy, aspect, near, far){
           if(near === far || aspect === 0 || near <= 0 || far <= 0){
               console.error("wrong param");
               return;
           }

           let radius = fovy * Math.PI / 180 / 2;
           let sin = Math.sin(radius);
           if(sin === 0){
               console.error("wrong param");
               return;
           }
           let cot = Math.cos(radius) / sin;
           let rd = 1 / (far - near);
          
           let e =  this.elements;
           e[0] = cot / aspect;
           e[1] = 0;
           e[2] = 0;
           e[3] = 0;

           e[4] = 0;
           e[5] = cot;
           e[6] = 0;
           e[7] = 0;

           e[8] = 0;
           e[9] = 0;
           e[10] = -(far + near) * rd;
           e[11] = -1;

           e[12] = 0;
           e[13] = 0;
           e[14] = -2 * near * far * rd;
           e[15] = 0;

           return this;
       }
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
           this._semanticToAttribName = {}; // {[semantic:string]:string}
           this._attributes = {}; // {[name:string]:number}
           this._uniforms = {};  // {[name:string]:WebGLUniformLocation}
       }

       mapAttributeSemantic(semantic, attribName){
           this._semanticToAttribName[semantic] = attribName;
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

       getAttributeLocation(semantic){
           let name = this._semanticToAttribName[semantic];
           if(name){
               let location = this._attributes[name];
               return location;
           } else {
               console.error('Shader: can not find attribute for semantic '+semantic);
               return -1;
           }
       }    

       use(){
           if(this.program){
               exports.gl.useProgram(this.program);
           }
       }

   }

   let VertexSemantic = {    
       POSITION : 'position',        
       NORMAL : 'normal',
       TANGENT : 'tangent',
       COLOR : 'color',
       UV0 : 'uv0',
       UV1 : 'uv1',  
       UV2 : 'uv2', 
       UV3 : 'uv3'
   };

   //mini3d顶点使用float32类型

   class VertexFormat{
       constructor(){
           this.attribs = [];
           this.attribSizeMap = {};
           this._vertexSize = 0;
       }

       addAttrib(attribSemantic, size){       
           this.attribs.push(attribSemantic); 
           this.attribSizeMap[attribSemantic] = size;        
       }

       getVertexSize(){
           if(this._vertexSize === 0){          
               for(let i=0; i<this.attribs.length; ++i){
                   let semantic = this.attribs[i];
                   this._vertexSize += this.attribSizeMap[semantic];
               }
           }        
           return this._vertexSize;
       }
   }

   class VertexAttribInfo{
       constructor(attribSemantic, attribSize){
           this.semantic = attribSemantic;
           this.size = attribSize;
           this.offset = 0;
           this.data = null;
       }
   }

   class VertexBuffer{
       constructor(vertexFormat){
           this._vertexCount = 0;
           this._vertexStride = 0; // vertex data size in byte
           this._vertexFormat = vertexFormat;
           this._attribsInfo = {};
           this._bufferData = null;

           this.BYTES_PER_ELEMENT = 4; // for Float32Array

           let attribNum = this._vertexFormat.attribs.length;
           for(let i=0; i<attribNum; ++i){
               let semantic = this._vertexFormat.attribs[i];
               let size = this._vertexFormat.attribSizeMap[semantic];
               if(size==null){
                   console.error('VertexBuffer: bad semantic');
               } else {
                   let info = new VertexAttribInfo(semantic, size);
                   this._attribsInfo[semantic] = info;
               }            
           }

           this._vbo = exports.gl.createBuffer();
       }

       setData(semantic, data){
           this._attribsInfo[semantic].data = data;
       }

       get vbo(){
           return this._vbo;
       }

       get vertexCount(){
           return this._vertexCount;
       }

       get vertexStride(){
           return this._vertexStride;
       }

       destroy(){
           exports.gl.deleteBuffer(this._vbo);  
           this._vbo = 0;      
       }

       //combine vertex attribute datas to a data array
       _compile(){
           let positionInfo = this._attribsInfo[VertexSemantic.POSITION];
           if(positionInfo == null){
               console.error('VertexBuffer: no attrib position');
               return;
           }
           if(positionInfo.data == null || positionInfo.data.length===0){
               console.error('VertexBuffer: position data is empty');
               return;
           }

           this._vertexCount = positionInfo.data.length / positionInfo.size;  
           this._vertexStride = this._vertexFormat.getVertexSize() * this.BYTES_PER_ELEMENT; 
           
           this._bufferData = [];
           for(let i=0; i<this._vertexCount; ++i){
               for(let semantic of this._vertexFormat.attribs){
                   let info = this._attribsInfo[semantic];
                   if(info==null || info.data==null){
                       console.error('VertexBuffer: bad semantic '+semantic);
                       continue;
                   }
                   for(let k=0; k<info.size; ++k){
                       let value = info.data[ i * info.size + k ];
                       if(value===undefined){
                           console.error('VertexBuffer: missing value for '+semantic);
                       }
                       this._bufferData.push(value);
                   }
               }            
           }

           //compute offset for attrib info, and free info.data
           let offset = 0;
           for(let semantic of this._vertexFormat.attribs){
               let info = this._attribsInfo[semantic];
               info.offset = offset;
               info.data = null;
               offset += info.size * this.BYTES_PER_ELEMENT;
           }
       }

       //upload data to webGL, add free buffer data
       upload(){
           this._compile();

           let buffer = new Float32Array(this._bufferData);

           exports.gl.bindBuffer(exports.gl.ARRAY_BUFFER, this._vbo);
           exports.gl.bufferData(exports.gl.ARRAY_BUFFER, buffer, exports.gl.STATIC_DRAW);
           exports.gl.bindBuffer(exports.gl.ARRAY_BUFFER, null);
                     
           this._bufferData = null;
       }

       bindAttrib(shader){
           for(let semantic of this._vertexFormat.attribs){
               let info = this._attribsInfo[semantic];
               
               let location = shader.getAttributeLocation(semantic);
               if(location>=0){
                   exports.gl.vertexAttribPointer(location, 
                       info.size, 
                       exports.gl.FLOAT, //type 
                       false, //normalized, 
                       this._vertexStride, 
                       info.offset);
                   exports.gl.enableVertexAttribArray(location);
               }                          
           }
       }

       unbindAttrib(shader){
           for(let semantic of this._vertexFormat.attribs){            
               let location = shader.getAttributeLocation(semantic);
               if(location>=0){
                   exports.gl.disableVertexAttribArray(location);
               }                          
           }        
       }
   }

   class IndexBuffer{
       constructor(){
           this._indexCount = 0;
           this._mode = exports.gl.TRIANGLES;
           this._type = exports.gl.UNSIGNED_SHORT;
           this._vbo = exports.gl.createBuffer();
           this._bufferData = null;
       }

       setData(data){
           this._bufferData = data;
       }

       get vbo(){
           return this._vbo;
       }

       get indexCount(){
           return this._indexCount;
       }

       get mode(){
           return this._mode;
       }

       get type(){
           return this._type;
       }

       destroy(){
           exports.gl.deleteBuffer(this._vbo);  
           this._vbo = 0;
       }

       upload(){
           if(this._bufferData==null){
               console.error("buffer data is null.");
               return;
           }
           let useByte = this._bufferData.length<=256;
           let buffer = useByte ? new Uint8Array(this._bufferData) : new Uint16Array(this._bufferData);
           this._type = useByte ? exports.gl.UNSIGNED_BYTE : exports.gl.UNSIGNED_SHORT;
           
           exports.gl.bindBuffer(exports.gl.ELEMENT_ARRAY_BUFFER, this._vbo);
           exports.gl.bufferData(exports.gl.ELEMENT_ARRAY_BUFFER, buffer, exports.gl.STATIC_DRAW);
           exports.gl.bindBuffer(exports.gl.ELEMENT_ARRAY_BUFFER, null);

           this._indexCount = buffer.length;
           this._bufferData = null;
       }
   }

   class Mesh{    
       constructor(vertexFormat){        
           this._vertexBuffer = new VertexBuffer(vertexFormat);
           this._indexBuffer = null;
       }

       setVertexData(semantic, data){
           this._vertexBuffer.setData(semantic, data);        
       }  
       
       setTriangles(data){
           if(this._indexBuffer==null){
               this._indexBuffer = new IndexBuffer();            
           }
           this._indexBuffer.setData(data);
       }

       destroy(){
           this._vertexBuffer.destroy();    
       }      

       upload(){        
           this._vertexBuffer.upload();   
           if(this._indexBuffer){
               this._indexBuffer.upload();
           }                            
       }

       render(shader){
           exports.gl.bindBuffer(exports.gl.ARRAY_BUFFER, this._vertexBuffer.vbo);
           
           this._vertexBuffer.bindAttrib(shader);
                     
           if(this._indexBuffer){
               exports.gl.bindBuffer(exports.gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer.vbo);
               exports.gl.drawElements(this._indexBuffer.mode, this._indexBuffer.indexCount, this._indexBuffer.type, 0);
               exports.gl.bindBuffer(exports.gl.ELEMENT_ARRAY_BUFFER, null);
           } else {
               exports.gl.drawArrays(exports.gl.TRIANGLES, 0, this._vertexBuffer.vertexCount);
           }
           
           this._vertexBuffer.unbindAttrib(shader);

           exports.gl.bindBuffer(exports.gl.ARRAY_BUFFER, null);
       }
   }

   class ImageAsset{
       constructor(name, data){
           this.name = name;
           this.data = data;        
       }

       get width(){
           return this.data.width;
       }

       get height(){
           return this.data.height;
       }
   }

   class ImageLoader {
       loadAsset(name, onComplete){
           let image = new Image();
           image.onload = function(){
               let asset = new ImageAsset(name, image);
               if(onComplete){
                   onComplete(asset);
               }            
           };
       }
   }

   class TextAsset{
       constructor(name, data){
           this.name = name;
           this.data = data;        
       }    
   }

   class TextLoader {
       loadAsset(name, onComplete){
           let request = new XMLHttpRequest();
           request.onreadystatechange = function(){
               if(request.readyState === XMLHttpRequest.DONE && request.status !== 404){
                   let asset = new TextAsset(name, request.responseText);
                   if(onComplete){
                       onComplete(asset);
                   }   
               }
           };       
           request.open('GET', name, true);
           request.send();
       }
   }

   let AssetType = {
       Text : 'text',
       Image : 'image'    
   };

   class AssetManager {
       
       constructor(){
           this._loaders = {};
           this._assets = {};

           this.addLoader(AssetType.Image, new ImageLoader());
           this.addLoader(AssetType.Text, new TextLoader());
       }

       addLoader(assetType, loader){
           this._loaders[assetType] = loader;
       }

       loadAsset(name, type, onComplete){
           if(this._assets[name]){
               if(onComplete){
                   onComplete(this._assets[name]);
               }
               return;
           }

           let loader = this._loaders[type];
           if(loader){
               loader.loadAsset(name, function(asset){
                   this._assets[name] = asset;
                   if(onComplete){
                       onComplete(asset);
                   }
               }.bind(this));
           } else {
               console.error("missing loader for asset type "+type);
           }
       }

       getAsset(name){
           return this._assets[name];        
       }

       //assetList: [[name,type]]
       loadAssetList(assetList, onAllComplete){
           let remainCount = assetList.length;
           for(let listItem of assetList){
               let name = listItem[0];
               let type = listItem[1];
               this.loadAsset(name, type, function(asset){
                   if(asset){
                       remainCount--;
                       if(remainCount===0 && onAllComplete){
                           onAllComplete();
                       }
                   } else {
                       console.error('fail to load asset '+name);
                   }
               });
           }
       }

   }

   let assetManager = new AssetManager();

   exports.AssetType = AssetType;
   exports.IndexBuffer = IndexBuffer;
   exports.Matrix4 = Matrix4;
   exports.Mesh = Mesh;
   exports.Shader = Shader;
   exports.VertexBuffer = VertexBuffer;
   exports.VertexFormat = VertexFormat;
   exports.VertexSemantic = VertexSemantic;
   exports.assetManager = assetManager;
   exports.init = init;

   return exports;

}({}));
//# sourceMappingURL=mini3d.js.map
