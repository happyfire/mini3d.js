
import { LightType } from "./components/light";

class SceneForwardRendererConfig
{
    constructor(){
        this.MaxForwardAddLights = 5;
    }
}

class SceneForwardRenderer{
    constructor(){
        this.config = new SceneForwardRendererConfig();        
        this._mainLight = null;
        this._additionalLights = [];
    }

    //确定一个主光源和多个附加光源
    //主光源是亮度最高的平行光
    //附加光源是其他所有光源，包含平行光和点光源，附加光源数量不超过 MaxForwardAddLights
    //主光源使用材质的forwardbase pass渲染
    //每个附加光源分别使用forwardadd pass渲染一次（多pass)
    //主光源阴影渲染（如果开启）则使用材质的shadow caster pass渲染到一张shadow map

    //TODO: 按物体分配附加灯光（URP模式）
    prepareLights(lights)
    {        
        let mainLight = null;
        let additionalLights = [];

        let maxIntensity = 0;
        
        for(let light of lights){                
            if(light.type == LightType.Directional){
                if(light.intensity > maxIntensity){
                    maxIntensity = light.intensity;
                    mainLight = light;
                }                                
            }            
        }    

        let addLightCount = 0;
        for(let light of lights){
            if(light != mainLight && addLightCount < this.config.MaxForwardAddLights){
                addLightCount++;
                additionalLights.push(light);
            }
        }  
        
        this._mainLight = mainLight;
        this._additionalLights = additionalLights;
    }

    render(scene){
        //TODO: 找出camera, 灯光和可渲染结点，逐camera进行forward rendering
        //1. camera frustum culling
        //2. 逐队列渲染
        //   2-1. 不透明物体队列，按材质实例将node分组，然后排序（从前往后）
        //   2-2, 透明物体队列，按z序从后往前排列

        
        this.prepareLights(scene.lights);           

        //TODO: camera需要排序，按指定顺序渲染
        for(let camera of scene.cameras){
            camera.beforeRender();

            

            //投影Pass
            for(let rnode of scene.renderNodes){
                if(rnode.castShadow){
                    
                }
            }
          
            for(let rnode of scene.renderNodes){
                rnode.render(scene, camera, this._mainLight, this._additionalLights, scene.projectors);
            }

            camera.afterRender();
        }

        
    }

}

export { SceneForwardRenderer };