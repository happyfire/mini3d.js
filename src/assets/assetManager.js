import { ImageLoader } from "./imageAsset";
import { TextLoader } from "./textAsset";

let AssetType = {
    Text : 'text',
    Image : 'image'    
}

class AssetManager {
    
    constructor(){
        this._loaders = {};
        this._assets = {};

        this.addLoader(AssetType.Image, new ImageLoader());
        this.addLoader(AssetType.Text, new TextLoader());
    }

    addLoader(assetType, loader){
        this._loaders[assetType] = loader;
    }

    loadAsset(name, type, onComplete){
        if(this._assets[name]){
            if(onComplete){
                onComplete(this._assets[name]);
            }
            return;
        }

        let loader = this._loaders[type];
        if(loader){
            loader.loadAsset(name, function(asset){
                this._assets[name] = asset;
                if(onComplete){
                    onComplete(asset);
                }
            }.bind(this));
        } else {
            console.error("missing loader for asset type "+type);
        }
    }

    getAsset(name){
        return this._assets[name];        
    }

    //assetList: [[name,type]]
    loadAssetList(assetList, onAllComplete){
        let remainCount = assetList.length;
        for(let listItem of assetList){
            let name = listItem[0];
            let type = listItem[1];
            this.loadAsset(name, type, function(asset){
                if(asset){
                    remainCount--;
                    if(remainCount===0 && onAllComplete){
                        onAllComplete();
                    }
                } else {
                    console.error('fail to load asset '+name);
                }
            })
        }
    }

}

let assetManager = new AssetManager();

export { AssetType, assetManager };