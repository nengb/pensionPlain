/* eslint-disable */

let { serverConfig, getData,wx } = window;
let { ip, httpAddress, socketAddress, imgAddress, getHrefNew, getQueryString ,getLocation } = serverConfig;
import HttpGet from '../../services/httpGet';
import store from '../../store';

class jssdk {
    constructor(){

    }
    async run(){

    //   let we_conf = await getData({url:`${httpAddress}/get_wechat_config`})
    console.log(window)
        console.log(window.location.href)
        //history模式，安卓手机每次更换页面需要重新配置签名，ios由于url永远不变，只需要配置一次
        if(!/(Android)/i.test(navigator.userAgent) && window.jssdk){
            return;
        }
        let url = location.href.split('#')[0];
        let storeSignLink = store.state.signLink[url]
        let signLink =  storeSignLink ? storeSignLink : location.href.split('#')[0] ;
        console.log("signLink")
        console.log(signLink)
     
        let we_conf = await HttpGet.get_wechat_jssdk_config({url:signLink})
        if( we_conf && we_conf.errcode == 0 && we_conf.data){
            let { appid, timestamp, noncestr, signature  } = we_conf.data
            let jsApiConfOption = {
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: appid, // 必填，公众号的唯一标识
                timestamp: timestamp, // 必填，生成签名的时间戳
                nonceStr: noncestr, // 必填，生成签名的随机串
                signature: signature,// 必填，签名
                jsApiList: [
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'updateAppMessageShareData',
                    'updateTimelineShareData',
                    'onMenuShareQQ',
                    'chooseImage',
                    'openLocation',
                    'getLocation',
                    'openAddress',
                    //'uploadImage'
                    // 'updateAppMessageShareData',
                    // 'updateTimelineShareData',
                ], // 必填，需要使用的JS接口列表
            }

            wx.config(jsApiConfOption);
            store.commit('updateIsMini',window.__wxjs_environment === 'miniprogram');

            wx.ready(async ()=>{
                console.log('jssdk 准备好了')
                // alert('jssdk 准备好了')
                window.jssdk = true;
                store.commit('addSignLink',url,signLink);
                // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
        
                console.log(11)
                let local = await getLocation();
                console.log(`getLocation`)
                console.log(local)

                if(local){
                    let latitude = local.latitude
                    let longitude = local.longitude
                    let uploadLocation = await HttpGet.uploadLocation({  latitude, longitude })
                }

                store.commit('updateIsMini',window.__wxjs_environment === 'miniprogram');
                store.commit('updateJssdk',true);

                wx.checkJsApi({
                    jsApiList: jsApiConfOption.jsApiList, // 需要检测的JS接口列表，所有JS接口列表见附录2,
                    success: function(res) {
                    // 以键值对的形式返回，可用的api值true，不可用为false
                    // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
                        if(res && res.errMsg == 'checkJsApi:ok'){
                            let checkResult = res.checkResult;
                            store.commit('updateJsApi',checkResult)
                        }
                    }
                });

                function ready() {
                    console.log("window.__wxjs_environment === 'miniprogram'") // true
                    console.log(window.__wxjs_environment === 'miniprogram') // true
                }
                if (!window.WeixinJSBridge || !WeixinJSBridge.invoke) {
                document.addEventListener('WeixinJSBridgeReady', ready, false)
                } else {
                ready()
                }



            });
            wx.error(function(res){
                console.log('jssdk 失败')
                console.log(res)

                // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
            
            });

        }


    }

   
}



export default new jssdk()