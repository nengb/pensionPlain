(function(e){function t(t){for(var r,i,s=t[0],c=t[1],u=t[2],d=0,f=[];d<s.length;d++)i=s[d],Object.prototype.hasOwnProperty.call(a,i)&&a[i]&&f.push(a[i][0]),a[i]=0;for(r in c)Object.prototype.hasOwnProperty.call(c,r)&&(e[r]=c[r]);l&&l(t);while(f.length)f.shift()();return o.push.apply(o,u||[]),n()}function n(){for(var e,t=0;t<o.length;t++){for(var n=o[t],r=!0,s=1;s<n.length;s++){var c=n[s];0!==a[c]&&(r=!1)}r&&(o.splice(t--,1),e=i(i.s=n[0]))}return e}var r={},a={app:0},o=[];function i(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,i),n.l=!0,n.exports}i.m=e,i.c=r,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)i.d(n,r,function(t){return e[t]}.bind(null,r));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="/";var s=window["webpackJsonp"]=window["webpackJsonp"]||[],c=s.push.bind(s);s.push=t,s=s.slice();for(var u=0;u<s.length;u++)t(s[u]);var l=c;o.push([0,"chunk-vendors"]),n()})({0:function(e,t,n){e.exports=n("56d7")},1:function(e,t){},1618:function(e,t,n){"use strict";var r=n("1b22"),a=n.n(r);a.a},"1b22":function(e,t,n){},"56d7":function(e,t,n){"use strict";n.r(t);n("66cf");var r=n("343b"),a=(n("e17f"),n("2241")),o=(n("cadf"),n("551c"),n("f751"),n("097d"),n("2b0e")),i=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{attrs:{id:"app"}},[n("keep-alive",[e.$route.meta.keepAlive?n("router-view"):e._e()],1),e.$route.meta.keepAlive?e._e():n("router-view")],1)},s=[],c=n("2877"),u={},l=Object(c["a"])(u,i,s,!1,null,null,null),d=l.exports,f=n("8c4f"),p=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"home"},[n("div",{staticClass:"headTitle"},[e._v("养老基金计算器")]),n("van-cell-group",[n("van-field",{attrs:{label:"今年多少岁",placeholder:"今年多少岁"},model:{value:e.age,callback:function(t){e.age=t},expression:"age"}}),n("van-field",{attrs:{label:"退休年龄",placeholder:"请输入退休年龄"},model:{value:e.retireYear,callback:function(t){e.retireYear=t},expression:"retireYear"}}),n("van-field",{attrs:{label:"退休月花销",placeholder:"退休每个月的花销"},model:{value:e.retireMonthCostMoney,callback:function(t){e.retireMonthCostMoney=t},expression:"retireMonthCostMoney"}}),n("van-field",{attrs:{label:"寿命",placeholder:"请输入寿命"},model:{value:e.lifeMax,callback:function(t){e.lifeMax=t},expression:"lifeMax"}}),n("van-field",{attrs:{label:"每个月存的钱",placeholder:"每个月存的钱"},model:{value:e.monthSaveMoney,callback:function(t){e.monthSaveMoney=t},expression:"monthSaveMoney"}}),n("van-field",{attrs:{label:"通货膨胀率",placeholder:"通货膨胀率"},model:{value:e.inflationRate,callback:function(t){e.inflationRate=t},expression:"inflationRate"}}),n("van-field",{attrs:{label:"年收益率",placeholder:"年收益率"},model:{value:e.earnRate,callback:function(t){e.earnRate=t},expression:"earnRate"}})],1),n("div",{staticClass:"btn"},[n("van-button",{attrs:{type:"primary"},on:{click:e.saveMoney}},[e._v(" 生成报告")])],1),n("div",{staticClass:"report"},[n("div",{staticClass:"title"},[e._v("退休花销")]),n("div",{staticClass:"con"},e._l(e.retireReport,(function(t){return n("p",[e._v(e._s(t))])})),0)]),n("div",{staticClass:"report"},[n("div",{staticClass:"title"},[e._v("存钱计划")]),n("div",{staticClass:"con"},e._l(e.report,(function(t){return n("p",[e._v(e._s(t))])})),0)])],1)},h=[],g=(n("c5f6"),n("96cf"),n("3b8d")),v=n("bd86"),m=(n("66b9"),n("b650")),w=(n("0653"),n("34e9")),y=(n("c194"),n("7744")),b=(n("be7f"),n("565f")),x=(n("ac6a"),n("5df3"),n("f400"),{search_movie:{path:"/search_movie",cache:!0}}),A=(n("a481"),n("8e6e"),n("456d"),n("e7c1")),k=n.n(A),S=(n("d185"),n("10ad"),n("34ef"),n("6b54"),n("4917"),n("7618")),F=(n("28a5"),n("d225")),R=n("b0b4"),j=function(){function e(){Object(F["a"])(this,e);this.ip=window.location.hostname,this.httpAddress="".concat(window.location.protocol,"//").concat(this.ip,":13581"),this.loca_key="!@$%&S&@",this.socketAddress="".concat(this.ip,":10000")}return Object(R["a"])(e,[{key:"getUrlAesData",value:function(e,t){document.location.href;var n=this.getHrefNew("?","data"),r=decodeURIComponent(n);return r}},{key:"getHashSearch",value:function(){var e=window.location.hash.split("?");return e[1]?"?"+e[1]:""}},{key:"getQueryStringArgs",value:function(e){var t="";if(e.length>0){var n=e.split("?");t=2==n.length?n[1]:n[0]}var r={},a=t.length?t.split("&"):[],o=null,i=null,s=null,c=0,u=a.length;for(c=0;c<u;c++)o=a[c].split("="),i=decodeURIComponent(o[0]),s=decodeURIComponent(o[1]),i.length&&(r[i]=s);return r}},{key:"getQueryStringArgsAes",value:function(){var e=this.getUrlAesData(),t=AesDecrypt(e,this.loca_key,128);try{e=JSON.parse(t)}catch(n){e={}}return e}},{key:"genQueryString",value:function(e,t){var n=e;if(t&&"null"!=t&&"object"==Object(S["a"])(t)){try{var r=sessionStorage.userid;r&&(t.invitor_id=r),t=JSON.stringify(t)}catch(o){}var a=AesEncrypt(t,this.loca_key,128);a=encodeURIComponent(a),n=n+"?data="+a}return n}},{key:"getHrefNew",value:function(e,t){var n,r=document.location.href,a=r.match(/(https?:)\/\/([^\/]+)(\/[^\?]*)?(\?[^#]*)?(#.*)?/),o=(a[1],a[2],a[3],a[4]),i=a[5];if("?"==e&&o&&(n=o.replace("?","")),"#"==e&&i&&(n=i.split("?")[1]),n)if(n.indexOf("&")>-1)for(var s in n=n.split("&"),n){a=n[s].split("=");if(a[0]==t)return a[1]}else{a=n.split("=");if(a[0]==t)return a[1]}}},{key:"getToken",value:function(){return sessionStorage.token}},{key:"formatTime",value:function(e){e=new Date(Number(e));var t=e.getFullYear(),n=e.getMonth()+1,r=e.getDate(),a=e.getHours(),o=e.getMinutes(),i=e.getSeconds();return[t,n,r].map(this.formatNumber).join("-")+" "+[a,o,i].map(this.formatNumber).join(":")}},{key:"formatSortTime",value:function(e){e=new Date(Number(e));e.getFullYear();var t=e.getMonth()+1,n=e.getDate(),r=e.getHours(),a=e.getMinutes();e.getSeconds();return[t,n].map(this.formatNumber).join("/")+" "+[r,a].map(this.formatNumber).join(":")}},{key:"formatNumber",value:function(e){return e=e.toString(),e[1]?e:"0"+e}},{key:"getTime",value:function(e){var t=6e4,n=60*t,r=24*n,a=30*r,o=Date.now(),i=o-e;if(i<0)return"刚刚";var s=i/a,c=i/r,u=i/n,l=i/t,d="";if(s>=1)d=parseInt(s)+"月前";else if(c>=1)switch(parseInt(c)){case 1:d="昨天";break;case 2:d="前天";break;default:d=parseInt(c)+"天前";break}else d=u>=1?parseInt(u)+"小时前":l>=1?parseInt(l)+"分钟前":"刚刚";return d}},{key:"dealQuery",value:function(e){for(var t in e){var n=e[t];null==n&&delete e[t]}return e}},{key:"fullScreenCall",value:function(){var e=document.documentElement,t=e.requestFullScreen||e.webkitRequestFullScreen||e.mozRequestFullScreen||e.msRequestFullscreen;if("undefined"!=typeof t&&t)t.call(e);else if("undefined"!=typeof window.ActiveXObject){var n=new ActiveXObject("WScript.Shell");null!=n&&n.SendKeys("{F11}")}}},{key:"checkFull",value:function(){var e=document.fullscreenEnabled||window.fullScreen||document.webkitIsFullScreen||document.msFullscreenEnabled;return void 0===e&&(e=!1),e}},{key:"fullExitCall",value:function(){var e=document,t=document.exitFullscreen||document.webkitCancelFullScreen||document.msExitFullscreen||document.mozCancelFullScreen;if("undefined"!=typeof t&&t)t.call(e);else if("undefined"!=typeof window.ActiveXObject){var n=new ActiveXObject("WScript.Shell");null!=n&&n.SendKeys("{F11}")}}},{key:"formatSize",value:function(e){var t=(e/1024).toFixed(2),n=(t/1024).toFixed(2),r=(n/1024).toFixed(2);return r>1?"".concat(r,"G"):n>1?"".concat(n,"M"):t>1?"".concat(t,"K"):"".concat(e,"B")}},{key:"deepCopy",value:function(e){if(e instanceof Array){for(var t=[],n=0;n<e.length;++n)t[n]=this.deepCopy(e[n]);return t}if(e instanceof Object){t={};for(var n in e)t[n]=this.deepCopy(e[n]);return t}return e}},{key:"dataURLtoFile",value:function(e,t){console.log("dataURLtoFile223");var n=e.split(",");console.log(n.length),console.log(n);var r=n[0].match(/:(.*?);/)[1];console.log(r.length);var a=atob(n[1]),o=a.length,i=new Uint8Array(o);while(o--)i[o]=a.charCodeAt(o);return new File([i],t,{type:r})}},{key:"photoCompress",value:function(e,t){var n=this;return new Promise(function(){var r=Object(g["a"])(regeneratorRuntime.mark((function r(a,o){var i,s;return regeneratorRuntime.wrap((function(r){while(1)switch(r.prev=r.next){case 0:i=new FileReader,s=n,i.readAsDataURL(e),i.οnlοad=Object(g["a"])(regeneratorRuntime.mark((function e(){var n;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return n=this.result,e.t0=a,e.next=4,s.canvasDataURL(n,t);case 4:e.t1=e.sent,(0,e.t0)(e.t1);case 6:case"end":return e.stop()}}),e,this)})));case 4:case"end":return r.stop()}}),r)})));return function(e,t){return r.apply(this,arguments)}}())}},{key:"canvasDataURL",value:function(e,t){return new Promise((function(n,r){var a=new Image;a.src=e,a.onload=function(){var e=this,r=e.width,a=e.height,o=r/a;r=t.width||r,a=t.height||r/o;var i=.7,s=document.createElement("canvas"),c=s.getContext("2d"),u=document.createAttribute("width");u.nodeValue=r;var l=document.createAttribute("height");l.nodeValue=a,s.setAttributeNode(u),s.setAttributeNode(l),c.drawImage(e,0,0,r,a),t.quality&&t.quality<=1&&t.quality>0&&(i=t.quality);var d=s.toDataURL("image/jpeg",i);n(d)}}))}},{key:"showSize",value:function(e){var t=e.replace("data:image/jpeg;base64,",""),n=t.indexOf("=");t.indexOf("=")>0&&(t=t.substring(0,n));var r=t.length,a=parseInt(r-r/8*2);console.log("```````````````"+r);var o="";o=(a/1048576).toFixed(2),console.log("```````````````"+o);var i=o+"",s=i.indexOf("."),c=i.substr(s+1,2);return"00"==c?i.substring(0,s)+i.substr(s+3,2):parseInt(o)}},{key:"getLocation",value:function(){var e=Object(g["a"])(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise((function(e,t){console.log(window.jssdk),window.jssdk?wx.getLocation({type:"gcj02",success:function(){var t=Object(g["a"])(regeneratorRuntime.mark((function t(n){var r,a;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:r=n.latitude,a=n.longitude,n.speed,n.accuracy,window.latitude=r,window.longitude=a,e(n);case 7:case"end":return t.stop()}}),t)})));function n(e){return t.apply(this,arguments)}return n}(),fail:function(t){e(null)}}):e(null)})));case 1:case"end":return e.stop()}}),e)})));function t(){return e.apply(this,arguments)}return t}()},{key:"chooseImage",value:function(){var e=Object(g["a"])(regeneratorRuntime.mark((function e(t,n){var r=this;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise((function(e,a){window.jssdk&&t>0?wx.chooseImage({count:t,sizeType:["original","compressed"],sourceType:["album","camera"],success:function(){var t=Object(g["a"])(regeneratorRuntime.mark((function t(a){var o,i,s,c,u,l;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:if(o=a.localIds,i=[],console.log("chooseImage"),console.log(a),!(o&&o.length>0)){t.next=21;break}s=0;case 6:if(!(s<o.length)){t.next=21;break}return t.next=9,r.getLocalImgData(o[s]);case 9:if(c=t.sent,!c){t.next=18;break}if(u="".concat(n,"-").concat(Date.now(),"-").concat(s,".jpeg"),l=r.showSize(c),!(l>1)){t.next=17;break}return t.next=16,r.canvasDataURL(c,{quality:.2});case 16:c=t.sent;case 17:i[s]={content:c,file:r.dataURLtoFile(c,u),length:c.length};case 18:s++,t.next=6;break;case 21:console.log("imgData"),console.log(i),e(i);case 24:case"end":return t.stop()}}),t)})));function a(e){return t.apply(this,arguments)}return a}(),fail:function(t){e(null)}}):e(null)})));case 1:case"end":return e.stop()}}),e)})));function t(t,n){return e.apply(this,arguments)}return t}()},{key:"getLocalImgData",value:function(){var e=Object(g["a"])(regeneratorRuntime.mark((function e(t){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise((function(e,n){window.jssdk&&t?wx.getLocalImgData({localId:t,success:function(t){var n=t.localData,r=navigator.userAgent,a=r.indexOf("Android")>-1||r.indexOf("Adr")>-1;n=a?" data:image/jpeg;base64,"+n:n.replace("jgp","jpeg"),e(n)},fail:function(t){e(null)}}):e(null)})));case 1:case"end":return e.stop()}}),e)})));function t(t){return e.apply(this,arguments)}return t}()},{key:"getFlatternDistance",value:function(e,t,n,r){var a=6378137,o=Math.PI;function i(e){return e*o/180}var s,c,u,l,d,f,p,h=i((e+n)/2),g=i((e-n)/2),v=i((t-r)/2),m=Math.sin(g),w=Math.sin(v),y=Math.sin(h),b=a,x=1/298.257;return m*=m,w*=w,y*=y,s=m*(1-w)+(1-y)*w,c=(1-m)*(1-w)+y*w,u=Math.atan(Math.sqrt(s/c)),l=Math.sqrt(s*c)/u,d=2*u*b,f=(3*l-1)/2/c,p=(3*l+1)/2/s,d*(1+x*(f*y*(1-m)-p*(1-y)*m))}}]),e}();function C(e){var t=new WeakMap,n={get:function(e,n){var r=Reflect.get(e,n);return"function"!==typeof r?r:(t.has(r)||t.set(r,r.bind(e)),t.get(r))}},r=new Proxy(e,n);return r}window.serverConfig=C(new j);var O=window.serverConfig;var _=O.ip,U=O.httpAddress;O.socketAddress,O.imgAddress,O.getHrefNew,O.getQueryString,O.getQueryStringArgs;function E(e){}function B(e){return M.apply(this,arguments)}function M(){return M=Object(g["a"])(regeneratorRuntime.mark((function e(t){var n;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise((function(e,r){t.data||(t.data={}),"lottery"==t.data.apiService&&(t.url=t.url.replace(U,"http://".concat(_,":9020"))),k.a.ajax({type:"get",url:t.url,data:t.data,dataType:"json",async:!0,success:function(t){n=t,E(n),e(n)},error:function(t,n,r){e(null)},timeout:5e3})})));case 1:case"end":return e.stop()}}),e)}))),M.apply(this,arguments)}function Q(e){return D.apply(this,arguments)}function D(){return D=Object(g["a"])(regeneratorRuntime.mark((function e(t){var n,r,a,o;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return n=t.url,r=t.data,o=r.dataType,"formData"==o&&(r=r.formData),e.abrupt("return",new Promise((function(e,t){var i={type:"post",url:n,data:r,dataType:"json",async:!0,success:function(t){a=t,E(a),e(a)},error:function(t,n,r){e(null)},timeout:5e3};"formData"==o&&(i["processData"]=!1,i["contentType"]=!1),k.a.ajax(i)})));case 4:case"end":return e.stop()}}),e)}))),D.apply(this,arguments)}function I(e){return G.apply(this,arguments)}function G(){return G=Object(g["a"])(regeneratorRuntime.mark((function e(t){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise((function(e,n){var r=new XMLHttpRequest;r.timeout=2e4,r.open("POST",t.url),r.send(t.formData),r.onreadystatechange=function(){if(4==r.readyState)if(200==r.status){var t;try{t=JSON.parse(r.response)}catch(n){}E(t),e(t)}else e(!1)}})));case 1:case"end":return e.stop()}}),e)}))),G.apply(this,arguments)}window.getData=B,window.postData=Q,window.postFormData=I;var T={getData:B,postData:Q,postFormData:I},Z=serverConfig,L=(Z.ip,Z.httpAddress),N=(Z.socketAddress,Z.imgAddress,Z.getHrefNew,Z.getQueryString,new Map),P=1e4;function J(e,t){return T.getData({url:"".concat(L).concat(e),data:t})}function H(e,t,n){try{var r=JSON.stringify({url:"".concat(L).concat(e),data:t});N.set(r,{cacheTime:Date.now()+P,result:n})}catch(a){}}function W(e,t){try{var n=JSON.stringify({url:"".concat(L).concat(e),data:t}),r=N.get(n);if(r&&Date.now()-r.cacheTime<0)return r.result}catch(a){console.error(a)}return null}var q={},X=function(e){q[e]=function(){var t=Object(g["a"])(regeneratorRuntime.mark((function t(n){var r,a,o,i,s,c,u,l;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:if(n=n||{},r=sessionStorage.getItem("token"),r&&(n.token=r),a=x[e],o=a.path,i=a.cache,!i){t.next=8;break}if(s=W(o,n),!s){t.next=8;break}return t.abrupt("return",s);case 8:return t.next=10,J(o,n);case 10:if(c=t.sent,!c||4e3!=c.errcode){t.next=19;break}if(sessionStorage.removeItem("userInfo"),u=sessionStorage.getItem("account"),!u){t.next=19;break}return t.next=17,J("/login",{account:u});case 17:l=t.sent,l&&0==l.errcode&&(sessionStorage.setItem("token",l.data.token),window.hasLogin=!0,setTimeout((function(){window.hasLogin=!1}),5e3));case 19:return i&&(console.log(c),H(o,n,c)),t.abrupt("return",c);case 21:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()};for(var Y in x)X(Y);var z=q,K=n("2f62");o["a"].use(K["a"]);var V=new K["a"].Store({state:{user:{},signLink:{},isMini:!0,jsApi:{},jssdk:!1},mutations:{reloadUser:function(e,t){e.user=t},addSignLink:function(e,t,n){e.signLink[t]=n},updateIsMini:function(e,t){e.isMini=t},updateJsApi:function(e,t){e.jsApi=t},updateJssdk:function(e,t){e.jssdk=t}},actions:{}}),$=(O.ip,O.httpAddress,O.socketAddress,O.imgAddress,O.getHrefNew),ee=O.getQueryStringArgsAes,te=(O.getLocation,O.dealQuery),ne=function(){function e(){Object(F["a"])(this,e)}return Object(R["a"])(e,[{key:"isWeiXin",value:function(){var e=window.navigator.userAgent.toLowerCase();return"micromessenger"==e.match(/MicroMessenger/i)}},{key:"getCodeParamUri",value:function(e){var t=e.appid,n=e.redirect_uri,r=e.response_type,a=e.scope,o=e.state;return"appid="+t+"&redirect_uri="+encodeURIComponent(n)+"&response_type="+r+"&scope="+a+"&state="+o+"#wechat_redirect"}},{key:"getAuthCode",value:function(e){var t=e.appid,n=e.redirect_uri,r=e.response_type,a=e.scope,o=e.state,i=$("?","code");if(console.log("code=》".concat(i)),i&&(localStorage.setItem("code",i),localStorage.removeItem("lastUrl")),!localStorage.code){var s={appid:t,redirect_uri:n,response_type:r,scope:a,state:o};localStorage.lastUrl=window.location.href,this.isWeiXin()?document.location.replace("https://open.weixin.qq.com/connect/oauth2/authorize?"+this.getCodeParamUri(s)):(s.scope="snsapi_login",document.location.replace("https://open.weixin.qq.com/connect/qrconnect?"+this.getCodeParamUri(s)))}this.registerUser()}},{key:"registerUser",value:function(){var e=Object(g["a"])(regeneratorRuntime.mark((function e(){var t,n,r,a,o,i,s,c,u;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:if(t=localStorage.code,t){e.next=3;break}return e.abrupt("return");case 3:return n=navigator.userAgent,r=n.indexOf("Android")>-1||n.indexOf("Adr")>-1,a=!!n.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),o="",r?o="Android":a&&(o="IOS"),i=this.isWeiXin()?0:1,console.log("HttpGet"),s=ee(),c=s.invitor,e.next=13,z.h5_wechat_auth({code:t,os:o,brower:i,invitor:c});case 13:return u=e.sent,u&&0==u.errcode&&u.data&&(sessionStorage.openid=u.data.openid,sessionStorage.unionid=u.data.unionid,sessionStorage.account=u.data.account,sessionStorage.os=o),localStorage.removeItem("code"),console.log("wechat_auth"),console.log(u),console.log(sessionStorage),console.log(sessionStorage.account),e.next=22,this.login();case 22:case"end":return e.stop()}}),e,this)})));function t(){return e.apply(this,arguments)}return t}()},{key:"login",value:function(){var e=Object(g["a"])(regeneratorRuntime.mark((function e(){var t,n,r,a,o,i=arguments;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:if(t=i.length>0&&void 0!==i[0]?i[0]:{account:null},n=t.account,n?sessionStorage.account=n:n=sessionStorage.account,console.log(sessionStorage.account),console.log("登录账户",n),n){e.next=6;break}return e.abrupt("return");case 6:return r=window.latitude?window.latitude:null,a=window.longitude?window.longitude:null,console.log(22),e.next=11,z.login(te({account:n,latitude:r,longitude:a}));case 11:if(o=e.sent,!(o&&o.data&&o.data.token)){e.next=18;break}return sessionStorage.setItem("token",o.data.token),e.next=16,this.reloadUserData();case 16:e.next=25;break;case 18:sessionStorage.clear(),sessionStorage.removeItem("account"),sessionStorage.removeItem("openid"),sessionStorage.removeItem("token"),sessionStorage.removeItem("unionid"),sessionStorage.removeItem("user"),sessionStorage.removeItem("userid");case 25:case"end":return e.stop()}}),e,this)})));function t(){return e.apply(this,arguments)}return t}()},{key:"getUserData",value:function(){try{var e=JSON.parse(sessionStorage.getItem("user"));if(e)return e}catch(t){}}},{key:"reloadUserData",value:function(){var e=Object(g["a"])(regeneratorRuntime.mark((function e(){var t,n,r;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,z.get_user_info();case 2:t=e.sent,t&&t.data&&(n=this.getUserData()||{},t.data.alterTime=Date.now(),r=Object.assign(n,t.data),sessionStorage.setItem("user",JSON.stringify(r)),sessionStorage.setItem("userid",t.data.userid),V.commit("reloadUser",r));case 4:case"end":return e.stop()}}),e,this)})));function t(){return e.apply(this,arguments)}return t}()}]),e}(),re=new ne,ae=window,oe=ae.serverConfig,ie=(ae.getData,ae.wx),se=(oe.ip,oe.httpAddress,oe.socketAddress,oe.imgAddress,oe.getHrefNew,oe.getQueryString,oe.getLocation),ce=function(){function e(){Object(F["a"])(this,e)}return Object(R["a"])(e,[{key:"run",value:function(){var e=Object(g["a"])(regeneratorRuntime.mark((function e(){var t,n,r,a,o,i,s,c,u,l;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:if(console.log(window),console.log(window.location.href),/(Android)/i.test(navigator.userAgent)||!window.jssdk){e.next=4;break}return e.abrupt("return");case 4:return t=location.href.split("#")[0],n=V.state.signLink[t],r=n||location.href.split("#")[0],console.log("signLink"),console.log(r),e.next=11,z.get_wechat_jssdk_config({url:r});case 11:a=e.sent,a&&0==a.errcode&&a.data&&(o=a.data,i=o.appid,s=o.timestamp,c=o.noncestr,u=o.signature,l={debug:!1,appId:i,timestamp:s,nonceStr:c,signature:u,jsApiList:["onMenuShareTimeline","onMenuShareAppMessage","updateAppMessageShareData","updateTimelineShareData","onMenuShareQQ","chooseImage","openLocation","getLocation","openAddress"]},ie.config(l),V.commit("updateIsMini","miniprogram"===window.__wxjs_environment),ie.ready(Object(g["a"])(regeneratorRuntime.mark((function e(){var n,a,o,i;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return i=function(){console.log("window.__wxjs_environment === 'miniprogram'"),console.log("miniprogram"===window.__wxjs_environment)},console.log("jssdk 准备好了"),window.jssdk=!0,V.commit("addSignLink",t,r),console.log(11),e.next=7,se();case 7:if(n=e.sent,console.log("getLocation"),console.log(n),!n){e.next=16;break}return a=n.latitude,o=n.longitude,e.next=15,z.uploadLocation({latitude:a,longitude:o});case 15:e.sent;case 16:V.commit("updateIsMini","miniprogram"===window.__wxjs_environment),V.commit("updateJssdk",!0),ie.checkJsApi({jsApiList:l.jsApiList,success:function(e){if(e&&"checkJsApi:ok"==e.errMsg){var t=e.checkResult;V.commit("updateJsApi",t)}}}),window.WeixinJSBridge&&WeixinJSBridge.invoke?i():document.addEventListener("WeixinJSBridgeReady",i,!1);case 20:case"end":return e.stop()}}),e)})))),ie.error((function(e){console.log("jssdk 失败"),console.log(e)})));case 13:case"end":return e.stop()}}),e)})));function t(){return e.apply(this,arguments)}return t}()}]),e}(),ue=new ce,le=re.isWeiXin,de=window,fe=de.serverConfig,pe=de.getData,he=(fe.ip,fe.httpAddress);fe.socketAddress,fe.imgAddress,fe.getHrefNew,fe.getQueryString;window.paying=!1;var ge,ve=function(){function e(){Object(F["a"])(this,e)}return Object(R["a"])(e,[{key:"get_wechatPay_h5",value:function(){var e=Object(g["a"])(regeneratorRuntime.mark((function e(t){var n;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:if(!window.paying){e.next=2;break}return e.abrupt("return");case 2:if(le()){e.next=4;break}return e.abrupt("return",!1);case 4:return window.paying=!0,e.next=7,pe({url:"".concat(he,"/get_wechatPay_h5"),post:t});case 7:if(n=e.sent,!n||0!=n.errcode){e.next=14;break}return e.next=11,toPay();case 11:return e.abrupt("return",e.sent);case 14:return window.paying=!1,e.abrupt("return",!1);case 16:case"end":return e.stop()}}),e)})));function t(t){return e.apply(this,arguments)}return t}()},{key:"toPay",value:function(){var e=Object(g["a"])(regeneratorRuntime.mark((function e(t){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:if("miniprogram"!==window.__wxjs_environment){e.next=6;break}return t.url=window.location.href,wx.miniProgram.navigateTo({url:"/pages/webviewpay/webviewpay?data="+encodeURIComponent(JSON.stringify(t))}),e.abrupt("return",2);case 6:if("undefined"!=typeof WeixinJSBridge){e.next=10;break}document.addEventListener?document.addEventListener("WeixinJSBridgeReady",this.onBridgeReady,!1):document.attachEvent&&(document.attachEvent("WeixinJSBridgeReady",this.onBridgeReady),document.attachEvent("onWeixinJSBridgeReady",this.onBridgeReady)),e.next=13;break;case 10:return e.next=12,this.onBridgeReady(t);case 12:return e.abrupt("return",e.sent);case 13:return window.paying=!1,e.abrupt("return",0);case 15:case"end":return e.stop()}}),e,this)})));function t(t){return e.apply(this,arguments)}return t}()},{key:"onBridgeReady",value:function(e){return new Promise((function(t,n){WeixinJSBridge.invoke("getBrandWCPayRequest",e,(function(e){window.paying=!1,"get_brand_wcpay_request:ok"!=e.err_msg?(e.err_msg,t(0)):t(1)}))}))}}]),e}(),me=new ve;window.wxTool={jssdk:ue,wechatBuy:me,wechatAut:re};var we,ye=serverConfig,be=(ye.getQueryStringArgsAes,ye.genQueryString,ye.getTime,ye.dealQuery,{components:(ge={},Object(v["a"])(ge,b["a"].name,b["a"]),Object(v["a"])(ge,y["a"].name,y["a"]),Object(v["a"])(ge,w["a"].name,w["a"]),Object(v["a"])(ge,m["a"].name,m["a"]),ge),data:function(){return{age:25,retireYear:50,lifeMax:80,retireMonthCostMoney:4e3,monthSaveMoney:2e3,inflationRate:.06,earnRate:.08,report:[],retireReport:[]}},created:function(){var e=Object(g["a"])(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:this.saveMoney();case 1:case"end":return e.stop()}}),e,this)})));function t(){return e.apply(this,arguments)}return t}(),methods:{saveMoney:function(){console.log("生成数据"),this.report=[],this.retireReport=[];var e=this.retireCost(this.lifeMax-this.retireYear),t="".concat(this.retireYear," 岁退休 每个月花").concat(this.retireMonthCostMoney,"元，").concat(this.lifeMax-this.retireYear,"年后共需要").concat(e,"元");this.retireReport.push(t);var n=0,r=0;t="每个月存 ".concat(this.monthSaveMoney," 元 ， 一年共存 ").concat(12*this.monthSaveMoney," 元 "),this.report.push(t),this.report.push("总额 A：".concat(Number(100*this.earnRate).toFixed(0),"%年收益率，总额 B: ").concat(Number(100*(this.earnRate-this.inflationRate)).toFixed(0),"%年收益率(抹平通货)"));for(var a=1;a<=this.retireYear-this.age;a++){var o=(n+12*this.monthSaveMoney)*(1+this.earnRate);n=o;var i=(r+12*this.monthSaveMoney)*(this.earnRate-this.inflationRate+1);r=i;var s="第".concat(a,"年 | ").concat(Number(this.age)+a,"岁 | 总额A ").concat(n.toFixed(0)," 元 | 总额B ").concat(r.toFixed(0)," 元");this.report.push(s)}return n},retireCost:function(e){for(var t=this.retireMonthCostMoney,n=0,r=1;r<=e;r++){var a=12*t;n+=a}return n}}}),xe=be,Ae=(n("f163"),Object(c["a"])(xe,p,h,!1,null,null,null)),ke=Ae.exports,Se=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"movie"},[n("div",{staticClass:"headTitle"},[e._v("电影搜索")]),n("van-search",{attrs:{placeholder:"请输入搜索关键词"},on:{search:e.onSearch,input:e.onInput},model:{value:e.value,callback:function(t){e.value=t},expression:"value"}}),e._l(e.movieData,(function(t,r){return n("div",{key:r,staticClass:"list"},[n("div",[n("div",[e._v(e._s(e.urlType[t.url_type])+":")]),n("a",{attrs:{href:t.movie_url}},[n("div",{domProps:{innerHTML:e._s(t.movie_name)}})])])])}))],2)},Fe=[],Re=(n("2994"),n("2bdd")),je=(n("5852"),n("d961")),Ce=serverConfig,Oe=(Ce.getQueryStringArgsAes,Ce.genQueryString,Ce.getTime,Ce.dealQuery,{components:(we={},Object(v["a"])(we,b["a"].name,b["a"]),Object(v["a"])(we,y["a"].name,y["a"]),Object(v["a"])(we,w["a"].name,w["a"]),Object(v["a"])(we,m["a"].name,m["a"]),Object(v["a"])(we,je["a"].name,je["a"]),Object(v["a"])(we,Re["a"].name,Re["a"]),we),data:function(){return{value:"",inputTime:0,movieData:[],urlType:{0:"迅雷链接",1:"磁力链接"}}},created:function(){var e=Object(g["a"])(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:case"end":return e.stop()}}),e)})));function t(){return e.apply(this,arguments)}return t}(),methods:{onLoad:function(){},onSearch:function(e){console.log(e)},dealSearchName:function(e){return"string"!=typeof e?e:this.value.length>0?e.replace(this.value,'<span style="color:red">'.concat(this.value,"</span>")):e},dealData:function(e){var t=this;return e.map((function(e){try{e.movie_name=t.dealSearchName(e.movie_name)}catch(n){}return e}))},onInput:function(){var e=Object(g["a"])(regeneratorRuntime.mark((function e(t){var n;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:if(t=t.replace(/[' ']+/g,""),!(t&&t.length>0&&Date.now()-this.inputTime>500)){e.next=11;break}return this.inputTime=Date.now(),console.log(t),e.next=6,z.search_movie({name:t});case 6:n=e.sent,console.log(n),n&&n.data&&n.data.length>0?this.movieData=this.dealData(n.data):this.movieData=[],e.next=12;break;case 11:this.movieData=[];case 12:case"end":return e.stop()}}),e,this)})));function t(t){return e.apply(this,arguments)}return t}()}}),_e=Oe,Ue=(n("1618"),Object(c["a"])(_e,Se,Fe,!1,null,null,null)),Ee=Ue.exports,Be=serverConfig;Be.ip,Be.httpAddress,Be.socketAddress,Be.imgAddress,Be.getHrefNew,Be.getQueryStringArgsAes,Be.path;o["a"].use(f["a"]);var Me=new f["a"]({base:"/",routes:[{path:"/",name:"home",component:ke},{path:"/movie",name:"movie",component:Ee}]}),Qe={cipher:function(e,t){for(var n=4,r=t.length/n-1,a=[[],[],[],[]],o=0;o<4*n;o++)a[o%4][Math.floor(o/4)]=e[o];a=Qe.addRoundKey(a,t,0,n);for(var i=1;i<r;i++)a=Qe.subBytes(a,n),a=Qe.shiftRows(a,n),a=Qe.mixColumns(a,n),a=Qe.addRoundKey(a,t,i,n);a=Qe.subBytes(a,n),a=Qe.shiftRows(a,n),a=Qe.addRoundKey(a,t,r,n);var s=new Array(4*n);for(o=0;o<4*n;o++)s[o]=a[o%4][Math.floor(o/4)];return s},keyExpansion:function(e){for(var t=4,n=e.length/4,r=n+6,a=new Array(t*(r+1)),o=new Array(4),i=0;i<n;i++){var s=[e[4*i],e[4*i+1],e[4*i+2],e[4*i+3]];a[i]=s}for(i=n;i<t*(r+1);i++){a[i]=new Array(4);for(var c=0;c<4;c++)o[c]=a[i-1][c];if(i%n==0){o=Qe.subWord(Qe.rotWord(o));for(c=0;c<4;c++)o[c]^=Qe.rCon[i/n][c]}else n>6&&i%n==4&&(o=Qe.subWord(o));for(c=0;c<4;c++)a[i][c]=a[i-n][c]^o[c]}return a},subBytes:function(e,t){for(var n=0;n<4;n++)for(var r=0;r<t;r++)e[n][r]=Qe.sBox[e[n][r]];return e},shiftRows:function(e,t){for(var n=new Array(4),r=1;r<4;r++){for(var a=0;a<4;a++)n[a]=e[r][(a+r)%t];for(a=0;a<4;a++)e[r][a]=n[a]}return e},mixColumns:function(e,t){for(var n=0;n<4;n++){for(var r=new Array(4),a=new Array(4),o=0;o<4;o++)r[o]=e[o][n],a[o]=128&e[o][n]?e[o][n]<<1^283:e[o][n]<<1;e[0][n]=a[0]^r[1]^a[1]^r[2]^r[3],e[1][n]=r[0]^a[1]^r[2]^a[2]^r[3],e[2][n]=r[0]^r[1]^a[2]^r[3]^a[3],e[3][n]=r[0]^a[0]^r[1]^r[2]^a[3]}return e},addRoundKey:function(e,t,n,r){for(var a=0;a<4;a++)for(var o=0;o<r;o++)e[a][o]^=t[4*n+o][a];return e},subWord:function(e){for(var t=0;t<4;t++)e[t]=Qe.sBox[e[t]];return e},rotWord:function(e){for(var t=e[0],n=0;n<3;n++)e[n]=e[n+1];return e[3]=t,e},sBox:[99,124,119,123,242,107,111,197,48,1,103,43,254,215,171,118,202,130,201,125,250,89,71,240,173,212,162,175,156,164,114,192,183,253,147,38,54,63,247,204,52,165,229,241,113,216,49,21,4,199,35,195,24,150,5,154,7,18,128,226,235,39,178,117,9,131,44,26,27,110,90,160,82,59,214,179,41,227,47,132,83,209,0,237,32,252,177,91,106,203,190,57,74,76,88,207,208,239,170,251,67,77,51,133,69,249,2,127,80,60,159,168,81,163,64,143,146,157,56,245,188,182,218,33,16,255,243,210,205,12,19,236,95,151,68,23,196,167,126,61,100,93,25,115,96,129,79,220,34,42,144,136,70,238,184,20,222,94,11,219,224,50,58,10,73,6,36,92,194,211,172,98,145,149,228,121,231,200,55,109,141,213,78,169,108,86,244,234,101,122,174,8,186,120,37,46,28,166,180,198,232,221,116,31,75,189,139,138,112,62,181,102,72,3,246,14,97,53,87,185,134,193,29,158,225,248,152,17,105,217,142,148,155,30,135,233,206,85,40,223,140,161,137,13,191,230,66,104,65,153,45,15,176,84,187,22],rCon:[[0,0,0,0],[1,0,0,0],[2,0,0,0],[4,0,0,0],[8,0,0,0],[16,0,0,0],[32,0,0,0],[64,0,0,0],[128,0,0,0],[27,0,0,0],[54,0,0,0]],Ctr:{}};Qe.Ctr.encrypt=function(e,t,n){var r=16;if(128!=n&&192!=n&&256!=n)return"";e=Ie.encode(e),t=Ie.encode(t);for(var a=n/8,o=new Array(a),i=0;i<a;i++)o[i]=isNaN(t.charCodeAt(i))?0:t.charCodeAt(i);var s=Qe.cipher(o,Qe.keyExpansion(o));s=s.concat(s.slice(0,a-16));var c=new Array(r),u=(new Date).getTime(),l=u%1e3,d=Math.floor(u/1e3),f=Math.floor(65535*Math.random());for(i=0;i<2;i++)c[i]=l>>>8*i&255;for(i=0;i<2;i++)c[i+2]=f>>>8*i&255;for(i=0;i<4;i++)c[i+4]=d>>>8*i&255;var p="";for(i=0;i<8;i++)p+=String.fromCharCode(c[i]);for(var h=Qe.keyExpansion(s),g=Math.ceil(e.length/r),v=new Array(g),m=0;m<g;m++){for(var w=0;w<4;w++)c[15-w]=m>>>8*w&255;for(w=0;w<4;w++)c[15-w-4]=m/4294967296>>>8*w;var y=Qe.cipher(c,h),b=m<g-1?r:(e.length-1)%r+1,x=new Array(b);for(i=0;i<b;i++)x[i]=y[i]^e.charCodeAt(m*r+i),x[i]=String.fromCharCode(x[i]);v[m]=x.join("")}var A=p+v.join("");return A=De.encode(A),A},Qe.Ctr.decrypt=function(e,t,n){var r=16;if(128!=n&&192!=n&&256!=n)return"";e=De.decode(e),t=Ie.encode(t);for(var a=n/8,o=new Array(a),i=0;i<a;i++)o[i]=isNaN(t.charCodeAt(i))?0:t.charCodeAt(i);var s=Qe.cipher(o,Qe.keyExpansion(o));s=s.concat(s.slice(0,a-16));var c=new Array(8),u=e.slice(0,8);for(i=0;i<8;i++)c[i]=u.charCodeAt(i);for(var l=Qe.keyExpansion(s),d=Math.ceil((e.length-8)/r),f=new Array(d),p=0;p<d;p++)f[p]=e.slice(8+p*r,8+p*r+r);e=f;var h=new Array(e.length);for(p=0;p<d;p++){for(var g=0;g<4;g++)c[15-g]=p>>>8*g&255;for(g=0;g<4;g++)c[15-g-4]=(p+1)/4294967296-1>>>8*g&255;var v=Qe.cipher(c,l),m=new Array(e[p].length);for(i=0;i<e[p].length;i++)m[i]=v[i]^e[p].charCodeAt(i),m[i]=String.fromCharCode(m[i]);h[p]=m.join("")}var w=h.join("");return w=Ie.decode(w),w};var De={code:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e,t){t="undefined"!=typeof t&&t;var n,r,a,o,i,s,c,u,l,d,f,p=[],h="",g=De.code;if(d=t?e.encodeUTF8():e,l=d.length%3,l>0)while(l++<3)h+="=",d+="\0";for(l=0;l<d.length;l+=3)n=d.charCodeAt(l),r=d.charCodeAt(l+1),a=d.charCodeAt(l+2),o=n<<16|r<<8|a,i=o>>18&63,s=o>>12&63,c=o>>6&63,u=63&o,p[l/3]=g.charAt(i)+g.charAt(s)+g.charAt(c)+g.charAt(u);return f=p.join(""),f=f.slice(0,f.length-h.length)+h,f},decode:function(e,t){t="undefined"!=typeof t&&t;var n,r,a,o,i,s,c,u,l,d,f=[],p=De.code;d=t?e.decodeUTF8():e;for(var h=0;h<d.length;h+=4)o=p.indexOf(d.charAt(h)),i=p.indexOf(d.charAt(h+1)),s=p.indexOf(d.charAt(h+2)),c=p.indexOf(d.charAt(h+3)),u=o<<18|i<<12|s<<6|c,n=u>>>16&255,r=u>>>8&255,a=255&u,f[h/4]=String.fromCharCode(n,r,a),64==c&&(f[h/4]=String.fromCharCode(n,r)),64==s&&(f[h/4]=String.fromCharCode(n));return l=f.join(""),t?l.decodeUTF8():l}},Ie={encode:function(e){var t=e.replace(/[\u0080-\u07ff]/g,(function(e){var t=e.charCodeAt(0);return String.fromCharCode(192|t>>6,128|63&t)}));return t=t.replace(/[\u0800-\uffff]/g,(function(e){var t=e.charCodeAt(0);return String.fromCharCode(224|t>>12,128|t>>6&63,128|63&t)})),t},decode:function(e){var t=e.replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,(function(e){var t=(15&e.charCodeAt(0))<<12|(63&e.charCodeAt(1))<<6|63&e.charCodeAt(2);return String.fromCharCode(t)}));return t=t.replace(/[\u00c0-\u00df][\u0080-\u00bf]/g,(function(e){var t=(31&e.charCodeAt(0))<<6|63&e.charCodeAt(1);return String.fromCharCode(t)})),t}},Ge=Qe.Ctr;window.AesEncrypt=Ge.encrypt,window.AesDecrypt=Ge.decrypt;var Te=n("8055"),Ze=n.n(Te);null==window.io&&(window.io=Ze.a);var Le=function(){function e(){Object(F["a"])(this,e),this.ip="https://www.csxtech.com.cn",this.sio=null,this.isPinging=!1,this.fnDisconnect=null,this.handlers={},this.fnConnect=null}return Object(R["a"])(e,[{key:"addHandler",value:function(e,t){var n=function(n){"disconnect"!=e&&"string"==typeof n&&(n=JSON.parse(n)),t(n)};this.handlers[e]=n,this.sio&&(console.log("register:function "+e),this.sio.on(e,n))}},{key:"connect",value:function(e,t){console.log("connect----------"),this.fnConnect=e;var n;this.connectInternal((function(t){clearTimeout(n),e(t)}),(function(e){clearTimeout(n),t(e)}))}},{key:"connectInternal",value:function(e,t){var n=this,r=this,a={reconnection:!0,"force new connection":!1,transports:["websocket","polling"]};for(var o in this.sio=window.io.connect(this.ip,a),console.log("this.sio"),console.log(this.sio),this.sio.on("reconnect",(function(){console.log("reconnection")})),this.sio.on("connect",(function(e){console.log("connect"),console.log(n),console.log(n.sio),console.log(e),n.sio&&(n.sio.connected=!0,n.fnConnect(e))})),this.sio.on("disconnect",(function(e){console.log("disconnect"),r.sio&&(r.sio.connected=!1,r.close())})),this.sio.on("connect_failed",(function(){console.log("connect_failed")})),this.handlers){var i=this.handlers[o];"function"==typeof i&&("disconnect"==o?this.fnDisconnect=i:(console.log("register:function "+o),this.sio.on(o,i)))}this.startHearbeat()}},{key:"startHearbeat",value:function(){this.sio.on("game_pong",(function(){console.log("game_pong"),e.lastRecieveTime=Date.now(),e.delayMS=e.lastRecieveTime-e.lastSendTime,console.log(e.delayMS)})),this.lastRecieveTime=Date.now();var e=this;e.isPinging||(e.isPinging=!0)}},{key:"send",value:function(e,t){this.sio&&this.sio.connected&&(null!=t&&Object(S["a"])(t),this.sio.emit(e,t))}},{key:"ping",value:function(){this.sio&&(this.lastSendTime=Date.now(),this.send("game_ping"))}},{key:"close",value:function(){console.log("close"),this.delayMS=null,this.sio&&this.sio.connected&&(this.sio.connected=!1,this.sio.disconnect()),this.fnDisconnect&&(this.fnDisconnect(),this.fnDisconnect=null)}},{key:"test",value:function(e){var t=this.ip.split(":");t[0],t[1]}}]),e}(),Ne=new Le;window.socketNet=Ne;var Pe=n("4eb5"),Je=n.n(Pe);window.version="1.0.0",console.log("window.localtion"),console.log(window.location.href),o["a"].config.productionTip=!1,o["a"].use(Je.a),o["a"].use(a["a"]),o["a"].use(r["a"],{preLoad:1,error:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGgAAABZCAYAAADSOmGpAAAA6klEQVR4nO3RQQ3AIADAwDH/VgkSwAFf+rhT0KRjzrU/sv7XAdwZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBz6bBHrAwg05AAAAAElFTkSuQmCC",loading:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGgAAABZCAYAAADSOmGpAAAA6klEQVR4nO3RQQ3AIADAwDH/VgkSwAFf+rhT0KRjzrU/sv7XAdwZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBsUZFGdQnEFxBz6bBHrAwg05AAAAAElFTkSuQmCC  ",attempt:3}),o["a"].directive("longpress",(function(e,t){var n=null,r=function(e){"click"!==e.type&&null==n&&(n=setTimeout((function(){t.value()}),2e3))},a=function(){null!==n&&(clearTimeout(n),n=null)};e.addEventListener("mousedown",r),e.addEventListener("touchstart",r),e.addEventListener("click",a),e.addEventListener("mouseout",a),e.addEventListener("touchend",a),e.addEventListener("touchcancel",a)})),new o["a"]({router:Me,store:V,render:function(e){return e(d)}}).$mount("#app")},be27:function(e,t,n){},f163:function(e,t,n){"use strict";var r=n("be27"),a=n.n(r);a.a}});
//# sourceMappingURL=app.88346fe0.js.map