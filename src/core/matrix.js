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

export { Matrix4 }