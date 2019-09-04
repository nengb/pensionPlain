

const db = require('../utils/dbsync_hall');
const dbRedis = require('../utils/db_redis_hall');
const redis = require('../utils/redis');
const http = require('../utils/http');
const crypto = require('../utils/crypto');

//redis表名
const { TOKENS_USER, USERS_TOKEN, WITHDRAW_LIST } = dbRedis;
function objKeySort(obj) {
    var newkey = Object.keys(obj).sort();
    var newObj = {};
    for (var i = 0; i < newkey.length; i++) {
        newObj[newkey[i]] = obj[newkey[i]];
    }
    return newObj;
}
function json2xml(data) {
    var str = `<xml>`
    for (var key in data) {
        str += `<${key}><![CDATA[${data[key]}]]></${key}>`
    }
    str += '</xml>'
    return str
}
async function deal_withdraw_record() {
    let withdraw_list = await db.get_no_deal_withdraw_records()

    let deal_withdraw_record_time = Number(await db.get_configs("deal_withdraw_record_time"))

    if (deal_withdraw_record_time >= 1) {
    } else {
        deal_withdraw_record_time = 1
    }

    if (!withdraw_list) {
        return
    }
    for (let i in withdraw_list) {
        if (withdraw_list[i].create_time <= Date.now() - deal_withdraw_record_time * 1000) {
            if (withdraw_list[i].type == 1) {
            } else {
                await to_withdraw(withdraw_list[i].withdraw_id)
            }
        }
    }

}



async function to_withdraw(order_id) {
    if (await redis.hget(WITHDRAW_LIST, order_id)) {
        return;
    }
    let rdata = {};
    rdata[order_id] = 1
    await redis.hmset(WITHDRAW_LIST, rdata)

    let withdraw_info = await db.get_withdraw_record(order_id)
    if (!withdraw_info || withdraw_info.state != 1 || withdraw_info.money < 0.3 || withdraw_info.auto_deal_time >= 3) {
        await redis.hdel(WITHDRAW_LIST, order_id)
        return;
    }
    await db.update_withdraw_record_deal_time(order_id)

    let user = await db.get_user_data_by_userid(withdraw_info.userid)

    if (!user) {
        await redis.hdel(WITHDRAW_LIST, order_id)
        return;
    }

    if (withdraw_info.platform == 1 && !user.wx_openid || withdraw_info.platform == 0 && !user.openid) {
        await redis.hdel(WITHDRAW_LIST, order_id)
        return;
    }
    var AppID = 'wx8b8459c0c44cb46d'
    var AppSecret = 'YBOGnUs6ZuqftOxGNCYOjdeiRGdiGepv'
    var mch_id = '1508213971'
    let my_openid = user.openid

    if (withdraw_info.platform == 1) {
        AppID = 'wx1cf05273c7fe4e99'
        my_openid = user.wx_openid
    }
    var ip = `47.97.32.55`

    var data = {
        mch_appid: AppID,//应用ID	
        mchid: mch_id,//商户号
        nonce_str: '' + Date.now(),//随机字符串
        partner_trade_no: order_id,//商户订单号	
        openid: my_openid,
        check_name: 'FORCE_CHECK',
        re_user_name: withdraw_info.real_name,
        amount: parseInt(Number(withdraw_info.money) * 100),//总金额（分）
        desc: '用户提现',//交易类型
        spbill_create_ip: ip,//ip
    }
    data = objKeySort(data);
    var signStr = "";
    var eq = "";
    for (var k in data) {
        signStr = signStr + eq + k + '=' + data[k];
        eq = '&'
    }
    signStr += `&key=${AppSecret}`
    var sign = crypto.md5(signStr).toUpperCase();
    data.sign = sign
    console.log("提现参数")
    console.log(data)
    let result = await http.postXML_TX_Sync("https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers", data)
    if (result.data && result.data.result_code == 'SUCCESS') {
        await db.update_withdraw_record(order_id, 3, result.data.payment_no, null, mch_id)
        await redis.hdel(WITHDRAW_LIST, order_id)
        return true
    } else {

        if (result.data) {
            await db.update_withdraw_record(order_id, 2,null,result.data.err_code_des)
            await db.add_user_money(withdraw_info.userid, withdraw_info.money, 'withdraw_refund')
            await redis.hdel(WITHDRAW_LIST, order_id)
            return false
        } else {
            await redis.hdel(WITHDRAW_LIST, order_id)
            return false
        }

    }

}




async function deal_finish_reward_active() {
    let active_list = await db.get_finish_reward_active()
    if (!active_list) {
        return
    }
    for (let i in active_list) {
        let ret = await db.add_user_money(active_list[i].originator_id, active_list[i].remain_reward_amount, 'red_packet_refund', `接龙${active_list[i].active_id}红包过期返还`)
        if (ret) {
            await db.update_finish_reward_active(active_list[i].active_id)
        }
    }

}
exports.deal_withdraw_record = deal_withdraw_record
exports.deal_finish_reward_active = deal_finish_reward_active