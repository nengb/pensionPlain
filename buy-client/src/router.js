import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home/index.vue'
import Movie from './views/Movie/index.vue'

let { ip, httpAddress, socketAddress, imgAddress, getHrefNew, getQueryStringArgsAes,path } = serverConfig;


Vue.use(Router)
export default new Router({
  base:'/',
  routes: [
    { path:'/',  name: 'home', component: Home },
    { path:'/movie',  name: 'movie', component: Movie },

  

    
    
    
  ]
})

