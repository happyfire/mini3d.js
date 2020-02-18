var mini3d = (function (exports) {
    'use strict';

    class EventManager{
        constructor(){
            this._eventHandlers = {};
        }

        addEventHandler(event, handler){
            let handlers = this._eventHandlers[event];
            if(handlers==null){
                this._eventHandlers[event] = [];
                handlers = this._eventHandlers[event];
            }

            if(handlers.indexOf(handler)!==-1){
                console.warn("event hander already added.");
                return;
            }
            
            handlers.push(handler);
        }

        removeEventHandler(event, handler){
            let handlers = this._eventHandlers[event];
            if(handlers!=null && handlers.length>0){
                let idx = handlers.indexOf(handler);
                if(idx>=0){
                    handlers.splice(idx, 1);
                }
            }
        }

        removeAllEventHandlers(event){
            this._eventHandlers[event] = null;
        }

        emitEvent(event, data){        
            let handlers = this._eventHandlers[event];
            if(handlers!=null && handlers.length>0){
                for(let handler of handlers){
                    handler(event, data);
                }
            }
        }
    }

    let eventManager = new EventManager();

    let SystemEvent = {
        touchStart:'touchStart',
        touchMove:'touchMove',
        touchEnd:'touchEnd',
        touchOut:'touchOut'
    };

    class InputManager{
        constructor(){        
        }

        init(canvas){
            let dragging = false;
            let lastX = -1, lastY = -1;                  
        
            let onTouchStart = function(event){   
                let x,y;
                if(event.touches){
                    let touch = event.touches[0];
                    x = touch.clientX;
                    y = touch.clientY;
                } else {
                    x = event.clientX;
                    y = event.clientY;
                }          
                            
                let rect = event.target.getBoundingClientRect();
                if(x>=rect.left && x<rect.right && y>=rect.top && y<rect.bottom){
                    lastX = x;
                    lastY = y;
                    dragging = true;  
                    
                    eventManager.emitEvent(SystemEvent.touchStart, {x:x,y:y});
                }
            };
        
            let onTouchEnd = function(event){
                dragging = false;  
                eventManager.emitEvent(SystemEvent.touchEnd);      
            };
        
            let onTouchMove = function(event){            
                let x,y;
                if(event.touches){
                    let touch = event.touches[0];
                    x = touch.clientX;
                    y = touch.clientY;
                } else {
                    x = event.clientX;
                    y = event.clientY;
                } 
                
                if(dragging){                
                    let dx = (x-lastX);
                    let dy = (y-lastY);
                    eventManager.emitEvent(SystemEvent.touchMove, {x:x,y:y,dx:dx,dy:dy});                         
                }
                lastX = x;
                lastY = y;
            };

            canvas.onmousedown = onTouchStart;
            canvas.onmouseup = onTouchEnd;
            canvas.onmousemove = onTouchMove;

            canvas.ontouchstart = onTouchStart;
            canvas.ontouchend = onTouchEnd;
            canvas.ontouchmove = onTouchMove;
        }


    }

    let inputManager = new InputManager();

    exports.gl = null;
    exports.canvas = null;
    let _app = null;
    let _prevTime = Date.now();

    function init(canvasId, app){    
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
        exports.gl.pixelStorei(exports.gl.UNPACK_FLIP_Y_WEBGL, 1); //Flip the image's y axis    

        _app = app;

        inputManager.init(exports.canvas);

        if(_app){
            _app.onInit();    
        }

        window.onresize = onResize;
        console.log(navigator.userAgent);

        onResize();
        loop();
    }
    function onResize(){
        exports.canvas.width = Math.floor(exports.canvas.clientWidth * window.devicePixelRatio);
        exports.canvas.height = Math.floor(exports.canvas.clientHeight * window.devicePixelRatio); 
        
        exports.gl.viewport(0, 0, exports.canvas.width, exports.canvas.height);

        if(_app){
            _app.onResize(exports.canvas.width, exports.canvas.height);
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

    class MathUtils{
        constructor(){
            this.Pi = 3.141592654;
            this.TwoPi = 6.283185307;
            this.HalfPi = 1.570796327;

            this.Epsilon = 0.000001;
            this.ZeroEpsilon = 32.0 * 1.175494351e-38; // Very small epsilon for checking against 0.0f
        }

        degToRad(degree){
            return degree * 0.017453293;
        }

        radToDeg(rad){
            return rad * 57.29577951;
        }

        clamp(f, min, max){
            if(f<min) f = min;
            else if(f>max) f = max;
            return f;
        }
    }

    let math = new MathUtils();

    class Vector3{
        constructor(x=0,y=0,z=0){
            this.x = x;
            this.y = y;
            this.z = z;
        }

        clone(){
            return new Vector3(this.x, this.y, this.z);
        }

        set(x,y,z){
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        }

        length(){
            return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
        }

        lengthSquare(){
            return this.x*this.x+this.y*this.y+this.z*this.z;
        }

        equals(rhs){
            let eps = math.Epsilon;
            return (this.x > rhs.x - eps && this.x < rhs.x + eps &&
                    this.y > rhs.y - eps && this.y < rhs.y + eps &&
                    this.z > rhs.z - eps && this.z < rhs.z + eps);
        }

        copyFrom(rhs){
            this.x = rhs.x;
            this.y = rhs.y;
            this.z = rhs.z;
            return this;
        }

        negative(){
            this.x = -this.x;
            this.y = -this.y;
            this.z = -this.z;
            return this;
        }

        add(rhs){
            this.x += rhs.x;
            this.y += rhs.y;
            this.z += rhs.z;
            return this;
        }

        sub(rhs){
            this.x -= rhs.x;
            this.y -= rhs.y;
            this.z -= rhs.z;
            return this;
        }

        multiply(rhs){
            this.x *= rhs.x;
            this.y *= rhs.y;
            this.z *= rhs.z;
            return this;
        }

        scale(s){
            this.x *= s;
            this.y *= s;
            this.z *= s;
            return this;
        }

        normalize(){
            let lensq =this.x*this.x+this.y*this.y+this.z*this.z;
            if(lensq > 0){
               let g = 1/Math.sqrt(lensq);
               this.x *= g;
               this.y *= g;
               this.z *= g;
            }

            return this;
        }

        static copyTo(src, dst){
            dst.x = src.x;
            dst.y = src.y;
            dst.z = src.z;
            return dst;
        }

        static negativeTo(src, dst){
            dst.x = -src.x;
            dst.y = -src.y;
            dst.z = -src.z;
            return dst;
        }

        static add(a, b, dst){
            dst.x = a.x + b.x;
            dst.y = a.y + b.y;
            dst.z = a.z + b.z;
            return dst;
        }

        static sub(a, b, dst){
            dst.x = a.x - b.x;
            dst.y = a.y - b.y;
            dst.z = a.z - b.z;
            return dst;
        }

        static multiply(a, b, dst){
            dst.x = a.x * b.x;
            dst.y = a.y * b.y;
            dst.z = a.z * b.z;
            return dst;
        }

        static scaleTo(a, s, dst){
            dst.x = a.x * s;
            dst.y = a.y * s;
            dst.z = a.z * s;
            return dst;
        }

        static dot(a, b){
            return a.x * b.x + a.y * b.y + a.z * b.z;
        }

        static cross(a, b, dst){
            dst.x = a.y * b.z - a.z * b.y;
            dst.y = a.z * b.x - a.x * b.z;
            dst.z = a.x * b.y - a.y * b.x;
            return dst;
        }

        static lerp(a, b, f, dst){
            dst.x = a.x + (b.x-a.x)*f;
            dst.y = a.y + (b.y-a.y)*f;
            dst.z = a.z + (b.z-a.z)*f;
            return dst;
        }

        static distance(a,b){
            let dx = a.x - b.x;
            let dy = a.y - b.y;
            let dz = a.z - b.z;
            return Math.sqrt(dx*dx+dy*dy+dz*dz);
        }

        static distanceSquare(a,b){
            let dx = a.x - b.x;
            let dy = a.y - b.y;
            let dz = a.z - b.z;
            return dx*dx+dy*dy+dz*dz;
        }
    }

    Vector3.Right = new Vector3(1, 0, 0);
    Vector3.Up = new Vector3(0, 1, 0);

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

        /**
         * Calculate the inverse matrix of source matrix, and set to this.
         * @param {Matrix4} source The source matrix.
         * @returns this
         */
        setInverseOf(source){        
            let s = source.elements;
            let d = this.elements;
            let inv = new Float32Array(16);

            //使用标准伴随阵法计算逆矩阵：
            //标准伴随阵 = 方阵的代数余子式组成的矩阵的转置矩阵
            //逆矩阵 = 标准伴随阵/方阵的行列式

            //计算代数余子式并转置后放入inv矩阵中
            inv[0]  =   s[5]*s[10]*s[15] - s[5] *s[11]*s[14] - s[9] *s[6]*s[15]
                      + s[9]*s[7] *s[14] + s[13]*s[6] *s[11] - s[13]*s[7]*s[10];
            inv[4]  = - s[4]*s[10]*s[15] + s[4] *s[11]*s[14] + s[8] *s[6]*s[15]
                      - s[8]*s[7] *s[14] - s[12]*s[6] *s[11] + s[12]*s[7]*s[10];
            inv[8]  =   s[4]*s[9] *s[15] - s[4] *s[11]*s[13] - s[8] *s[5]*s[15]
                      + s[8]*s[7] *s[13] + s[12]*s[5] *s[11] - s[12]*s[7]*s[9];
            inv[12] = - s[4]*s[9] *s[14] + s[4] *s[10]*s[13] + s[8] *s[5]*s[14]
                      - s[8]*s[6] *s[13] - s[12]*s[5] *s[10] + s[12]*s[6]*s[9];

            inv[1]  = - s[1]*s[10]*s[15] + s[1] *s[11]*s[14] + s[9] *s[2]*s[15]
                      - s[9]*s[3] *s[14] - s[13]*s[2] *s[11] + s[13]*s[3]*s[10];
            inv[5]  =   s[0]*s[10]*s[15] - s[0] *s[11]*s[14] - s[8] *s[2]*s[15]
                      + s[8]*s[3] *s[14] + s[12]*s[2] *s[11] - s[12]*s[3]*s[10];
            inv[9]  = - s[0]*s[9] *s[15] + s[0] *s[11]*s[13] + s[8] *s[1]*s[15]
                      - s[8]*s[3] *s[13] - s[12]*s[1] *s[11] + s[12]*s[3]*s[9];
            inv[13] =   s[0]*s[9] *s[14] - s[0] *s[10]*s[13] - s[8] *s[1]*s[14]
                      + s[8]*s[2] *s[13] + s[12]*s[1] *s[10] - s[12]*s[2]*s[9];

            inv[2]  =   s[1]*s[6]*s[15] - s[1] *s[7]*s[14] - s[5] *s[2]*s[15]
                      + s[5]*s[3]*s[14] + s[13]*s[2]*s[7]  - s[13]*s[3]*s[6];
            inv[6]  = - s[0]*s[6]*s[15] + s[0] *s[7]*s[14] + s[4] *s[2]*s[15]
                      - s[4]*s[3]*s[14] - s[12]*s[2]*s[7]  + s[12]*s[3]*s[6];
            inv[10] =   s[0]*s[5]*s[15] - s[0] *s[7]*s[13] - s[4] *s[1]*s[15]
                      + s[4]*s[3]*s[13] + s[12]*s[1]*s[7]  - s[12]*s[3]*s[5];
            inv[14] = - s[0]*s[5]*s[14] + s[0] *s[6]*s[13] + s[4] *s[1]*s[14]
                      - s[4]*s[2]*s[13] - s[12]*s[1]*s[6]  + s[12]*s[2]*s[5];

            inv[3]  = - s[1]*s[6]*s[11] + s[1]*s[7]*s[10] + s[5]*s[2]*s[11]
                      - s[5]*s[3]*s[10] - s[9]*s[2]*s[7]  + s[9]*s[3]*s[6];
            inv[7]  =   s[0]*s[6]*s[11] - s[0]*s[7]*s[10] - s[4]*s[2]*s[11]
                      + s[4]*s[3]*s[10] + s[8]*s[2]*s[7]  - s[8]*s[3]*s[6];
            inv[11] = - s[0]*s[5]*s[11] + s[0]*s[7]*s[9]  + s[4]*s[1]*s[11]
                      - s[4]*s[3]*s[9]  - s[8]*s[1]*s[7]  + s[8]*s[3]*s[5];
            inv[15] =   s[0]*s[5]*s[10] - s[0]*s[6]*s[9]  - s[4]*s[1]*s[10]
                      + s[4]*s[2]*s[9]  + s[8]*s[1]*s[6]  - s[8]*s[2]*s[5];

            //计算行列式，选择方阵的第一列，对该列中的四个元素S[0],s[1],s[2],s[3]分别乘以对应的代数余子式，然后相加
            let det = s[0]*inv[0] + s[1]*inv[4] + s[2]*inv[8] + s[3]*inv[12];
            //注：选择任意一行，例如第一行，也是可以的
            //let det = s[0]*inv[0] + s[4]*inv[1] + s[8]*inv[2] + s[12]*inv[3];
            
            if(det===0){
                return this;
            }

            det = 1 / det;
            for(let i=0; i<16; ++i){
                d[i] = inv[i] * det;
            }

            return this;
        }

        /**
         * Invert this matrix
         * @returns this
         */
        invert(){
            return this.setInverseOf(this);
        }

        /**
         * Transpose this matrix.
         * @returns this
         */
        transpose(){
            let e = this.elements;

            //转置4x4矩阵，分别交换 1,4; 2,8; 3,12; 6,9; 7,13; 11,14
            let t;
            t = e[1]; e[1] = e[4]; e[4] = t;
            t = e[2]; e[2] = e[8]; e[8] = t;
            t = e[3]; e[3] = e[12]; e[12] = t;
            t = e[6]; e[6] = e[9]; e[9] = t;        
            t = e[7]; e[7] = e[13]; e[13] = t;
            t = e[11]; e[11] = e[14]; e[14] = t;

            return this;
        }

        static multiply(m1,m2,dst){
            let i, e, a, b, ai0, ai1, ai2, ai3;
      
            // Calculate e = a * b
            e = dst.elements;
            a = m1.elements;
            b = m2.elements;
            
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
            
            return dst;
        }
    }

    class Quaternion {
        constructor(x=0,y=0,z=0,w=1){        
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }

        /**
         * Return a clone of this quaternion.
         */
        clone(){
            return new Quaternion(this.x, this.y, this.z, this.w);
        }

        /**
         * Set the x,y,z,w of this quaternion.
         * @param {Number} x 
         * @param {Number} y 
         * @param {Number} z 
         * @param {Number} w 
         */
        set(x,y,z,w){
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
            return this;
        }

        /**
         * Copy the x,y,z,w from rhs to this quaternion.
         * @param {Quaternion} rhs 
         */
        copyFrom(rhs){
            this.x = rhs.x;
            this.y = rhs.y;
            this.z = rhs.z;
            this.w = rhs.w;
            return this;
        }

        /**
         * Make this quaternion identity.
         */
        identity(){
            this.x = 0.0;
            this.y = 0.0;
            this.z = 0.0;
            this.w = 1.0;
            return this;
        }

        /**
         * Check if the quaternion rhs is equal to this quaternion.
         * @param {Quaternion} rhs 
         */
        equals(rhs){
            let eps = math.Epsilon;
            return (this.x > rhs.x - eps && this.x < rhs.x + eps &&
                    this.y > rhs.y - eps && this.y < rhs.y + eps &&
                    this.z > rhs.z - eps && this.z < rhs.z + eps &&
                    this.w > rhs.w - eps && this.w < rhs.w + eps);
        }

        /**
         * Sets the euler angle representation of the rotation.
         * @param {Vector3} eulerAngles 
         */
        setFromEulerAngles(eulerAngles){
            let ex = math.degToRad(eulerAngles.x*0.5);
            let ey = math.degToRad(eulerAngles.y*0.5);
            let ez = math.degToRad(eulerAngles.z*0.5);

            let cx = Math.cos(ex);
            let sx = Math.sin(ex);
            let cy = Math.cos(ey);
            let sy = Math.sin(ey);
            let cz = Math.cos(ez);
            let sz = Math.sin(ez);

            let qx = new Quaternion(sx, 0.0, 0.0, cx);
            let qy = new Quaternion(0.0, sy, 0.0, cy);
            let qz = new Quaternion(0.0, 0.0, sz, cz);

            // q = (qy * qx) * qz        
            Quaternion.multiply(qy, qx, this);
            Quaternion.multiply(this, qz, this);
            return this;   
        }

        /**
         * Create a rotation which rotates from fromDir to toDir.
         * @param {Vector3} fromDir 
         * @param {Vector3} toDir 
         */
        setFromToRotation(fromDir, toDir){

        }

        /**
         * Create a rotation which looks in forward and the up direction is upwards.
         * @param {Vector3} forward The direction to look in.
         * @param {Vector3} upwards The up direction.
         */
        setLookRotation(forward, upwards){

        }

        /**
         * Normalize this quaternion.
         */
        normalize(){
            let mag = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w);
            if(mag>0.0){
                let g = 1.0/mag;
                this.x *= g;
                this.y *= g;
                this.z *= g;
                this.w *= g;
            } else {
                this.identity();
            }
            return this;
        }

        /**
         * Converts a rotation to angle-axis representation. (angeles in degrees)
         * @returns { angle:Number, axis:[x,y,z]}
         */
        toAngleAxis(){

        }

        /**
         * Create a rotation which rotates angle degrees around axis.
         * @param {Vector3} axis The rotation axis.
         * @param {Number} angle Rotation angle in degrees.
         * @returns {Quaternion} The rotation quaternion.
         */
        static axisAngle(axis, angle){
            let halfAngle = math.degToRad(angle*0.5);
            let s = Math.sin(halfAngle);
            return new Quaternion(s*axis.x, s*axis.y, s*axis.z, Math.cos(halfAngle));
        }

        /**
         * Returns a rotation that rotates z degrees around the z axis,
         * x degrees around the x axis, and y degrees around the y axis; applied in that order.
         * @param {Number} x 
         * @param {Number} y 
         * @param {Number} z 
         * @returns {Quaternion} The rotation quaternion.
         */
        static euler(x, y, z){
            let ex = math.degToRad(x*0.5);
            let ey = math.degToRad(y*0.5);
            let ez = math.degToRad(z*0.5);

            let cx = Math.cos(ex);
            let sx = Math.sin(ex);
            let cy = Math.cos(ey);
            let sy = Math.sin(ey);
            let cz = Math.cos(ez);
            let sz = Math.sin(ez);

            let qx = new Quaternion(sx, 0.0, 0.0, cx);
            let qy = new Quaternion(0.0, sy, 0.0, cy);
            let qz = new Quaternion(0.0, 0.0, sz, cz);

            // q = (qy * qx) * qz    
            let q = new Quaternion();    
            Quaternion.multiply(qy, qx, q);
            Quaternion.multiply(q, qz, q);
            return q;        
        }

        /**
         * Create a rotation which rotates from fromDir to toDir.
         * @param {Vector3} fromDir 
         * @param {Vector3} toDir 
         * @returns {Quaternion} The rotation quaternion.
         */
        static fromToRotation(fromDir, toDir){

        }

        /**
         * Create a rotation which looks in forward and the up direction is upwards.
         * @param {Vector3} forward The direction to look in.
         * @param {Vector3} upwards The up direction.
         * @returns {Quaternion} The rotation quaternion. 
         *  Returns identity if forward or upwards magnitude is zero or forward and upwards are colinear.
         */
        static lookRotation(forward, upwards){

        }

        /**
         * Rotates a rotation from towards to.
         * The from quaternion is rotated towards to by an angular step of maxDegreesDelta.
         * Negative values of maxDegreesDelta will move away from to until the rotation is exactlly the opposite direction.
         * @param {Quaternion} from 
         * @param {Quaternion} to 
         * @param {Number} maxDegreesDelta 
         * @returns The rotatoin quaternion.
         */
        static rotateTowards(from, to, maxDegreesDelta){

        }

        /**
         * Returns the conjugate of q.
         * @param {Quaternion} q 
         */
        static conjugate(q){
            return new Quaternion(-q.x, -q.y, -q.z, q.w);
        }

        /**
         * Returns the inverse of q.
         * @param {Quaternion} q 
         */
        static inverse(q){
            return Quaternion.conjugate(q);
        }

        /**
         * Returns the angle in degrees between two quaternion qa & qb.
         * @param {Quaternion} qa 
         * @param {Quaternion} ab
         * @returns {Number} The angle in degrees.
         */    
        static angleBetween(qa, ab){

        }

        /**
         * The dot product between two quaternions.
         * @param {Quaternion} qa 
         * @param {Quaternion} qb 
         * @returns {Number} The dot product.
         */
        static dot(qa, qb){
            return qa.x * qb.x + qa.y * qb.y + qa.z * qb.z + qa.w * qb.w;
        }

        /**
         * Multiply the quaternion qa and qb.
         * @param {Quaternion} qa 
         * @param {Quaternion} qb 
         * @param {Quaternion} dst The result set to dst.
         */
        static multiply(qa, qb, dst){
            dst.set(
                qa.w*qb.x + qa.x*qb.w + qa.y*qb.z - qa.z*qb.y,
                qa.w*qb.y + qa.y*qb.w + qa.z*qb.x - qa.x*qb.z,
                qa.w*qb.z + qa.z*qb.w + qa.x*qb.y - qa.y*qb.x,
                qa.w*qb.w - qa.x*qb.x - qa.y*qb.y - qa.z*qb.z            
            );            
        }

        /**
         * Rotate the vector by quaternion.
         * @param {Quaternion} q
         * @param {Vector3} v 
         * @param {Vector3} dst
         */
        static rotateVector(q, v, dst){
            // dst = q * v * inv_q

            // t = q * v
            let tx = q.w * v.x + q.y * v.z - q.z * v.y;
            let ty = q.w * v.y + q.z * v.x - q.x * v.z;
            let tz = q.w * v.z + q.x * v.y - q.y * v.x;
            let tw = -q.x * v.x - q.y * v.y - q.z * v.z; 
            
            //  dst = t * inv_q
            dst.x = tw * -q.x + tx * q.w + ty * -q.z - tz * -q.y;
            dst.y = tw * -q.y + ty * q.w + tz * -q.x - tx * -q.z;
            dst.z = tw * -q.z + tz * q.w + tx * -q.y - ty * -q.x;
            return dst;
        }

        /**
         * Convert quaternion to rotatoin matrix.
         * @param {Matrix4} matrix The rotation matrix.
         */
        static toMatrix4(q, matrix){
            let x = q.x * 2.0;
            let y = q.y * 2.0;
            let z = q.z * 2.0;
            let xx = q.x * x;
            let yy = q.y * y;
            let zz = q.z * z;
            let xy = q.x * y;
            let xz = q.x * z;
            let yz = q.y * z;
            let wx = q.w * x;
            let wy = q.w * y;
            let wz = q.w * z;
            
            let e = matrix.elements;
            e[0] = 1.0 - (yy + zz);
            e[1] = xy + wz;
            e[2] = xz - wy;
            e[3] = 0.0;

            e[4] = xy - wz;
            e[5] = 1.0 - (xx + zz);
            e[6] = yz + wx;
            e[7] = 0.0;

            e[8] = xz + wy;
            e[9] = yz - wx;
            e[10] = 1.0 - (xx + yy);
            e[11] = 0.0;

            e[12] = 0.0;
            e[13] = 0.0;
            e[14] = 0.0;
            e[15] = 1.0;
        }

        /**
         * Interpolates between qa and qb by t and normalizes the result afterwards.
         * This is faster then slerp but looks worse if the rotations are far apart.
         * @param {Quaternion} qa 
         * @param {Quaternion} qb 
         * @param {Number} t The interpolation factor.
         * @returns The result quaternion.
         */
        static lerp(qa, qb, t){
            let result = new Quaternion();
            // If dot < 0, qa and qb are more than 360 degrees apart.
            // The quaternions are 720 degrees of freedom, so negative all components when lerping.
            if(Quaternion.dot(qa, qb) < 0){
                result.set(qa.x + t*(-qb.x-qa.x),
                           qa.y + t*(-qb.y-qa.y),
                           qa.z + t*(-qb.z-qa.z),
                           qa.w + t*(-qb.w-qa.w));
            } else {
                result.set(qa.x + t*(qb.x-qa.x),
                           qa.y + t*(qb.y-qa.y),
                           qa.z + t*(qb.z-qa.z),
                           qa.w + t*(qb.w-qa.w));
            }
            return result;
        }

        /**
         * Spherically interpolates between qa and qb by t.
         * Use this to create a rotation which smoothly interpolates between qa to qb.
         * If the value of t is close to 0, the output will be close to qa, if it is close to 1, the output will be close to qb.
         * @param {Quaternion} qa 
         * @param {Quaternion} qb 
         * @param {Number} t The interpolation factor.
         * @returns The result quaternion.
         */
        static slerp(qa, qb, t){
            let dot = Quaternion.dot(qa, qb);
            let result = new Quaternion();

            if(dot < 0.0){
                dot = -dot;
                result.set(-qb.x, -qb.y, -qb.z, -qb.w);
            } else {
                result.set(qb);
            }

            let scale0 = 0;
            let scale1 = 0;

            if(dot < 0.95){
                let angle = Math.acos(dot);
                let sin_div = 1.0/Math.sin(angle);
                scale1 = Math.sin(angle*t)*sin_div;
                scale0 = Math.sin(angle*(1.0-t))*sin_div;
            } else {
                scale0 = 1.0 - t;
                scale1 = t;
            }

            result.set( qa.x*scale0 + result.x*scale1,
                        qa.y*scale0 + result.y*scale1,
                        qa.z*scale0 + result.z*scale1,
                        qa.w*scale0 + result.w*scale1);
            return result;
        }

    }

    /**
     * The identity rotation.
     */
    Quaternion.Identity = new Quaternion();

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
                case exports.gl.INT:{
                    if(info.isArray){
                        exports.gl.uniform1iv(info.location, value);
                    } else {
                        exports.gl.uniform1i(info.location, value);
                    }
                    break;
                }
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
                case exports.gl.FLOAT_MAT3:{
                    exports.gl.uniformMatrix3fv(info.location, false, value);
                    break;
                }
                case exports.gl.FLOAT_MAT4:{
                    exports.gl.uniformMatrix4fv(info.location, false, value);
                    break;
                }
                case exports.gl.SAMPLER_2D:{
                    exports.gl.uniform1i(info.location, value);
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
                //console.warn('Shader: can not find attribute for semantic '+semantic);
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

    class Texture2D {
        constructor(){
            this._id = exports.gl.createTexture();
            if (!this._id) {
                console.error('Failed to create the texture object');            
            }
        }

        destroy(){
            exports.gl.deleteTexture(this._id);
            this._id = 0;
        }

        create(image){
            // Bind the texture object to the target
            exports.gl.bindTexture(exports.gl.TEXTURE_2D, this._id);
            
            // Set the texture parameters
            exports.gl.texParameteri(exports.gl.TEXTURE_2D, exports.gl.TEXTURE_MIN_FILTER, exports.gl.LINEAR);
            exports.gl.texParameteri(exports.gl.TEXTURE_2D, exports.gl.TEXTURE_WRAP_S, exports.gl.CLAMP_TO_EDGE);
            exports.gl.texParameteri(exports.gl.TEXTURE_2D, exports.gl.TEXTURE_WRAP_T, exports.gl.CLAMP_TO_EDGE);
            
            // Set the texture image data
            exports.gl.texImage2D(exports.gl.TEXTURE_2D, 0, exports.gl.RGB, exports.gl.RGB, exports.gl.UNSIGNED_BYTE, image);

            exports.gl.bindTexture(exports.gl.TEXTURE_2D, null);

        }

        get id(){
            return this._id;
        }

        bind(unit=0){
            exports.gl.activeTexture(exports.gl.TEXTURE0 + unit);
            exports.gl.bindTexture(exports.gl.TEXTURE_2D, this._id);
        }

        unbind(){
            exports.gl.bindTexture(exports.gl.TEXTURE_2D, null);
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
            image.src = name;
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

    class SharedTexture{
        constructor(texture){
            this.texture = texture;
            this.refCount = 1;
        }
    }

    class TextureManager {
        constructor(){
            this._textures = {};
        }

        getTexture(texturePath){
            if(this._textures[texturePath] == null){
                let texture = new Texture2D();
                texture.create(assetManager.getAsset(texturePath).data);
                this._textures[texturePath] = new SharedTexture(texture);
            } else {
                this._textures[texturePath].refCount++;
            }

            return this._textures[texturePath].texture;
        }

        releaseTexture(texturePath){
            if(this._textures[texturePath] == null){
                console.error("releaseTexture: texture not found: "+texturePath);            
            } else {
                this._textures[texturePath].refCount--;
                if(this._textures[texturePath].refCount < 1){
                    this._textures[texturePath].texture.destroy();
                    this._textures[texturePath] = null;
                    delete this._textures[texturePath];
                }
            }
        }

    }

    let textureManager = new TextureManager();

    class StringParser{
        constructor(str){
            if(str){
                this.init(str);
            }
        }

        init(str){
            this.str = str.trim();        
            this.index = 0;
        }

        getWorldLength(str, start){
            let i=start;
            for(let len=str.length; i<len; i++){
                let c = str.charAt(i);
                if (c == '\t'|| c == ' ' || c == '(' || c == ')' || c == '"'){ 
                    break;
                }
            }
            return i-start;
        }

        skipDelimiters(){
            let i = this.index;
            for(let len = this.str.length; i<len; i++){
                let c = this.str.charAt(i);
                //Skip TAB, Space, '(', ')'
                if(c == '\t' || c == ' ' || c == '(' || c==')' || c=='"'){
                    continue;
                }
                break;
            }
            this.index = i;
        }

        skipToNextWord(){
            this.skipDelimiters();
            let n = this.getWorldLength(this.str, this.index);
            this.index += (n+1);
        }

        getWord(){
            this.skipDelimiters();
            let n = this.getWorldLength(this.str, this.index);
            if(n == 0){
                return null;
            }
            let word = this.str.substr(this.index, n);
            this.index += (n+1);
            return word;
        }

        getInt(){
            return parseInt(this.getWord());
        }

        getFloat(){
            return parseFloat(this.getWord());
        }
    }

    class Face{
        constructor(){
            this.vIndices = [];
            this.nIndices = [];
            this.tIndices = [];     
        }
    }

    class ObjFileLoader{
        constructor(){
            this.reset();
        }

        reset(){
            this._vertices = [];
            this._normals = [];
            this._texcoords = [];
            this._faces = [];       
        }

        load(fileString, scale){
            let lines = fileString.split('\n');
            lines.push(null);
            let index = 0;

            let line;
            let sp = new StringParser();
            while((line = lines[index++]) != null){
                sp.init(line);
                let command = sp.getWord();
                if(command==null) continue;

                switch(command){
                    case '#':
                        continue; //Skip comments
                    case 'mtllib': 
                        continue; //Skip material chunk
                    case 'o':
                    case 'g':
                        continue; //Skip Object name
                    case 'v': //Read vertex
                    {
                        let vertex = this.parseVertex(sp, scale);
                        this._vertices.push(vertex);
                        continue;
                    }
                    case 'vn'://Read normal
                    {
                        let normal = this.parseNormal(sp);
                        this._normals.push(normal);
                        continue;
                    }
                    case 'vt'://Read texture coordinates
                    {
                        let texcoord = this.pasreTexcoord(sp);
                        this._texcoords.push(texcoord);
                        continue;
                    }
                    case 'f'://Read face
                    {
                        let face = this.parseFace(sp);
                        this._faces.push(face);                   
                        continue;
                    }
                        
                }
            }       

            let mesh = this._toMesh();
            this.reset();
            return mesh;
        }

        parseVertex(sp, scale){
            let x = sp.getFloat() * scale;
            let y = sp.getFloat() * scale;
            let z = sp.getFloat() * scale;
            return {'x':x,'y':y,'z':z};
        }

        parseNormal(sp){
            let x = sp.getFloat();
            let y = sp.getFloat();
            let z = sp.getFloat();
            return {'x':x,'y':y,'z':z};
        }

        pasreTexcoord(sp){
            let texcoord = [];
            for(;;){
                let word = sp.getWord();
                if(word==null) break;
                texcoord.push(word);
            }
            return texcoord;
        }

        parseFace(sp){
            let face = new Face();
            for(;;){
                let word = sp.getWord();
                if(word==null) break;
                let subWords = word.split('/');
                if(subWords.length >= 1){
                    let vi = parseInt(subWords[0]) - 1;
                    face.vIndices.push(vi);
                }
                if(subWords.length >= 3){
                    let ni = parseInt(subWords[2]) - 1;
                    face.nIndices.push(ni);
                    let ti = parseInt(subWords[1]);
                    if(!isNaN(ti)){                    
                        face.tIndices.push(ti-1);
                    }
                }
            }        

            // Devide to triangels if face contains over 3 points.
            // 即使用三角扇表示多边形。n个顶点需要三角形n-2。
            if(face.vIndices.length > 3){
                let n = face.vIndices.length - 2;
                let newVIndices = new Array(n * 3);
                let newNIndices = new Array(n * 3);
                for(let i=0; i<n; i++){
                    newVIndices[i*3] = face.vIndices[0];
                    newVIndices[i*3+1] = face.vIndices[i+1];
                    newVIndices[i*3+2] = face.vIndices[i+2];
                    if(face.nIndices.length>0){
                        newNIndices[i*3] = face.nIndices[0];
                        newNIndices[i*3+1] = face.nIndices[i+1];
                        newNIndices[i*3+2] = face.nIndices[i+2];
                    }
                }
                face.vIndices = newVIndices;
                if(face.nIndices.length>0){
                    face.nIndices = newNIndices;    
                }            
            }       

            return face;
        }

        _calcFaceNormal(p0, p1, p2){
            let v_10 = new Vector3(p0.x-p1.x, p0.y-p1.y, p0.z-p1.z);
            let v_12 = new Vector3(p2.x-p1.x, p2.y-p1.y, p2.z-p1.z);
            let normal = new Vector3();
            Vector3.cross(v_12, v_10, normal);
            normal.normalize();
            return normal;
        }

        _calcFaceArea(p0, p1, p2){
            let a = Vector3.distance(p0, p1);
            let b = Vector3.distance(p1, p2);
            let c = Vector3.distance(p0, p2);
            let p = (a+b+c)/2;
            return Math.sqrt(p*(p-a)*(p-b)*(p-c));
        }

        _calcAngle(v0, v1){
            v0.normalize();
            v1.normalize();
            return Math.acos(Vector3.dot(v0, v1));
        }

        _toMesh(){
            let format = new VertexFormat();
            format.addAttrib(VertexSemantic.POSITION, 3);        
            format.addAttrib(VertexSemantic.NORMAL, 3);
            
            let texsize = 0;
            if(this._texcoords.length > 0){
                texsize = this._texcoords[0].length;
                format.addAttrib(VertexSemantic.UV0, texsize);
            }

            let mesh = new Mesh(format);        

            let triangels = [];
            let positions = [];
            let normals = [];
            let uvs = [];

            for(let i=0; i<this._vertices.length; i++){
                let v = this._vertices[i];
                positions.push(v.x, v.y, v.z);
            }
           
            if(this._normals.length > 0){
                if(this._normals.length !== this._vertices.length){
                    console.warn("obj file normals count not match vertices count");
                }
                for(let i=0; i<this._normals.length; i++){
                    let n = this._normals[i];
                    normals.push(n.x, n.y, n.z);
                }
            }

            if(this._texcoords.length > 0){
                if(this._texcoords.length !== this._vertices.length){
                    console.warn("obj file texcoords count not match vertices count");
                }           
                for(let i=0; i<this._texcoords.length; i++){
                    let texcoord = this._texcoords[i];
                    for(let j=0; j<texsize; j++){
                        uvs.push(texcoord[j]);
                    }
                }            
            }

            for(let i=0; i<this._faces.length; i++){
                let face = this._faces[i];
                for(let j=0; j<face.vIndices.length; j++){    
                    let vIdx = face.vIndices[j];                            
                    triangels.push(vIdx);                

                    if(face.nIndices.length > 0){
                        let nIdx = face.nIndices[j];
                        if(nIdx !== vIdx){
                            console.warn('obj file nIdx not match vIdx');
                        }                  
                    }                
                }            
            }

            if(normals.length===0){            
                let triangleCount = triangels.length/3;
                let vertexNormals = [];
                let t = 0;
                for(let i=0; i<triangleCount; ++i){                
                    let idx0 = triangels[t];
                    let idx1 = triangels[t+1];
                    let idx2 = triangels[t+2];
                    t+=3;

                    let p0x = positions[idx0*3];
                    let p0y = positions[idx0*3+1];
                    let p0z = positions[idx0*3+2];

                    let p1x = positions[idx1*3];
                    let p1y = positions[idx1*3+1];
                    let p1z = positions[idx1*3+2];

                    let p2x = positions[idx2*3];
                    let p2y = positions[idx2*3+1];
                    let p2z = positions[idx2*3+2];

                    let p0 = new Vector3(p0x, p0y, p0z);
                    let p1 = new Vector3(p1x, p1y, p1z);
                    let p2 = new Vector3(p2x, p2y, p2z);

                    let faceN = this._calcFaceNormal(p0, p1, p2);          
                    let faceArea = this._calcFaceArea(p0, p1, p2);      

                    if(vertexNormals[idx0]==null){
                        vertexNormals[idx0] = new Vector3();
                    }
                    let angle = this._calcAngle(new Vector3(p1x-p0x, p1y-p0y, p1z-p0z), new Vector3(p2x-p0x, p2y-p0y, p2z-p0z));                
                    vertexNormals[idx0].add(Vector3.scaleTo(faceN, angle, new Vector3().scale(faceArea)));

                    if(vertexNormals[idx1]==null){
                        vertexNormals[idx1] = new Vector3();
                    }
                    angle = this._calcAngle(new Vector3(p2x-p1x, p2y-p1y, p2z-p1z), new Vector3(p0x-p1x, p0y-p1y, p0z-p1z));                
                    vertexNormals[idx1].add(Vector3.scaleTo(faceN, angle, new Vector3().scale(faceArea)));

                    if(vertexNormals[idx2]==null){
                        vertexNormals[idx2] = new Vector3();
                    }
                    angle = this._calcAngle(new Vector3(p0x-p2x, p0y-p2y, p0z-p2z), new Vector3(p1x-p2x, p1y-p2y, p1z-p2z));                
                    vertexNormals[idx2].add(Vector3.scaleTo(faceN, angle, new Vector3().scale(faceArea)));
                }

                for(let i=0; i<vertexNormals.length; ++i){
                    let n = vertexNormals[i];                                
                    n.normalize();
                    normals.push(n.x, n.y, n.z);
                }
            }

            mesh.setVertexData(VertexSemantic.POSITION, positions);
            mesh.setVertexData(VertexSemantic.NORMAL, normals);
            
            if(uvs.length>0){
                mesh.setVertexData(VertexSemantic.UV0, uvs);
            }

            mesh.setTriangles(triangels);
            mesh.upload();

            console.log('vertex count '+this._vertices.length);
            console.log('triangle count '+triangels.length/3);

            return mesh;
        }

    }

    let objFileLoader = new ObjFileLoader();

    class SceneNode {
        constructor(){
            this.position = new Vector3();
            this.rotation = new Quaternion();
            this.scale = new Vector3();
            this.localMatrix = new Matrix4();
            this.worldMatrix = new Matrix4();
            this.parent = null;
            this.children = [];

            this._rotationMatrix = new Matrix4();
        }

        removeFromParent(){
            if(this.parent){
                let idx = this.parent.children.indexOf(this);
                if(idx>=0){
                    this.parent.children.splice(idx, 1);
                }
                this.parent = null;
            }
        }

        setParent(parent){
            this.removeFromParent();
            if(parent){
                parent.children.push(this);
            }
            this.parent = parent;
        }

        addChild(node){
            node.setParent(this);
        }

        updateLocalMatrix(){
            //TODO:local matrix dirty flag

            this.localMatrix.setTranslate(this.position.x, this.position.y, this.position.z);   
            //TODO:封装rotation操作并cache _rotatoinMatrix
            Quaternion.toMatrix4(this.rotation, this._rotationMatrix);
            this.localMatrix.multiply(this._rotationMatrix);        
            this.localMatrix.scale(this.scale.x, this.scale.y, this.scale.z);      
        }

        updateWorldMatrix(parentWorldMatrix){
            if(parentWorldMatrix){
                Matrix4.multiply(parentWorldMatrix, this.localMatrix, this.worldMatrix);
            } else {
                this.worldMatrix.set(this.localMatrix);
            }

            let worldMatrix = this.worldMatrix;
            this.children.forEach(function(child){
                child.updateWorldMatrix(worldMatrix);
            });
        }
    }

    class SceneNode$1 {
        constructor(){
            this.position = new Vector3();
            this.rotation = new Quaternion();
            this.scale = new Vector3();
            this.localMatrix = new Matrix4();
            this.worldMatrix = new Matrix4();
            this.parent = null;
            this.children = [];

            this._rotationMatrix = new Matrix4();
        }

        removeFromParent(){
            if(this.parent){
                let idx = this.parent.children.indexOf(this);
                if(idx>=0){
                    this.parent.children.splice(idx, 1);
                }
                this.parent = null;
            }
        }

        setParent(parent){
            this.removeFromParent();
            if(parent){
                parent.children.push(this);
            }
            this.parent = parent;
        }

        addChild(node){
            node.setParent(this);
        }

        updateLocalMatrix(){
            //TODO:local matrix dirty flag

            this.localMatrix.setTranslate(this.position.x, this.position.y, this.position.z);   
            //TODO:封装rotation操作并cache _rotatoinMatrix
            Quaternion.toMatrix4(this.rotation, this._rotationMatrix);
            this.localMatrix.multiply(this._rotationMatrix);        
            this.localMatrix.scale(this.scale.x, this.scale.y, this.scale.z);      
        }

        updateWorldMatrix(parentWorldMatrix){
            if(parentWorldMatrix){
                Matrix4.multiply(parentWorldMatrix, this.localMatrix, this.worldMatrix);
            } else {
                this.worldMatrix.set(this.localMatrix);
            }

            let worldMatrix = this.worldMatrix;
            this.children.forEach(function(child){
                child.updateWorldMatrix(worldMatrix);
            });
        }
    }

    class Scene{
        constructor(){
            this.root = new SceneNode$1();

        }

        getRoot(){
            return this.root;
        }

        update(){
            this.root.updateWorldMatrix();
        }

        render(){
            
        }
    }

    exports.AssetType = AssetType;
    exports.IndexBuffer = IndexBuffer;
    exports.Matrix4 = Matrix4;
    exports.Mesh = Mesh;
    exports.Quaternion = Quaternion;
    exports.Scene = Scene;
    exports.SceneNode = SceneNode;
    exports.Shader = Shader;
    exports.SystemEvent = SystemEvent;
    exports.Texture2D = Texture2D;
    exports.Vector3 = Vector3;
    exports.VertexBuffer = VertexBuffer;
    exports.VertexFormat = VertexFormat;
    exports.VertexSemantic = VertexSemantic;
    exports.assetManager = assetManager;
    exports.eventManager = eventManager;
    exports.init = init;
    exports.inputManager = inputManager;
    exports.isMobile = isMobile;
    exports.math = math;
    exports.objFileLoader = objFileLoader;
    exports.textureManager = textureManager;

    return exports;

}({}));
//# sourceMappingURL=mini3d.js.map
