import { eventManager } from '../event/eventManager';
import { SystemEvent } from '../event/systemEvent';


class InputManager{
    constructor(){        
    }

    init(canvas){
        let dragging = false;
        let lastX = -1, lastY = -1;                  
    
        let onTouchStart = function(event){   
            let x,y;
            if(event.touches){
                let touch = event.touches[0];
                x = touch.clientX;
                y = touch.clientY;
            } else {
                x = event.clientX;
                y = event.clientY;
            }          
                        
            let rect = event.target.getBoundingClientRect();
            if(x>=rect.left && x<rect.right && y>=rect.top && y<rect.bottom){
                lastX = x;
                lastY = y;
                dragging = true;  
                
                eventManager.emitEvent(SystemEvent.touchStart, {x:x,y:y});
            }
        }
    
        let onTouchEnd = function(event){
            dragging = false;  
            eventManager.emitEvent(SystemEvent.touchEnd);      
        }
    
        let onTouchMove = function(event){        
            let x,y;
            if(event.touches){
                let touch = event.touches[0];
                x = touch.clientX;
                y = touch.clientY;
            } else {
                x = event.clientX;
                y = event.clientY;
            } 
            
            if(dragging){                
                let dx = (x-lastX);
                let dy = (y-lastY);
                eventManager.emitEvent(SystemEvent.touchMove, {x:x,y:y,dx:dx,dy:dy});                         
            }
            lastX = x;
            lastY = y;
        }

        canvas.onmousedown = onTouchStart;
        canvas.onmouseup = onTouchEnd;
        canvas.onmousemove = onTouchMove;

        canvas.ontouchstart = onTouchStart;
        canvas.ontouchend = onTouchEnd;
        canvas.ontouchmove = onTouchMove;
    }


}

let inputManager = new InputManager();
export { inputManager };