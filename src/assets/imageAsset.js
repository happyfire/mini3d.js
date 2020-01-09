class ImageAsset{
    constructor(name, data){
        this.name = name;
        this.data = data;        
    }

    get width(){
        return this.data.width;
    }

    get height(){
        return this.data.height;
    }
}

class ImageLoader {
    loadAsset(name, onComplete){
        let image = new Image();
        image.onload = function(){
            let asset = new ImageAsset(name, image);
            if(onComplete){
                onComplete(asset);
            }            
        }
    }
}

export { ImageAsset, ImageLoader };