'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ClosureCompilerPlugin = require('webpack-closure-compiler');

module.exports = {
  devtool: 'eval-source-map',
  context: path.join(__dirname, '/client'),
  entry: './main.js',
  output: {
    path: path.join(__dirname, '/dist/'),
    filename: 'dist',
    publicPath: '/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.tpl.html',
      inject: 'body',
      filename: 'index.html'
    }),
    new ClosureCompilerPlugin({
      compiler: {
        language_in: 'ECMASCRIPT6',
        language_out: 'ECMASCRIPT5',
        compilation_level: 'ADVANCED'
      },
      concurrency: 3,
    }),
    new webpack.optimize.OccurenceOrderPlugin()
  ],
  module: {
    loaders: [{
      test: /\.js?$/,
      exclude: /node_modules/,
      loader: 'babel'
    }, {
      test: /\.json?$/,
      loader: 'json'
    }, {
      test: /\.css$/,
      loader: 'style!css?modules&localIdentName=[name]---[local]---[hash:base64:5]'
    }]
  }
};
