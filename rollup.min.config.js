import uglify from 'rollup-plugin-uglify';
import config from './rollup.config';

const pkg = require('./package.json');

config.plugins.push(uglify());
config.targets = [{
  dest: pkg.browser,
  format: 'iife'
}];

export default config;
