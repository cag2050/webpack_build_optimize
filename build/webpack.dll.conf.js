const path = require('path');
const webpack = require('webpack');

var AssetsPlugin = require('assets-webpack-plugin'); // 生成文件名，配合HtmlWebpackPlugin增加打包后dll的缓存
var CleanWebpackPlugin = require('clean-webpack-plugin'); // 清空文件夹

module.exports = {
    entry: {
        libs: [
            'vue/dist/vue.esm.js',
            'vue-router'
        ] // 需要打包起来的依赖
    },
    output: {
        path: path.join(__dirname, '../static'), // 输出的路径
        filename: '[name].dll.[chunkhash:7].js', // 输出的文件，将会根据entry命名为libs.dll.js
        library: '[name]_library' // 暴露出的全局变量名
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.join(__dirname, '../static', '[name]-mainfest.json'), // 描述依赖对应关系的json文件
            name: '[name]_library',
            context: __dirname // 执行的上下文环境，对之后DllReferencePlugin有用
        }),
        new AssetsPlugin({
            filename: 'bundle-config.json',
            path: './static'
        }),
        new CleanWebpackPlugin(['static'], {
            root: path.join(__dirname, '../'), // 绝对路径
            verbose: true, // 是否显示到控制台
            dry: false // 不删除所有
        }),
        new webpack.optimize.UglifyJsPlugin({ // uglifjs压缩
            compress: {
                warnings: false
            }
        })
    ]
}
