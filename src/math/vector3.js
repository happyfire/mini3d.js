import { math } from "./math";

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

export { Vector3 };