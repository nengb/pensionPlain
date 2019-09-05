import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user:{},
    signLink:{},
    isMini:true,
    jsApi:{},
    jssdk:false,
  },
  mutations: {
    reloadUser:(state,user)=>{
      state.user = user;
    },
    addSignLink:(state,url,signLink)=>{
      state.signLink[url] = signLink;
    },
    updateIsMini:(state,updateState)=>{
      state.isMini = updateState;
    },
    updateJsApi:(state,checkJsApi)=>{
      state.jsApi = checkJsApi
    },
    updateJssdk:(state,updateState)=>{
      state.jssdk = updateState
    }



  },
  actions: {

  }
})
