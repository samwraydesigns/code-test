const merge = require('webpack-merge');
const config = require('./webpack.common.js');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const devConfig = [
  merge(config, {
    mode: 'development',
    devtool: 'inline-source-map',
    plugins: [
      new BundleAnalyzerPlugin(),
    ]
  })
];

if (!process.env.ES6) {
  devConfig.push(
    merge.smart(config, {
      mode: 'development',
      devtool: 'inline-source-map',
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
      }
    })
  )
}

module.exports = devConfig;