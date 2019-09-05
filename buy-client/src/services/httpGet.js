import { get } from './api'
import http from '../configs/net/http.js'
import { Toast } from 'vant';
let  { ip, httpAddress, socketAddress, imgAddress, getHrefNew, getQueryString } = serverConfig

const apiCache = new Map()
const apiCacheTime = 1000*10

function getAPI(api, data) {
  return http.getData({ url: `${httpAddress}${api}`, data: data })
}

function setApiCache(api,data,result){
  try{
    let objKey = JSON.stringify({ url: `${httpAddress}${api}`, data: data });
    apiCache.set(objKey, { cacheTime: Date.now() + apiCacheTime, result})
  }catch(e){
  }
}

function getApiCache(api, data) {

  try {
    let objKey = JSON.stringify({ url: `${httpAddress}${api}`, data: data });
    let cacheData = apiCache.get(objKey)
    if (cacheData && Date.now()-cacheData.cacheTime<0 ){
      return cacheData.result
    }
  } catch (e) {
    console.error(e)
  }
    return null
}

const getApiList = {}
for (let api in get) {
  getApiList[api] = async (data) => {
    data = data || {}
    let token = sessionStorage.getItem('token');
    if (token){
      data.token = token;
    }

    let { path, cache } = get[api];
    if (cache) {
      let cacheData = getApiCache(path, data);
      if (cacheData){
        return cacheData
      }
    }

    let result = await getAPI(path, data)
    if ( result && result.errcode == 4000){
        // wx.removeStorageSync('userInfo')
        sessionStorage.removeItem('userInfo')
      let account = sessionStorage.getItem('account');
      if (account){
          let login = await getAPI('/login', { account })
          if (login && login.errcode == 0) {
            sessionStorage.setItem('token',login.data.token);
            window.hasLogin = true;
            setTimeout(() => {
              window.hasLogin = false;
            }, 5000)
            // location.reload()
          }
      }
    }

   
    if (cache){
      console.log(result)
      // typeof result == "object"?result.cacheTime = Date.now() + apiCacheTime:null;
      setApiCache(path, data, result)
    }

    
    return result
  }
}
export default getApiList;
