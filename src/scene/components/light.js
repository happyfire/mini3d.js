import { Component } from "./component";

let LightType = {
    Directional: 0,
    Point: 1
};

class Light extends Component {
    constructor(type){
        super();
        this.type = type;
        this.color = [1.0, 1.0, 1.0];
    }
}

export { Light, LightType };