import { post } from './api'
import http from '../configs/net/http.js'
let  { ip, httpAddress, socketAddress, imgAddress, getHrefNew, getQueryString } = serverConfig

function postAPI(api, data) {
  let token = sessionStorage.getItem('token');
  let url = `${httpAddress}${api}?token=`+token
  let dataType = data.dataType;
	//处理文件类型
	if(dataType == 'formData'){
    return http.postFormData({ url: url, formData: data.formData  })

	}else{
    return http.postData({ url: url, data: data  })

  }

}

const getApiList = {}
for (let api in post) {
  getApiList[api] = async (data) => {
    data = data || {}

    let result = await postAPI(post[api], data)
    if ( result && result.errcode == 4000){
        wx.removeStorageSync('userInfo')
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

    // if (cache){
    //   console.log(result)
    //   // typeof result == "object"?result.cacheTime = Date.now() + apiCacheTime:null;
    //   setApiCache(path, data, result)
    // }

    
    return result
  }
}

export default getApiList;
