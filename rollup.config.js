import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const pkg = require('./package.json');

export default {
  entry: './version.js',
  dest: pkg.main,
  moduleName: 'Version',
  format: 'iife',
  plugins: [
    nodeResolve({
      main: true,
      jsnext: true,
      browser: true
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    })
  ]
};
