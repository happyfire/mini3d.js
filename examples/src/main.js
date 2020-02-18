import AppTexturedCube from "./AppTexturedCube";
import AppObjLoader from "./AppObjLoader";

function exampleTexturedCube(){
    let app = new AppTexturedCube();    
    mini3d.init('webgl', app);
}

function exampleObjLoader(){   
    
    let app = new AppObjLoader();
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
    }
]

export default function main(){
    return examples;
}
