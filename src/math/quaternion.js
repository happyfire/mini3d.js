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
     * Returns the inverse of rhs.
     * @param {Quaternion} rhs 
     */
    static inverse(rhs){

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

    }

    /**
     * Multiply the quaternion qa and qb.
     * @param {Quaternion} qa 
     * @param {Quaternion} qb 
     * @returns The result quaternion.
     */
    static multiply(qa, qb){

    }

    /**
     * Rotate the vector by quaternion.
     * @param {Quaternion} qa 
     * @param {Vector3} v 
     * @returns {Vector3}
     */
    static rotateVector(qa, v){

    }

    /**
     * Convert quaternion to rotatoin matrix.
     * @returns {Matrix4} The rotation matrix.
     */
    static toMatrix4(){

    }

    /**
     * Interpolates between qa and qb by t and normalizes the result afterwards.
     * This is faster then slerp but looks worse if the rotations are far apart.
     * @param {Quaternion} qa 
     * @param {Quaternion} qb 
     * @param {Number} t The interpolation factor, clamped to the range [0,1].
     * @returns The result quaternion.
     */
    static lerp(qa, qb, t){

    }

    /**
     * Spherically interpolates between qa and qb by t.
     * Use this to create a rotation which smoothly interpolates between qa to qb.
     * If the value of t is close to 0, the output will be close to qa, if it is close to 1, the output will be close to qb.
     * @param {Quaternion} qa 
     * @param {Quaternion} qb 
     * @param {Number} t The interpolation factor, clamped to the range [0,1].
     * @returns The result quaternion.
     */
    static slerp(qa, qb, t){

    }

}

/**
 * The identity rotation.
 */
Quaternion.identity = new Quaternion();

export { Quaternion };