# webpack_build_optimize

> A Vue.js project

时间统计(在前一优化保留的情况下，计算的时间)：  
未优化前：7060ms,6164ms,5975ms,7486ms,7185ms
开启webpack的cache 优化后：6175ms,6023ms,5933ms,6075ms
开启babel-loader的cache 优化后：6091ms,6021ms,6492ms,5980ms
换用webpack-uglify-parallel并行压缩代码 优化后(有效减少构建时间，推荐使用)：4381ms,3646ms,3639ms,3671ms


* 从网上搜到的优化方案：
1. 开启webpack的cache
2. 开启babel-loader的cache
3. 配置modules以及配置项目相关的alias
4. 配置loader的include和exclude
5. 使用CommonsChunkPlugin提取公用模块
6. 使用DllPlugin和DllReferencePlugin预编译（把不常变动的第三方库都提取出来，下次 build 的时候不再构建这些库，减少构建时间）
7. 换用happypack多进程构建
8. css-loader换成0.14.5版本
9. 换用webpack-uglify-parallel并行压缩代码  
参考：https://molunerfinn.com/Webpack-Optimize/

* 自己补充的优化方法：
1. 配置externals，script标签引入cdn文件（使用cdn，减少需要打包的第三方模块，减少vendor体积）
1. vue-router 路由懒加载
1. gzip压缩（CompressionPlugin插件实现；部署上线时, 服务端也需要开启 gzip 压缩）

* vue-cli已经实现的功能：
1. 需要的modules，在node_modules中的，都提取到vendor（CommonsChunkPlugin实现的）

* 需要的modules，在node_modules中的，都提取到vendor，会导致两个问题:  
1. 业务越复杂, 三方依赖会越多, vendor 包会越大
2. 没有隔离业务路由组件, 所有的路由都有可能会去加载 vendor, 但并不是所有的路由组件都依赖 node_modules 下的所有模块  
所以, 上述提取公共依赖的方式不可取. 我们应该去分析业务依赖和路由, 尽可能将所有路由组件的公共依赖提取出来，既要去提取公共依赖, 也要避免 vendor 包过于太大。

* 问题：路由懒加载是异步加载，有可能导致 webpack 每次的 cache 失效，所以每次的rebuild会慢
  解决：此时，可以只在正式环境下使用懒加载。

*  没做优化之前，npm run build 产生的目录结构如下：
```
dist
    static
        css
            app.[hash-code].css
            app.[hash-code].css.map
        js
            app.[hash-code].js
            manifest.[hash-code].js
            vendor.[hash-code].js
        index.html
```
其中，build后的css引入在打包后的index.html文件head标签里，js引入在body结束标签之前。 

如果不使用CommonsChunkPlugin提取公共代码，所有的资源，包括第三方库，都会打包到app.js。
CommonsChunkPlugin配置中，需要的modules，在node_modules中的，都提取到vendor。

vendor的hash在不管修改哪个文件后重新打包都会变化，原来把vendor搞出来，只是提取了公共模块，只要一发布版本，hash肯定变了。解决方法是manifest。

尽管我们已经划分好了 chunks，也提取了公共的模块，但仅改动一个模块的代码还是会造成 Initial chunk 的变化。原因是这个初始块包含着 webpack runtime，而 runtime 还包含 chunks ID 及其对应 chunkhash 的对象。因此当任何 chunks 内容发生变化，webpack runtime 均会随之改变。
我们可以通过增加一个指定的公共 chunk 来提取 runtime，从而进一步实现持久化缓存：
```
    // 提取webpack runtime和module清单到此文件，目的是当app bundle更新的时候，阻止vendor hash被更新
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor']
    })
```
这样在我们构建之后，就会多打包一个特别小的 manifest.js，解决了 libs 经常「被」更新的问题。

webpack.prod.conf.js 文件中，ExtractTextPlugin用于提取vue文件中的css；

CommonsChunkPlugin用于提取公共代码，CommonsChunkPlugin做的事情是：在你的多个入口所引用的代码中，找出其中被多个页面引用过的代码段，判定为公共代码打包成一个独立的 js 文件。至此，只需要在每个页面加载这个公共代码段的 js 文件，既可以保持代码的完整性，又不会下载公共代码。

对于单页应用（单入口）来说，公共包只有他自己使用，不能算公共包。这个插件提取的公共包，每次是会重新打包的（Etag会不同），无论是节约打包时间，还是对浏览器缓存的利用都不是好的方案。最佳方案浮出水面：DllPlugin。

DllPlugin有什么优势？只对库文件打包一次。也就是说，只要库文件不变，只需要打包一次，以后再打包业务代码和库文件没关系啦，这样一来真正做到了库文件永远是那个库文件，只要库文件不变，缓存永远有效（Etag不变）。

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
