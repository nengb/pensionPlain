const autoprefixer = require('autoprefixer');
const pxtorem = require('postcss-pxtorem');
module.exports = {
  publicPath: '/',

  css: {
    loaderOptions: {
      postcss: {
        plugins: [
       
              autoprefixer(),
          pxtorem({
            rootValue: 16,
            propList: ['font','font-size'],
            // 该项仅在使用 Circle 组件时需要
            // 原因参见 https://github.com/youzan/vant/issues/1948
            // selectorBlackList: ['van-circle__layer']
          })
        ]
      },
      stylus: {
        'resolve url': true,
        'import': []
      }
    }
  },

  outputDir: undefined,
  assetsDir: undefined,
  runtimeCompiler: undefined,
  productionSourceMap: undefined,
  parallel: undefined,
  
  pluginOptions: {
    
    'cube-ui': {
      postCompile: false,
      theme: false
    }
  }
}
