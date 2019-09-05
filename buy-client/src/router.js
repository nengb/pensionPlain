import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home/index.vue'

let { ip, httpAddress, socketAddress, imgAddress, getHrefNew, getQueryStringArgsAes,path } = serverConfig;


Vue.use(Router)
export default new Router({
  base:'/',
  routes: [
    { path:'/',  name: 'home', component: Home },

  

    
    
    
  ]
})

