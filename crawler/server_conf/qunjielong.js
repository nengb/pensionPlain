

const os = require("os");
var HALL_IP = require('../configs').HALL_IP;	
var HALL_CLIENT_PORT = require('../configs').HALL_CLIENT_PORT;

//数据库配置
exports.database = {
	mysql : function(){ return { HOST:"47.97.32.55",USER:'root',PSWD:'lyq5655779++',DB:'qunjielong',PORT:3306 } },
	redis : function(db=1){ return { HOST: "47.97.32.55",PSWD: 'PsSdnBzj+1',DB: db,PORT: 6379 } }
}


//爱趣-账号服额外配置
exports.account_server = {
        appInfo:{
        Android:{ appid:"wx880398d74cb2f316",secret:"3d75b2bffce3fbc94961ef8f7bff9cb5" },
        IOS:{ appid:"wx880398d74cb2f316",secret:"3d75b2bffce3fbc94961ef8f7bff9cb5" },
        H5:{
            mini:{ appid:"wx8b8459c0c44cb46d",secret:"ec0e3670a3fc936c8353144a32e32327", AppSecret:'czoS4Yo4TBKdDzWDknpZy3i55Yospy7b',mch_id:'1358844602'}, //小程序
            wechat:{appid:"wx1cf05273c7fe4e99",secret:"690078e16b91c29baf3a485d5952fa13", AppSecret:'YBOGnUs6ZuqftOxGNCYOjdeiRGdiGepv',mch_id:'1508213971'  }, //微信公众号
            // nowechat:{ appid:"wx2ce82cbbc1951ad5",secret:"19eef9854c04a12d5470758eb1ed2683" },//网站应用
        }
    },
    VERSION:'20161227',
    APP_WEB:'https://crmj.dx1ydb.com:8080/room/goto',
    //快递相关
    secret: 'b1b2068f15cc4383a6ef155e2462f8aa',
    POST_KEY:'amZmIIUS332',
    // partnerId:"K200302031",
    // partnerKey:"oYCtd7as",
    // net:"广东省广州市番禺区城区",
    // kuaidicom:"yuantong",
    
      partnerId:"6accd8114558402aa8aceed8fa769488",
    partnerKey:"HJDMEPJ0",
    net:"番禺市桥",
    kuaidicom:"zhongtong",

    send_name:"闯关得口红",
    send_mobile:"",
    send_tel:"18902240281",
    send_printAddr: "广东省广州市番禺区东环街",
    app_id:"2018010601636521",//支付宝商户号
    aliSecret :`
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAy7AdufeA2oxTct+cASdw9lgYwsVsmKaziDnrIvyLeKS1p+TudOp9N7ROBNZVjAehGklYxTue4vUo5/sjfyoDHVE84kk9rsFKpnUeIUwCUULbIPd3eFiRVeMqG9P8Py+dEcn/LsdCx68UfOc+hS/J9jhHPCbIWxFjelgvXvS7KMZFGh13FryGwpEeH4ducOt4/jZ39WsTiKvrEtJTEil3gB7pJqTqduENrxTL8oTwmU8U0zS1lPXI7Q+S/HNEJ+5/YqkHqJj375mYeDKKXxktCPSf6wfP5lI4ngN8ep3uLYwL+FYsAdfB70JIM89H3hg/mfoOor0ei/1W/d6/XfYlkwIDAQABAoIBAGsbeyY1Lf6+V4tKZmB8+vuvK6YP5qEG19VEj47gOf8Arb1RtsqoG5xVJcmJY4a05FRMSW+9gDlcLVx/RRUzZFvgQiHD3bmtTrHlWCiuLXHJtCzLtHkGKbZ+M8BaYoRfZzrZe2R/x2/1ctKTTt7+WDcvNNY+lpC8vhCxmodWLaysVHGmGiPymKTbFOfCtD0PTvqGa7bb0jTgBafGqBG1aU1MZ04N1QesCNtxXYMi9giH5zfW1tMpbfM2vebe1eoYMkAojHyTRnYWfX9Jrl0hmq4fvnfwQxOB6o0Y52opvgW4LgVk6p45hZB7JtzdlCIG1xigC8B/h38Vp2MOlpTGaIECgYEA/QvWgSVv8lm14SZdLTJz3B0W08cuPtNyt1hpNrOwRwMqsyN2sMmqg4bA5SzX5v5Ss3hT9hAs1gLg46e8jQDND96WAU/c1jee30Rdmg1U5Lcq+5hOQ4c8jegMGde2i8rb44QslGJHAdBpPxDObsx2UrH3zCKDrIAlaZLXvCJswuECgYEAzhDIsW/Ui8vwfEHzvqc6FwUB8MYFBTIfw1Y+JUub40GlsAOlxWUehuSUE4waDJDS/Z9LMXTi2eQSLlS5Hc6zhXjKvbAUpEV4SFX+d2wjVrArsX0e/7UkvwcPQbDJV5p1pz7/Uv2YD8iNqAvlwZzZhtA24VjnRZMqtPEJhrEIavMCgYBi1kLcgsDtCjlOTevLAY/bg8kswvm/NFv0XSYLZbgOpKADBHERsFNXuESTvyY9ZUzsKK2yyLKajNlGUngFIzD1Z91zebwqN+NoFY3x5A8qnpi9WMoI+kOeseo4FdeJVpz4iuHWu2Q8wyi4p1naUSZOOpEtPLXtpMf4KpD1PQT6QQKBgQCn407QGe/OsirN4iIHvFF8vcy18W/Xqt3sFVDuq+pnPm4SuPYPnHJBruvh/Syf/kKY9naZ5cSJh+M0MjzcRzNGVILCBzraF+uG6+E2RTmJgGEo62sdJOW6abMJb1KreCHRUGdPo2OHwHuBZagclYE48F02Pmu26M9LunJrdcMI9wKBgQDFIDqdjzhq6Kxpst6l/tNJMkVFL0Q8OqQA1hOK4grblVV3HbvEo6ic4cfh0pKlBTJvASo85JKzJDilBR1EITcKd8jkIaCkFNzrUEYl+VUCOo35s6M+jd7hcAOykCCEHqbJPmVVUSJ6wQplI9yPAjg+aIUUrQKBtsvbc/Fvc0WBVQ==
-----END RSA PRIVATE KEY-----
`, //支付宝私钥
    //七牛直播回放配置
    qiniuVideoPlay:{
        ACCESS_KEY:'Xoqpx2biG3y9RpsMhrNZZDMN_2zmfKbdTca9sZKb',
        SECRET_KEY:'gwkOOVJ4xGDCsFP2XQfM5TJHNyI4KZ6xAukeG2Gb',
        //回调域名
        notifyDomain:'aiqu.dx1ydb.com',
    }
}

//爱趣-大厅服额外配置
exports.hall_server = {
    appInfo:{
        Android:{ appid:"wx880398d74cb2f316",secret:"3d75b2bffce3fbc94961ef8f7bff9cb5" },
        IOS:{ appid:"wx880398d74cb2f316",secret:"3d75b2bffce3fbc94961ef8f7bff9cb5" },
        H5:{
            mini:{ appid:"wx8b8459c0c44cb46d",secret:"ec0e3670a3fc936c8353144a32e32327", AppSecret:'czoS4Yo4TBKdDzWDknpZy3i55Yospy7b',mch_id:'1358844602'}, //小程序
            wechat:{appid:"wx1cf05273c7fe4e99",secret:"690078e16b91c29baf3a485d5952fa13", AppSecret:'YBOGnUs6ZuqftOxGNCYOjdeiRGdiGepv',mch_id:'1508213971'  }, //微信公众号
            // nowechat:{ appid:"wx2ce82cbbc1951ad5",secret:"19eef9854c04a12d5470758eb1ed2683" },//网站应用
        }
    },
    consumer_key:"1106547822",
    //视频上传相关
    AccessKeyId: 'LTAItG9uHfTISXjf',
    AccessKeySecret:"1whKgGqZgJpBSRPBf3qNsDkPml6v4o",
    //兑吧积分商城相关
    duiba_appKey:'mfLfg9m8UR5LPzdiy7bPRHdwH37',
    duiba_appSecret :'vgrUPD6bFwuA8no5T1E4AK9y1C5',
    //快递100相关
    POST_KEY:'amZmIIUS332',
    POST_CUSTOMER:"C43C9977E9C90E1EF93BDED14AF0063F",
    //支付相关
    //金服支付
    appKey:"39a1b0b52589bff1017be47093746d86",
    SH_KEY:'TWoV5efgH4z1BOVAco6jo1eS3iCe7c0R584vqW7Y',	
    PAY_CALL_BACK_URL:'http://' + HALL_IP + ':' + (HALL_CLIENT_PORT) + '/pay_back',
    PAY_HREF_BACK_URL:'http://' + HALL_IP + ':' + (HALL_CLIENT_PORT-1) + '/over_pay.html',	
    //支付宝支付相关
    ALIPAY_CALL_BACK_URL:'http://' + HALL_IP + ':' + (HALL_CLIENT_PORT) + '/aliPay_back',//支付宝返回地址
    app_id:"2018010601636521",//支付宝商户号
    aliSecret :`
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAy7AdufeA2oxTct+cASdw9lgYwsVsmKaziDnrIvyLeKS1p+TudOp9N7ROBNZVjAehGklYxTue4vUo5/sjfyoDHVE84kk9rsFKpnUeIUwCUULbIPd3eFiRVeMqG9P8Py+dEcn/LsdCx68UfOc+hS/J9jhHPCbIWxFjelgvXvS7KMZFGh13FryGwpEeH4ducOt4/jZ39WsTiKvrEtJTEil3gB7pJqTqduENrxTL8oTwmU8U0zS1lPXI7Q+S/HNEJ+5/YqkHqJj375mYeDKKXxktCPSf6wfP5lI4ngN8ep3uLYwL+FYsAdfB70JIM89H3hg/mfoOor0ei/1W/d6/XfYlkwIDAQABAoIBAGsbeyY1Lf6+V4tKZmB8+vuvK6YP5qEG19VEj47gOf8Arb1RtsqoG5xVJcmJY4a05FRMSW+9gDlcLVx/RRUzZFvgQiHD3bmtTrHlWCiuLXHJtCzLtHkGKbZ+M8BaYoRfZzrZe2R/x2/1ctKTTt7+WDcvNNY+lpC8vhCxmodWLaysVHGmGiPymKTbFOfCtD0PTvqGa7bb0jTgBafGqBG1aU1MZ04N1QesCNtxXYMi9giH5zfW1tMpbfM2vebe1eoYMkAojHyTRnYWfX9Jrl0hmq4fvnfwQxOB6o0Y52opvgW4LgVk6p45hZB7JtzdlCIG1xigC8B/h38Vp2MOlpTGaIECgYEA/QvWgSVv8lm14SZdLTJz3B0W08cuPtNyt1hpNrOwRwMqsyN2sMmqg4bA5SzX5v5Ss3hT9hAs1gLg46e8jQDND96WAU/c1jee30Rdmg1U5Lcq+5hOQ4c8jegMGde2i8rb44QslGJHAdBpPxDObsx2UrH3zCKDrIAlaZLXvCJswuECgYEAzhDIsW/Ui8vwfEHzvqc6FwUB8MYFBTIfw1Y+JUub40GlsAOlxWUehuSUE4waDJDS/Z9LMXTi2eQSLlS5Hc6zhXjKvbAUpEV4SFX+d2wjVrArsX0e/7UkvwcPQbDJV5p1pz7/Uv2YD8iNqAvlwZzZhtA24VjnRZMqtPEJhrEIavMCgYBi1kLcgsDtCjlOTevLAY/bg8kswvm/NFv0XSYLZbgOpKADBHERsFNXuESTvyY9ZUzsKK2yyLKajNlGUngFIzD1Z91zebwqN+NoFY3x5A8qnpi9WMoI+kOeseo4FdeJVpz4iuHWu2Q8wyi4p1naUSZOOpEtPLXtpMf4KpD1PQT6QQKBgQCn407QGe/OsirN4iIHvFF8vcy18W/Xqt3sFVDuq+pnPm4SuPYPnHJBruvh/Syf/kKY9naZ5cSJh+M0MjzcRzNGVILCBzraF+uG6+E2RTmJgGEo62sdJOW6abMJb1KreCHRUGdPo2OHwHuBZagclYE48F02Pmu26M9LunJrdcMI9wKBgQDFIDqdjzhq6Kxpst6l/tNJMkVFL0Q8OqQA1hOK4grblVV3HbvEo6ic4cfh0pKlBTJvASo85JKzJDilBR1EITcKd8jkIaCkFNzrUEYl+VUCOo35s6M+jd7hcAOykCCEHqbJPmVVUSJ6wQplI9yPAjg+aIUUrQKBtsvbc/Fvc0WBVQ==
-----END RSA PRIVATE KEY-----
`, //支付宝私钥
    aligongyue:`
-----BEGIN RSA PRIVATE KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy7AdufeA2oxTct+cASdw9lgYwsVsmKaziDnrIvyLeKS1p+TudOp9N7ROBNZVjAehGklYxTue4vUo5/sjfyoDHVE84kk9rsFKpnUeIUwCUULbIPd3eFiRVeMqG9P8Py+dEcn/LsdCx68UfOc+hS/J9jhHPCbIWxFjelgvXvS7KMZFGh13FryGwpEeH4ducOt4/jZ39WsTiKvrEtJTEil3gB7pJqTqduENrxTL8oTwmU8U0zS1lPXI7Q+S/HNEJ+5/YqkHqJj375mYeDKKXxktCPSf6wfP5lI4ngN8ep3uLYwL+FYsAdfB70JIM89H3hg/mfoOor0ei/1W/d6/XfYlkwIDAQAB
-----END RSA PRIVATE KEY-----
    `,
    //微信支付相关
    AppID : 'wxd66e29d2b92a15fb',//wechat
    AppSecret :'oof95X4alcxS3pW0EL9KjxmtsMmbFWo5',//wechat
    MCH_ID :'1523882811',//wechat
    WECHATPAY_CALL_BACK_URL:'http://' + HALL_IP + ':' + (HALL_CLIENT_PORT) + '/wechatPay_back',//微信返回地址
    
    //极光推送
    jiguangPush_id:'bacd4f62876c76860d8d4d9c',
    jiguangPush_key:'0297523b623308efafb010ff',

  
}	


