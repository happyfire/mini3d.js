class TextAsset{
    constructor(name, data){
        this.name = name;
        this.data = data;        
    }    
}

class TextLoader {
    loadAsset(name, onComplete){
        let request = new XMLHttpRequest();
        request.onreadystatechange = function(){
            if(request.readyState === XMLHttpRequest.DONE && request.status !== 404){
                let asset = new TextAsset(name, request.responseText);
                if(onComplete){
                    onComplete(asset);
                }   
            }
        }       
        request.open('GET', name, true);
        request.send();
    }
}

export { TextAsset, TextLoader };