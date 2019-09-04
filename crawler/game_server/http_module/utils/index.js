const  db = require('../../../utils/dbsync_account');
const  crypto = require('../../../utils/crypto');
const  http = require('../../../utils/http');
const  configs = require('../../../configs.js');

/**
 * 
 *  公共函数模块
 */
module.exports = app => {
    const { 
        db,                     //mysql操作
        http,                   //http请求返回
        cashChangeReasons,      
    } = app;
    class controllerUtils{
        //获取某个范围随机数[0,99],包括两边
        getRandom(min, max){
            max++;
            var r = Math.random() * (max - min);
            var re = Math.floor(r + min);
            re = Math.max(Math.min(re, max), min);
            return re;
        }
        //检测管理员账号信息
        async check_account(token) {
            // var token = req.query.token;
            if (token == null) {
                return null;
            }
        
            var userdata = await db.get_agentdata_by_token(token);
            if (!userdata) {
                // http.send3(res, HALL_ERRS.TOKEN_TIMEOUT);
                return null;
            }
            return userdata;
            // return true;
        }
        //对象键值反转
        valueChangeKey(object){
            let changeObj = {}
            for(let key in object){
                let value = object[key]
                changeObj[value] = key;
            }
            return changeObj;
        }
        //判断是否是数组
        isArray(arr){
            return Object.prototype.toString.call(arr)  === '[object Array]';
        }
        //判断是否是对象
        isObject(obj){
            return Object.prototype.toString.call(obj)  === '[object Object]';
        }
        //判断是否是数字
        isNumber(num){
            return !isNaN(Number(num));
        }
        //判断是否是字符串
        isString(str){
            return Object.prototype.toString.call(str)  === '[object String]';
        }
        //判断是否是毫秒
        isMsec(time){
            return ( !isNaN(Number(time)) && `${time}`.length === 13);
        }
        //判断是否是秒
        isSec(time){
            return ( !isNaN(Number(time)) && `${time}`.length === 10);
        }
      
        
        
    }

    return controllerUtils;
};
