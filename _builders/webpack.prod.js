const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.common.js');
var mode="production";
module.exports = merge(common, {
    devtool: 'source-map',
    "mode": mode,
    plugins: [
        new UglifyJSPlugin({sourceMap: true}),
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(mode),
            PRODUCTION: JSON.stringify(true)
        })
   ],
    module:{
        rules:[
            {
                //babelize
                test: [/\.js$/],
                exclude: [/node_modules/],
                loader: 'babel-loader',
                options: { presets: ['@babel/preset-env'] }
            }
        ]
    }
});