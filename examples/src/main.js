import AppTexturedCube from "./AppTexturedCube";
import AppObjLoader from "./AppObjLoader";
import AppSimpleScene from "./AppSimpleScene";
import AppNormalMap from "./AppNormalMap";
import AppMirror from "./AppMirror";
import AppPostProcessing from "./AppPostProcessing";

function exampleObjLoader(){   
    
    let app = new AppObjLoader();
    mini3d.init('webgl', app);
}

function exampleSimpleScene(){
    let app = new AppSimpleScene();
    mini3d.init('webgl', app);
}

function exampleNormalMap(){
    let app = new AppNormalMap();
    mini3d.init('webgl', app);
}

function exampleMirror(){
    let app = new AppMirror();
    mini3d.init('webgl', app);
}

function examplePostProcessing(){
    let app = new AppPostProcessing();
    mini3d.init('webgl', app);
}

let examples = [
    {
        name:'Load .Obj Mesh',
        img:'load_obj.jpg',
        entry:exampleObjLoader
    },
    {
        name:'Simple Scene & Projector',
        img:'simple_scene.jpg',
        entry:exampleSimpleScene
    },
    {
        name:'Normal Map',
        img:'normalmap.jpg',
        entry:exampleNormalMap
    },
    {
        name:'Mirror',
        img:'mirror.jpg',
        entry:exampleMirror
    },
    {
        name:'PostProcessing',
        img:'pp1.jpg',
        entry:examplePostProcessing
    }
]

export default function main(){
    return examples;
}
