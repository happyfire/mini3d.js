import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
//import { terser } from 'rollup-plugin-terser';

// npm run build -> production is true
// npm run dev -> production is false
const production = !process.env.ROLLUP_WATCH;

export default [ {
    input: 'src/mini3d.js',
    output: {        
        format: 'iife',
        name: 'mini3d',
        file: 'build/mini3d.js',
        sourcemap: true
    },
    plugins:[
        resolve(),  // tells Rollup how to find date-fns in node_modules
        commonjs(), // converts date-fns to ES modules
        // babel({
        //     exclude:'node_modules/**'
        // }),
        
        //production && terser() // minify, but only in production
    ]
},{
    input: 'examples/src/main.js',
    output: {
        file: 'build/examples/bundle.js',
        format: 'iife',
        name: 'main',
        sourcemap: true
    },
    plugins:[
        resolve(),  // tells Rollup how to find date-fns in node_modules
        commonjs(), // converts date-fns to ES modules
        babel({
            exclude:'node_modules/**'
        }),
        
        //production && terser() // minify, but only in production
    ]
}]