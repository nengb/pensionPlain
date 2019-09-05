//微信登录
/* eslint-disable */
import serverConfig from '../serverConfig';
// eslint-disable-next-line
let { ip, httpAddress, socketAddress, imgAddress, getHrefNew, getQueryStringArgsAes, getLocation ,dealQuery} = serverConfig;
import http from '../net/http';
import HttpGet from '../../services/httpGet';
import store from '../../store';

class wechatAut {
  constructor() {
  }

  isWeiXin() {
    let ua = window.navigator.userAgent.toLowerCase();
    // console.log(ua);//mozilla/5.0 (iphone; cpu iphone os 9_1 like mac os x) applewebkit/601.1.46 (khtml, like gecko)version/9.0 mobile/13b143 safari/601.1
    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
      return true;
    } else {
      return false;
    }
  }
  // eslint-disable-next-line
  getCodeParamUri({ appid, redirect_uri, response_type, scope, state }) {
    return `appid=` + appid + `&redirect_uri=` + encodeURIComponent(redirect_uri) + `&response_type=` + response_type + `&scope=` + scope + `&state=` + state + `#wechat_redirect`;
  }

  //授权
  getAuthCode({ appid, redirect_uri, response_type, scope, state }) {
    // let { code } = getHrefNew()
    let code= getHrefNew("?","code");

    console.log(`code=》${code}`)
    if (code) {
      // sessionStorage.code=code;
      localStorage.setItem('code', code)
      localStorage.removeItem('lastUrl')
    }

    if (!localStorage.code) {

      let getCodeParam = { appid, redirect_uri, response_type, scope, state };


      localStorage.lastUrl = window.location.href;
      if (this.isWeiXin()) {
        // console.log(`微信浏览器`)
        // document.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?` + this.getCodeParamUri(getCodeParam);
        document.location.replace(`https://open.weixin.qq.com/connect/oauth2/authorize?` + this.getCodeParamUri(getCodeParam));
      } else {
        // console.log(`非微信浏览器`)
        // getCodeParam.appid = 'wx91ab75c357dae833'
        getCodeParam.scope = 'snsapi_login'
        // document.location.href = `https://open.weixin.qq.com/connect/qrconnect?` + this.getCodeParamUri(getCodeParam);
        document.location.replace(`https://open.weixin.qq.com/connect/qrconnect?` + this.getCodeParamUri(getCodeParam))
      }
    }

    this.registerUser();

  }
  //注册用户
  async  registerUser() {
    let code = localStorage.code;
    if (!code) {
      return;
    }

    let u = navigator.userAgent;
    let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端  
    let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端  
    let os = '';
    if (isAndroid) {
      os = "Android";
    }
    else if (isiOS) {
      os = "IOS";
    }

    let brower = this.isWeiXin() ? 0 : 1;
    console.log("HttpGet")
    let { invitor } = getQueryStringArgsAes()

    let wechat_auth = await HttpGet.h5_wechat_auth({ code, os, brower,invitor })
    if (wechat_auth && wechat_auth.errcode == 0 && wechat_auth.data) {
      sessionStorage.openid = wechat_auth.data.openid;
      sessionStorage.unionid = wechat_auth.data.unionid;
      sessionStorage.account = wechat_auth.data.account;
      sessionStorage.os = os;
    }
    localStorage.removeItem('code')
    console.log("wechat_auth")
    console.log(wechat_auth)
    console.log(sessionStorage)

    console.log(sessionStorage.account)

    await this.login()
  }



  //登录服务器
  async login({account}={account:null}) {
    if (!account) {
      account = sessionStorage.account
    }else{
      sessionStorage.account = account;
    }
    console.log(sessionStorage.account)

    console.log("登录账户",account)
    if(!account){
      return;
    }


    let latitude = window.latitude?window.latitude :null;
    let longitude = window.longitude?window.longitude :null;
  
    console.log(22)
    let loginHttp = await HttpGet.login(dealQuery({ account, latitude, longitude}))
    if (loginHttp && loginHttp.data && loginHttp.data.token) {
      sessionStorage.setItem(`token`, loginHttp.data.token)
      await this.reloadUserData()
    }else{
      sessionStorage.clear();

      sessionStorage.removeItem('account');
      sessionStorage.removeItem('openid');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('unionid');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('userid');
    }

  }


  //获取用户信息
  getUserData() {
    try {
      let user = JSON.parse(sessionStorage.getItem('user'));
      if (user) {
        return user;
      }
    } catch (error) {
    }

  }
  //重载用户信息
  async reloadUserData() {
    let user = await HttpGet.get_user_info()
    if (user && user.data) {
      let oldUser = this.getUserData() || {};
      //最后更新时间
      user.data.alterTime = Date.now();
      let newUser = Object.assign(oldUser, user.data);
      sessionStorage.setItem(`user`, JSON.stringify(newUser))
      sessionStorage.setItem(`userid`, user.data.userid)
      store.commit('reloadUser',newUser)
    }
  }


}



export default new wechatAut();