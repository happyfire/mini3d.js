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

        e[12] = 0
        e[13] = 0
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
}

export { Matrix4 };