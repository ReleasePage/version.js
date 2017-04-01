import babel from 'rollup-plugin-babel';

const pkg = require('./package.json');

export default {
  entry: './version.js',
  format: 'cjs',
  plugins: [
    babel({
      babelrc: true
    })
  ],
  targets: [
    {
      dest: pkg.main,
      format: 'iife'
    }
  ]
};
