# webpack_build_optimize

> A Vue.js project

1. 没做优化之前，npm run build 产生的目录结构如下：
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
