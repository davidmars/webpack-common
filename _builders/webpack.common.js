const path = require('path');
const fs = require('fs');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const webpack = require('webpack');
const svgCollection = require("./svg-collection/svgCollection.js");

var mode="development";

//webpack time
let d=new Date();
let webpackTime=function()
{
    return "" +
        d.getFullYear()
        + "-"
        + String(d.getMonth() + 1).padStart(2, "0")
        + "-"
        + String(d.getDate()).padStart(2, "0")
        + "."
        + String(d.getHours()).padStart(2, "0")
        + ":"
        + String(d.getMinutes()).padStart(2, "0")
        + ":"
        + String(d.getSeconds()).padStart(2, "0")

};

//---assets-----

function getAssetPath(file,addHash=true,baseDirInAsset=""){
    let p=require('path');
    let ext=p.extname(file);
    ext=ext.replace(".","",ext);
    let name=p.basename(file);
    name=name.replace("."+ext,"",name);
    let hash=require('md5-file').sync(file);
    if(addHash){
        name+="-"+hash;
    }
    let dirs=["assets"];
    if(baseDirInAsset){
        dirs.push(baseDirInAsset);
    }
    dirs.push(ext);
    return dirs.join("/")+"/"+name+'.'+ext;

}
//---less-----

const LessPluginAutoprefix=require('less-plugin-autoprefix');
const lessPluginAutoprefix=new LessPluginAutoprefix({browsers: ["last 6 versions"]});
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

var lessOptions=function(){
    return{
        compress: true,
        yuicompress: false,
        optimization: 2,
        cleancss: false,
        paths: ["dist"],
        relativeUrls: true,
        syncImport: false,
        strictUnits: false,
        strictMath: true,
        strictImports: true,
        ieCompat: false,
        sourceMap: true,
        url:false,
        plugins: [lessPluginAutoprefix],
        modifyVars: {
            webpackTime: "'"+webpackTime()+"'",
            build: "'"+module.mode+"'"
        }
    }
};

var cssOptions={
    sourceMap: true,
    minimize: true
};

module.exports = {
    "mode": mode,
    entry: {
        //Le point d'entrée principal
        "main":              path.resolve("./src/main.js"),
        //générateur de sprites svg
        "svg-collection":   path.resolve("./_builders/svg-collection/svg-collection-require-all.js"),
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../dist'),
    },
    plugins: [
        new MiniCssExtractPlugin({filename: "./[name].css"}),
        new SpriteLoaderPlugin(),
        {
            apply: (compiler) => {
                compiler.hooks.beforeCompile.tap('AfterEmitPlugin', (compilation) => {
                    console.log("Début de la compilation "+new Date());
                    svgCollection.init();
                });
            }
        },
        {
            apply: (compiler) => {
                compiler.hooks.done.tap('AfterEmitPlugin', (compilation) => {
                    console.log("Fin  de la compilation "+new Date());
                    svgCollection.buildHtmlPreviews();

                });
            }
        },
        new webpack.DefinePlugin(
            {
                'webpackVersion': JSON.stringify(
                    {
                        "webpackTime":webpackTime()
                    }
                )
            }
        )
    ],
    module: {
        rules: [
            //fonts
            {
                test: /fonts.*\.(eot|ttf|otf|woff|woff2|svg)$/,
                use: [
                    {loader: "file-loader",
                        options: {
                            name (file) {
                                return getAssetPath(file,false,"font");
                            }
                        }
                    },
                ],
            },
            //fichiers html
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                    options: {}
                }
            },
            //images svg etc...
            {
                test: /\.(jpg|gif|txt|png|svg)$/,
                exclude: /inline|fonts.*\.(svg)|svg-collection.*$/,
                use: [
                    {loader: "file-loader",
                        options: {
                            name (file) {
                                let outputFileName=getAssetPath(file);
                                //écrit le nom du fichier dans un fichier texte pour qu'on puisse l'exploiter par la suite
                                require('mkdirp')('dist/assets', function(err) {
                                    // path exists unless there was an error
                                });
                                let f = 'dist/assets/recap.txt';
                                require('fs').appendFile(f, outputFileName, function (err) {});
                                return outputFileName;
                            }
                        }
                    },
                ],
            },
            //css
            {
                test: /\.css$/,
                use: [
                    {
                        loader:MiniCssExtractPlugin.loader
                    },
                    {
                        loader:"css-loader"
                    }
                ]
            },
            //less
            {
                test: /\.(less)$/,
                use: [
                    {
                        loader:MiniCssExtractPlugin.loader
                    },
                    {
                        loader:"css-loader"
                    },
                    {
                        loader:"less-loader",
                        options: lessOptions()
                    },
                ]
            },
            //svg-collection
            {
                test: /svg-collection-(.*)\.svg/,
                use: [
                    {
                        loader:'svg-sprite-loader',
                        options: {
                            extract: true,
                            spriteFilename(svgPath){
                                return svgCollection.spritePathFromFilePath(svgPath)
                            },
                            symbolId: filePath  => svgCollection.symbolIdFromFilePath(filePath)
                        }
                    },
                    {
                        loader:'svgo-loader',
                        options: {
                            plugins: [
                                {"removeViewBox":false}
                                ,{"removeMetadata":true}
                                ,{"removeUnknownsAndDefaults":{
                                        keepDataAttrs: false
                                    }}
                                ,{"convertColors":{
                                        currentColor: true
                                    }}
                                ,{"addAttributesToSVGElement":{
                                        attributes: [
                                            "fill='currentColor'"
                                        ]
                                    }}
                                ,{"removeTitle":true}
                                ,{"cleanupIDs":
                                        {
                                            remove: true,
                                            minify: false,
                                            prefix: '',
                                            preserve: [],
                                            force: true
                                        }
                                }
                                ,{"convertStyleToAttrs":true}
                                ,{"removeStyleElement":true}

                                ,{"removeEmptyContainers":true}
                                ,{"removeUselessDefs":true}
                                ,{"removeAttrs":
                                        {
                                            "attrs": ['xmlns','data-.*','id','class']
                                        }
                                }

                            ]
                        },
                    }
                ],

            }
        ]
    }
};

