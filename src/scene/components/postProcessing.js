import { Component } from './Component';
import { SystemComponents } from '../systemComps';
import { ScreenQuard } from '../../geometry/screenQuard';

class PostProcessing extends Component{
    constructor(){
        super();
        this._camera = null;
        this._quardMesh = ScreenQuard.createMesh();
    }

    init(camera, material){
        this._camera = camera;
        this._material = material;
    }

    render(){

        if(this._camera != null && this._camera.target!= null && this._material!=null){
            for(let pass of this._material.renderPasses){
                this._material.mainTexture = this._camera.target.texture2D;
                this._material.renderPass(this._quardMesh, null, pass);
            }
        }
    }


}

export { PostProcessing };