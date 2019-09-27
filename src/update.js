


export default function update(){
    console.log((new Date()).toTimeString());
    setTimeout(update, 1000);
}