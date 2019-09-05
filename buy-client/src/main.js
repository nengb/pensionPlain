//应用版本号
window.version = "1.0.0";
console.log(`window.localtion`)
console.log(window.location.href)

// var vConsole = new VConsole();
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

//加密模块
import './configs/crypto/crypto'
/* 全局自定义组件 */
import './configs/serverConfig'
//网络模块
import './configs/net'
//微信网页授权
import { wechatAut,jssdk } from './configs/wechat'
import { Lazyload, Dialog, } from 'vant';

import VueClipboard from 'vue-clipboard2'

Vue.use(VueClipboard)

Vue.use(Dialog)
Vue.use(Lazyload, {
  preLoad: 1,
  error: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGgAAABZCAYAAADSOmGpAAAA6klEQVR4nO3RQQ3AIADAwDH/VgkSwAFf+rhT0KRjzrU/sv7XAdwZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBz6bBHrAwg05AAAAAElFTkSuQmCC',
  loading: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGgAAABZCAYAAADSOmGpAAAA6klEQVR4nO3RQQ3AIADAwDH/VgkSwAFf+rhT0KRjzrU/sv7XAdwZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBz6bBHrAwg05AAAAAElFTkSuQmCC  ',
  attempt: 3
})

//添加长按指令
Vue.directive('longpress', function (el, binding){
  var timer = null;
  var start = function (e) {
      // 如果是点击事件，不启动计时器，直接返回
      if (e.type === 'click'){
          return
      }
      if (timer == null){
          // 创建定时器 ( 2s之后执行长按功能函数 )
          timer = setTimeout(function () {
              //执行长按功能函数
              binding.value()
          },2000)
      }
  }
  var cancel = function () {
      if (timer !== null){
          clearTimeout(timer)
          timer = null
      }
  }

  // 添加事件监听器
el.addEventListener("mousedown", start);
el.addEventListener("touchstart", start);
// 取消计时器
el.addEventListener("click", cancel);
el.addEventListener("mouseout", cancel);
el.addEventListener("touchend", cancel);
el.addEventListener("touchcancel", cancel);
})

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
