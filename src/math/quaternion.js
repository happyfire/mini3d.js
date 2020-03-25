import { math } from "./math";
import { Matrix4 } from "./matrix4";
import { Matrix3 } from "./matrix3";

let _tmpMatrix3 = new Matrix3();

class Quaternion {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    /**
     * Return a clone of this quaternion.
     */
    clone() {
        return new Quaternion(this.x, this.y, this.z, this.w);
    }

    /**
     * Set the x,y,z,w of this quaternion.
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z 
     * @param {Number} w 
     */
    set(x, y, z, w) {
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
    copyFrom(rhs) {
        this.x = rhs.x;
        this.y = rhs.y;
        this.z = rhs.z;
        this.w = rhs.w;
        return this;
    }

    /**
     * Make this quaternion identity.
     */
    identity() {
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
    equals(rhs) {
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
    setFromEulerAngles(eulerAngles) {
        let ex = math.degToRad(eulerAngles.x * 0.5);
        let ey = math.degToRad(eulerAngles.y * 0.5);
        let ez = math.degToRad(eulerAngles.z * 0.5);

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
     * Set the quaternion from a 3X3 rotation matrix.
     * @param {Matrix3} matrix3 
     */
    setFromRotationMatrix(matrix3) {
        let e = matrix3.elements;
        let m00 = e[0]; let m01 = e[3]; let m02 = e[6];
        let m10 = e[1]; let m11 = e[4]; let m12 = e[7];
        let m20 = e[2]; let m21 = e[5]; let m22 = e[8];

        let trace = m00 + m11 + m22;
        if (trace > 0) {
            let s = 0.5 / Math.sqrt(trace + 1.0);

            this.w = 0.25 / s;
            this.x = (m21 - m12) * s;
            this.y = (m02 - m20) * s;
            this.z = (m10 - m01) * s;

        } else if ((m00 > m11) && (m00 > m22)) {
            let s = 2.0 * Math.sqrt(1.0 + m00 - m11 - m22);

            this.w = (m21 - m12) / s;
            this.x = 0.25 * s;
            this.y = (m01 + m10) / s;
            this.z = (m02 + m20) / s;

        } else if (m11 > m22) {
            let s = 2.0 * Math.sqrt(1.0 + m11 - m00 - m22);

            this.w = (m02 - m20) / s;
            this.x = (m01 + m10) / s;
            this.y = 0.25 * s;
            this.z = (m12 + m21) / s;

        } else {
            let s = 2.0 * Math.sqrt(1.0 + m22 - m00 - m11);

            this.w = (m10 - m01) / s;
            this.x = (m02 + m20) / s;
            this.y = (m12 + m21) / s;
            this.z = 0.25 * s;
        }

        return this;
    }

    /**
     * Create a rotation which rotates from fromDir to toDir.
     * @param {Vector3} fromDir 
     * @param {Vector3} toDir 
     */
    setFromToRotation(fromDir, toDir) {

    }

    /**
     * Create a rotation which looks in forward and the up direction is upwards.
     * @param {Vector3} forward The direction to look in.
     * @param {Vector3} upwards The up direction.
     */
    setLookRotation(forward, upwards) {
        _tmpMatrix3.setLookAt(0, 0, 0, forward.x, forward.y, forward.z, upwards.x, upwards.y, upwards.z);
        this.setFromRotationMatrix(_tmpMatrix3);
        this.normalize();
    }

    /**
     * Normalize this quaternion.
     */
    normalize() {
        let mag = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
        if (mag > 0.0) {
            let g = 1.0 / mag;
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
    toAngleAxis() {

    }

    /**
     * Create a rotation which rotates angle degrees around axis.
     * @param {Vector3} axis The rotation axis.
     * @param {Number} angle Rotation angle in degrees.
     * @returns {Quaternion} The rotation quaternion.
     */
    static axisAngle(axis, angle) {
        let halfAngle = math.degToRad(angle * 0.5);
        let s = Math.sin(halfAngle);
        return new Quaternion(s * axis.x, s * axis.y, s * axis.z, Math.cos(halfAngle));
    }

    /**
     * Returns a rotation that rotates z degrees around the z axis,
     * x degrees around the x axis, and y degrees around the y axis; applied in that order.
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z 
     * @returns {Quaternion} The rotation quaternion.
     */
    static euler(x, y, z) {
        let ex = math.degToRad(x * 0.5);
        let ey = math.degToRad(y * 0.5);
        let ez = math.degToRad(z * 0.5);

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
    static fromToRotation(fromDir, toDir) {

    }

    /**
     * Create a rotation which looks in forward and the up direction is upwards.
     * @param {Vector3} forward The direction to look in.
     * @param {Vector3} upwards The up direction.
     * @returns {Quaternion} The rotation quaternion. 
     *  Returns identity if forward or upwards magnitude is zero or forward and upwards are colinear.
     */
    static lookRotation(forward, upwards) {

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
    static rotateTowards(from, to, maxDegreesDelta) {

    }

    /**
     * Returns the conjugate of q.
     * @param {Quaternion} q 
     */
    static conjugate(q) {
        return new Quaternion(-q.x, -q.y, -q.z, q.w);
    }

    /**
     * Returns the inverse of q.
     * @param {Quaternion} q 
     */
    static inverse(q) {
        return Quaternion.conjugate(q);
    }

    /**
     * Returns the angle in degrees between two quaternion qa & qb.
     * @param {Quaternion} qa 
     * @param {Quaternion} ab
     * @returns {Number} The angle in degrees.
     */
    static angleBetween(qa, ab) {

    }

    /**
     * The dot product between two quaternions.
     * @param {Quaternion} qa 
     * @param {Quaternion} qb 
     * @returns {Number} The dot product.
     */
    static dot(qa, qb) {
        return qa.x * qb.x + qa.y * qb.y + qa.z * qb.z + qa.w * qb.w;
    }

    /**
     * Multiply the quaternion qa and qb.
     * @param {Quaternion} qa 
     * @param {Quaternion} qb 
     * @param {Quaternion} dst The result set to dst.
     */
    static multiply(qa, qb, dst) {
        dst.set(
            qa.w * qb.x + qa.x * qb.w + qa.y * qb.z - qa.z * qb.y,
            qa.w * qb.y + qa.y * qb.w + qa.z * qb.x - qa.x * qb.z,
            qa.w * qb.z + qa.z * qb.w + qa.x * qb.y - qa.y * qb.x,
            qa.w * qb.w - qa.x * qb.x - qa.y * qb.y - qa.z * qb.z
        );
    }

    /**
     * Rotate the vector by quaternion.
     * @param {Quaternion} q
     * @param {Vector3} v 
     * @param {Vector3} dst
     */
    static rotateVector(q, v, dst) {
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
    static toMatrix4(q, matrix) {
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
    static lerp(qa, qb, t) {
        let result = new Quaternion();
        // If dot < 0, qa and qb are more than 360 degrees apart.
        // The quaternions are 720 degrees of freedom, so negative all components when lerping.
        if (Quaternion.dot(qa, qb) < 0) {
            result.set(qa.x + t * (-qb.x - qa.x),
                qa.y + t * (-qb.y - qa.y),
                qa.z + t * (-qb.z - qa.z),
                qa.w + t * (-qb.w - qa.w));
        } else {
            result.set(qa.x + t * (qb.x - qa.x),
                qa.y + t * (qb.y - qa.y),
                qa.z + t * (qb.z - qa.z),
                qa.w + t * (qb.w - qa.w));
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
    static slerp(qa, qb, t) {
        let dot = Quaternion.dot(qa, qb);
        let result = new Quaternion();

        if (dot < 0.0) {
            dot = -dot;
            result.set(-qb.x, -qb.y, -qb.z, -qb.w);
        } else {
            result.set(qb);
        }

        let scale0 = 0;
        let scale1 = 0;

        if (dot < 0.95) {
            let angle = Math.acos(dot);
            let sin_div = 1.0 / Math.sin(angle);
            scale1 = Math.sin(angle * t) * sin_div;
            scale0 = Math.sin(angle * (1.0 - t)) * sin_div;
        } else {
            scale0 = 1.0 - t;
            scale1 = t;
        }

        result.set(qa.x * scale0 + result.x * scale1,
            qa.y * scale0 + result.y * scale1,
            qa.z * scale0 + result.z * scale1,
            qa.w * scale0 + result.w * scale1);
        return result;
    }

}

/**
 * The identity rotation.
 */
Quaternion.Identity = new Quaternion();

export { Quaternion };