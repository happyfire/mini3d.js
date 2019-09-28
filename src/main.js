import update from './update.js';

// even though Rollup is bundling all your files together, errors and
// logs will still point to your original source modules
console.log('if you have sourcemaps enabled in your devtools, click on main.js:5 -->');

let input = [1,2,3];
input = input.map(item => item+1);
console.log(input);

update();

function foo(x,y='world'){
    console.log(x,y);
}

foo("hello");
foo("hello","China");

let arrayLike = {
    '0':'a',
    '1':'b',
    '2':'c',
    length:3
};

let arr = Array.from(arrayLike);
console.log(arr);
