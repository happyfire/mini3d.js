import AppTexturedCube from "./AppTexturedCube";
import AppObjLoader from "./AppObjLoader";
import AppSimpleScene from "./AppSimpleScene";
import AppNormalMap from "./AppNormalMap";
import AppMirror from "./AppMirror";
import AppPostProcessing from "./AppPostProcessing";

function exampleTexturedCube(){
    let app = new AppTexturedCube();    
    mini3d.init('webgl', app);
}

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
        name:'Textured Cube',
        entry:exampleTexturedCube
    },
    {
        name:'Load .Obj Mesh',
        entry:exampleObjLoader
    },
    {
        name:'Simple Scene',
        entry:exampleSimpleScene
    },
    {
        name:'Normal Map',
        entry:exampleNormalMap
    },
    {
        name:'Mirror',
        entry:exampleMirror
    },
    {
        name:'PostProcessing',
        entry:examplePostProcessing
    }
]

export default function main(){
    return examples;
}
