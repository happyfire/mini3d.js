import { MatProjector } from '../../material/matProjector';
import { Matrix4 } from '../../math/matrix4'
import { Component } from './Component';

class Projector extends Component{
    constructor(){
        super();

        this._fovy = 75;
        this._aspect = 0.75;
        this._near = 0.1;
        this._far = 100.0;
        this._projMatrix = new Matrix4();
        this._viewMatrix = new Matrix4();
        this._scaleMatrix = new Matrix4();
        this._scaleMatrix.setTranslate(0.5,0.5,0.5).scale(0.5,0.5,0.5);

        this._projectorMatrix = new Matrix4();

        this._material = new MatProjector();
    }

    get material(){
        return this._material;
    }

    set material(v){
        this._material = v;
    }

    getProjectorMatrix(){
        return this._projectorMatrix;
    }

    setPerspective(fovy, aspect, near, far){
        this._fovy = fovy;
        this._aspect = aspect;
        this._near = near;
        this._far = far; 
        this._projMatrix.setPerspective(this._fovy, this._aspect, this._near, this._far);
    }

    setOrtho(left, right, bottom, top, near, far){ 
        this._projMatrix.setOrtho(left, right, bottom, top, near, far);        
    }

    _updateProjectorMatrix(){
        this._projectorMatrix.set(this._scaleMatrix);   
        this._projectorMatrix.multiply(this._projMatrix);
        this._projectorMatrix.multiply(this._viewMatrix);
    }

    updateMatrix(){
        this._viewMatrix.setInverseOf(this.node.worldMatrix);
        this._updateProjectorMatrix();
    }

}



export { Projector };