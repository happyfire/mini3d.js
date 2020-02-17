import AppTexturedCube from "./AppTexturedCube";
import AppObjLoader from "./AppObjLoader";


export default function main(){   
    
    let app = new AppTexturedCube();
    //let app = new AppObjLoader();

    mini3d.init('webgl', app);
}
