



//成功返回码 0
exports.RET_OK = { code:0, msg:'ok' };

//系统错误码 1 ~ 1999
exports.SYS_ERRS = {
    //1 - 参数错误
    INVALID_PARAMETER:{ code:1, msg:'参数错误' },
    //2 - 内部网络错误
    INTER_NETWORK_ERROR:{ code:2, msg:'内部网络错误' },

    NO_DATA:{ code:3, msg:'无数据' },

}


//管理系统服错误码 2000 ~ 3999
exports.ACC_ERRS = {
  

}


//大厅服错误码 4000 ~ 5999

exports.HALL_ERRS = {
    //4000 - token失效
    TOKEN_TIMEOUT: { code:4000, msg:'token 失效' },
    //4001 - 未注册用户
    NO_USER: { code:4001, msg:'未注册用户' },
    //4002 - 文件过大
    FILE_TOO_BIG: { code:4002, msg:'文件过大' },
    //4003 - 不存在的文件类型
    NO_FILE_TYPE: { code:4003, msg:'不存在的文件类型' },
    //4004 - 操作失败
    OPERATE_FAILED: { code:4004, msg:'操作失败' },
    //4005 - 库存不足
    STOCK_NO_ENOUGH: { code:4005, msg:'库存不足' },
    //4006 - 订单已经处理
    ORDER_HAS_HANDLE: { code:4006, msg:'订单已经处理' },
    //4007 - 余额不够
    MONEY_NO_ENOUGH: { code:4007, msg:'余额不够' },
    //4008 - 用户权限不足
    NO_PERMISSION: { code:4008, msg:'用户权限不足' },
}



//游戏服错误码 6000 ~ 9999

exports.GAME_ERRS = {


}






let that = this;
function checkRepeatErrCode(){
    let allCode = {};
    for(let processKey in that){
        if( typeof that[processKey] === 'object' ){
            for(let typeKey in that[processKey]){
                let code = that[processKey][typeKey].code;
                if(code && allCode[code]){
                    console.error(`errcode.js 文件 存在相同的 code  位置：${processKey}.${typeKey}  重复的位置：${allCode[code]}`)
                }else{
                    allCode[code] = `code 进程类型：${processKey}.${typeKey}`
                }
            }
        }
    }
    
    delete allCode
}

checkRepeatErrCode()