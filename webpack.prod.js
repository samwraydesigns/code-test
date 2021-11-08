const merge = require('webpack-merge');
const config = require('./webpack.common.js');
const webpack = require('webpack');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = [
  merge(config, {
    mode: 'production',
    devtool: 'source-map',
    plugins: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      })
    ]
  }),
  merge.smart(config, {
    mode: 'production',
    devtool: 'source-map',
    entry: ['@babel/polyfill', './src/js/main.js'],
    output: {
      filename: 'scripts-legacy.js'
    },
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-shorthand-properties']
          }
        }
      }]
    },
    // plugins: [
    //   new UglifyJsPlugin({
    //     sourceMap: true,
    //     uglifyOptions: {
    //       output: {
    //         comments: false
    //       }
    //     }
    //   }),
    //   new webpack.DefinePlugin({
    //     'process.env': {
    //       NODE_ENV: '"production"'
    //     }
    //   }),
    // ]
  })
];