
class EventManager{
    constructor(){
        this._eventHandlers = {};
    }

    addEventHandler(event, handler){
        let handlers = this._eventHandlers[event];
        if(handlers==null){
            this._eventHandlers[event] = [];
            handlers = this._eventHandlers[event];
        }

        handlers.push(handler);
    }

    removeEventHandler(event, handler){
        let handlers = this._eventHandlers[event];
        if(handlers!=null && handlers.length>0){
            let idx = handlers.indexOf(handler);
            if(idx>=0){
                handlers.splice(idx, 1);
            }
        }
    }

    removeAllEventHandlers(event){
        this._eventHandlers[event] = null;
    }

    emitEvent(event, data){        
        let handlers = this._eventHandlers[event];
        if(handlers!=null && handlers.length>0){
            for(let handler of handlers){
                handler(event, data);
            }
        }
    }
}

let eventManager = new EventManager();
export { eventManager };