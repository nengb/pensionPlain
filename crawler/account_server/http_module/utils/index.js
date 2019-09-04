const db = require('../../../utils/dbsync_hall');
const redis = require('../../../utils/redis');
const dbRedis = require('../../../utils/db_redis_hall');
const crypto = require('../../../utils/crypto');
const http = require('../../../utils/http');
const configs = require('../../../configs.js');
const ERRCODE = require('../../../utils/errcode.js');
const path = require('path');
const fs = require('fs');
//redis表名
const { TOKENS_USER, USERS_TOKEN, MINI_ACCESS_TOKEN, WX_ACCESS_TOKEN, WX_JSAPI_TICKET } = dbRedis;
/**
 * 
 *  公共函数模块
 */
module.exports = app => {

    class controllerUtils {
        formatTime(date) {
            const year = date.getFullYear()
            const month = date.getMonth() + 1
            const day = date.getDate()
            const hour = date.getHours()
            const minute = date.getMinutes()
            const second = date.getSeconds()

            return [year, month, day].map(this.formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
        }
        formatNumber(n) {
            n = n.toString()
            return n[1] ? n : '0' + n
        }
        //获取某个范围随机数[0,99],包括两边
        getRandom(min,  max) {
            max++;
            var  r  =  Math.random()  *  (max  -  min);
            var  re  =  Math.floor(r  +  min);
            re  =  Math.max(Math.min(re,  max),  min);
            return  re;
        }

        //对象键值反转
        valueChangeKey(object) {
            let changeObj = {}
            for (let key in object) {
                let value = object[key]
                changeObj[value] = key;
            }
            return changeObj;
        }
        //判断是否是数组
        isArray(arr) {
            return Object.prototype.toString.call(arr) === '[object Array]';
        }
        //判断是否是对象
        isObject(obj) {
            return Object.prototype.toString.call(obj) === '[object Object]';
        }
        //判断是否是数字
        isNumber(num) {
            return Object.prototype.toString.call(num) === '[object Number]';
        }
        //判断是否是字符串
        isString(str) {
            return Object.prototype.toString.call(str) === '[object String]';
        }
        //判断是否是毫秒
        isMsec(time) {
            return (!isNaN(Number(time)) && `${time}`.length === 13);
        }
        //判断是否是秒
        isSec(time) {
            return (!isNaN(Number(time)) && `${time}`.length === 10);
        }

        //同步递归创建目录
        mkdirsSync(dirname) {
            if (fs.existsSync(dirname)) {
                return true;
            }
            else {
                if (this.mkdirsSync(path.dirname(dirname))) {
                    fs.mkdirSync(dirname);
                    return true;
                }
            }
        }
        //根据文件位置递归创建相应目录
        mkdirsPathSync(filePath) {
            //根据路径，递归创建相应目录
            var filePathArr = filePath.split('/');
            filePathArr.pop();
            var filePath = filePathArr.join('/');
            this.mkdirsSync(filePath);
        }

        //更新接口调用凭证accesstoken
        async UPDATE_ACCESSTOKEN({ appid, secret, redisName }) {
            var result = await http.getSync(`https://api.weixin.qq.com/cgi-bin/token`, {
                grant_type: 'client_credential',
                appid: appid,
                secret: secret
            }, true)
            console.error(result)
            if (result && result.data && result.data.access_token) {
                let data = {}
                data[appid] = {
                    value: result.data.access_token,
                    time: Date.now() + result.data.expires_in * 900,
                }
                await redis.hmset(redisName, data)
                await this.UPDATE_JSAPI_TICKET();
            }
        }
        //更新jssdk - jsapi_ticket
        async UPDATE_JSAPI_TICKET() {
            let redisName = WX_JSAPI_TICKET;
            let appid = await db.get_configs('wx_AppID') || app.config.appInfo.H5.wechat.appid
            let access_token = await this.get_wx_accesstoken();
            if (!access_token) {
                console.error("UPDATE_JSAPI_TICKET- 暂无wx_accesstoken", access_token)
                return;
            }
            let result = await http.getSync(`https://api.weixin.qq.com/cgi-bin/ticket/getticket`, {
                access_token: access_token,
                type: 'jsapi'
            }, true)
            console.log("UPDATE_JSAPI_TICKET")
            console.log(result)
            if (result && result.data && result.data.ticket) {

                let data = {}
                data[appid] = {
                    value: result.data.ticket,
                    time: Date.now() + result.data.expires_in * 900,
                }
                await redis.hmset(redisName, data)
            }
        }



        async get_accesstoken({ appid, secret, redisName }) {
            console.log(`get_accesstoken`)
            for (let i = 0; i <= 5; i++) {
                let accesstoken = await redis.hget(redisName, appid)
                if (!accesstoken || Date.now() - accesstoken.time > 0) {
                    console.log(`redisName   ${redisName}-更新`)
                    await this.UPDATE_ACCESSTOKEN({ appid, secret, redisName })
                } else {
                    return accesstoken.value
                }
            }
        }

        //小程序
        async get_mini_accesstoken() {
            let appid = await db.get_configs('mini_AppID') || app.config.appInfo.H5.mini.appid
            let secret = await db.get_configs('mini_secret') || app.config.appInfo.H5.mini.secret
            let redisName = MINI_ACCESS_TOKEN;
            console.log(`get_mini_accesstoken`)
            return await this.get_accesstoken({ appid, secret, redisName })

        }
        //公众号
        async get_wx_accesstoken() {
            let appid = await db.get_configs('wx_AppID') || app.config.appInfo.H5.wechat.appid
            let secret = await db.get_configs('wx_secret') || app.config.appInfo.H5.wechat.secret
            let redisName = WX_ACCESS_TOKEN;
            console.log(`get_wx_accesstoken`)

            return await this.get_accesstoken({ appid, secret, redisName })
        }
        //jssdk-ticket
        async get_jsapi_ticket() {
            let redisName = WX_JSAPI_TICKET;
            let appid = await db.get_configs('wx_AppID') || app.config.appInfo.H5.wechat.appid

            console.log(`get_jsapi_ticket`)

            for (let i = 0; i <= 5; i++) {
                let data = await redis.hget(redisName, appid)

                if (!data || Date.now() - data.time > 0) {
                    await this.UPDATE_JSAPI_TICKET()
                } else {
                    return data.value
                }
            }

        }


        async msg_sec_check(content) {
            if (!content) {
                return false;
            }
            let access_token = await this.get_mini_accesstoken();
            let data = {
                content: content,
            }
            let result = await http.postMENU(`https://api.weixin.qq.com/wxa/msg_sec_check?access_token=${access_token}`, data);
        
            if (result.data) {
                try {
                    result.data = JSON.parse(result.data)

                } catch (err) {

                }
            }else{
                return false
                
            }
            if (result.data.errcode == 0) {
                return true
            } else {
                return false

            }
        }

    }

    return controllerUtils;
};

// module.exports = 