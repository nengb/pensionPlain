
const db = require('../../../utils/dbsync_hall');
const dbRedis = require('../../../utils/db_redis_hall');
const redis = require('../../../utils/redis');

const crypto = require('../../../utils/crypto');
const http = require('../../../utils/http');
const configs = require('../../../configs.js');
const config = configs.hall_server();
var xml2js = require('xml2js');

const path = require('path');
const fs = require('fs');
const TOKEN = require('../utils/token');

const ERRCODE = require('../../../utils/errcode.js');
//redis表名
const { TOKENS_USER, USERS_TOKEN, WITHDRAW_LIST } = dbRedis;
const { RET_OK } = ERRCODE;
//大厅服错误码
const { TOKEN_TIMEOUT, NO_USER, MONEY_NO_ENOUGH, OPERATE_FAILED, STOCK_NO_ENOUGH, ORDER_HAS_HANDLE } = ERRCODE.HALL_ERRS;
//系统错误码
const { INVALID_PARAMETER, INTER_NETWORK_ERROR } = ERRCODE.SYS_ERRS;
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
const withdraw_list = {

}

redis.del(WITHDRAW_LIST)
/**
 * 
 *  用户商品管理模块
 */

// import db from '../utils/dbsync_hall'
// await db.update_user_info(account, name, headimgurl, sex)
module.exports = app => {
    const controllerUtils = require('../utils')(app)
    class httpController extends controllerUtils {
        constructor() {
            super()

        }


        async user_withdraw(req, res) {
            let { token } = req.query;
            let user = req.user;


            let { userid, money } = user;


            let getGoodclassList = await db.getGoodclassList({ userid });
            if (!getGoodclassList) {
                getGoodclassList = []
            }
            http.send(res, RET_OK, { data: getGoodclassList });

        }

        getFlatternDistance(lat1, lng1, lat2, lng2) {
            var EARTH_RADIUS = 6378137.0;    //单位M
            var PI = Math.PI;

            function getRad(d) {
                return d * PI / 180.0;
            }
            var f = getRad((lat1 + lat2) / 2);
            var g = getRad((lat1 - lat2) / 2);
            var l = getRad((lng1 - lng2) / 2);

            var sg = Math.sin(g);
            var sl = Math.sin(l);
            var sf = Math.sin(f);

            var s, c, w, r, d, h1, h2;
            var a = EARTH_RADIUS;
            var fl = 1 / 298.257;

            sg = sg * sg;
            sl = sl * sl;
            sf = sf * sf;

            s = sg * (1 - sl) + (1 - sf) * sl;
            c = (1 - sg) * (1 - sl) + sf * sl;

            w = Math.atan(Math.sqrt(s / c));
            r = Math.sqrt(s * c) / w;
            d = 2 * w * a;
            h1 = (3 * r - 1) / 2 / c;
            h2 = (3 * r + 1) / 2 / s;

            return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
        }

        /**
         * showdoc
         * @catalog 订单管理
         * @title 提交订单
         * @description 提交订单
         * @method get
         * @url https://xxx:9001/submit_order
         * @param token 必选 string 用户凭证token  
         * @param active_id 必选 string 活动ID  
         * @param group_way_list 必选 string 选择的商品和数量的数组 （[{"group_way_id":9,"num":1},{"group_way_id":10,"num":2}]）  
         * @param comments 必选 string 备注  
         * @param logistics 必选 string 额外参数  
         * @param latitude 非必选 Number  纬度 
         * @param longitude 非必选 Number 经度  
     
         * @return {"data": 15,"pay_state":true,"errcode": 0,"errmsg": "ok"}
         * @return_param data int 生成的订单号
         * @return_param pay_state bool 支付状态
         */

        async submit_order(req, res) {
            let { token, active_id, group_way_list, comments, logistics } = req.query;

            let user = req.user;


            let { latitude, longitude } = user
            latitude = Number(latitude)
            longitude = Number(longitude)
            let active = await db.get_active_by_id(active_id);
            if (active == null || active.state != 1 || active.enable == 1) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            if (active.end_time < Date.now() || active.start_time > Date.now()) {
                http.send(res, { code: 1, msg: '不在接龙时间' });
                return;
            }

            if (active.use_local == 1 && active.local_area_count > 0) {

                if (!latitude || !longitude) {
                    http.send(res, { code: 1, msg: '无法获取定位信息' });
                    return;
                }
                let place_list = await db.get_active_locale({ active_id, type: 0 })
                for (let i in place_list) {
                    let distance = this.getFlatternDistance(place_list[i].latitude, place_list[i].longitude, latitude, longitude)
                    if (distance > active.local_area_count) {
                        http.send(res, { code: 1, msg: '该位置超出接龙范围' });
                        return;
                    }
                }
            }

            var logistics_new = null
            try {
                group_way_list = JSON.parse(group_way_list)

                logistics_new = JSON.parse(logistics)

            } catch (err) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            if (logistics_new.items) {
                for (let i in logistics_new.items) {
                    if (logistics_new.items[i].checked && !logistics_new.items[i].content) {
                        http.send(res, { code: 1, msg: '请完善联系方式' });
                        return;
                    }
                }
            }
            let check_buy_count = await db.check_buy_count(user.userid, active_id);


            if (active.all_count > 0) {
                if (check_buy_count.cnt >= active.all_count) {
                    http.send(res, { code: 1, msg: '接龙次数已达上限' });
                    return;
                }
            }

            var check_arr = {}
            for (var i = 0; i < group_way_list.length; i++) {
                let num = Number(group_way_list[i].num)
                if (num > 0) {
                    if (check_arr[group_way_list[i].group_way_id]) {
                        check_arr[group_way_list[i].group_way_id] += num
                    } else {
                        check_arr[group_way_list[i].group_way_id] = num
                    }
                }

            }
            var result = [];
            for (var key in check_arr) {
                result.push({
                    group_way_id: key,
                    num: check_arr[key]
                })
            }
            if (result.length == 0) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            group_way_list = result

            let all_price = 0


            for (let key in group_way_list) {
                let num = Number(group_way_list[key].num)

                let group_way = await db.get_group_way_by_id(group_way_list[key].group_way_id);
                if (!group_way) {
                    http.send(res, { code: 1, msg: '找不到该选项' });

                    return;
                }
                if (group_way.stock < num) {
                    http.send(res, STOCK_NO_ENOUGH);
                    return;
                }
                let single_price = group_way.price || 0

                all_price = all_price + single_price * num
            }
            // let all_price = 0.01


            if (active.start_price > 0) {
                if (active.start_price_mode == 1) {
                    if (all_price + check_buy_count.all_cost < active.start_price) {
                        http.send(res, { code: 1, msg: '订单金额不足起购价' });
                        return;
                    }
                } else {
                    if (all_price < active.start_price) {
                        http.send(res, { code: 1, msg: '订单金额不足起购价' });
                        return;
                    }
                }

            }
            if (0 < all_price && all_price < 0.1) {
                http.send(res, { code: 1, msg: '接龙金额需要大于0.1' });
                return;
            }

            var title = '';
            let ord = 'BK' + Date.now() + user.userid;
            let op = {
                userid: user.userid,
                active_id: active_id,
                comments,
                reward_money: 0,
                active_content: active.title,
                attend_cost: all_price,
                logistics,
                order_id: ord,
                locale: JSON.stringify({ latitude, longitude }),

            }
            let ret = await db.create_active_record(op)
            var pay_state = false
            if (all_price == 0) {
                pay_state = true


            }


            if (ret) {
                let goodList = ``
                for (let key in group_way_list) {
                    let group_way = await db.get_group_way_by_id(group_way_list[key].group_way_id);
                    let single_price = group_way.price
                    let num = Number(group_way_list[key].num)

                    let price = single_price * num
                    let op1 = {
                        attend_id: ret,
                        group_way_id: group_way_list[key].group_way_id,
                        num: num,
                        name: group_way.name,
                        size: group_way.size,
                        price: price,
                    }

                    goodList += `${group_way.name}(${group_way.size})+${num},￥${Number(price).toFixed(2)}`
                    let ret1 = await db.create_active_record_good(op1)
                }
                //添加操作记录
                db.add_active_record_log({ userid: user.userid, type: 2, content: goodList, attend_id: ret })
                if (pay_state) {
                    await db.update_active_record_state(ret, 0, active_id)
                    setTimeout(async () => {
                        let aa = await http.getSync("http://127.0.0.1:9004/buy_success_to_robot", { attend_id: ret })
                        console.log('接龙成功通知', aa)
                    }, 0)


                }
                http.send(res, RET_OK, { data: ret, pay_state: pay_state })

            } else {
                http.send(res, INTER_NETWORK_ERROR)

            }
        }

        /**
   * showdoc
   * @catalog 订单管理
   * @title 支付订单
   * @description 支付订单
   * @method get
   * @url https://xxx:9001/pay_for_order
   * @param token 必选 string 用户凭证token
   * @param attend_id 必选 string 订单ID
   * @return {"data": {"appId": "wx8b8459c0c44cb46d","nonceStr": "X7VxNLfsu9lqy2ab","package": "prepay_id=wx091002548074064cba213b790213099434","signType": "MD5","timeStamp": "1557367374","paySign": "698C2FC9D443672860012B12446788FA"},"type": 1,"errcode": 0,"errmsg": "ok"}
   * @return_param data object 支付需要的参数
   * @return_param type int 1为微信支付2为余额支付
   */

        async  pay_for_order(req, res, next) {
            let { token, attend_id, platform } = req.query;


            let user = req.user;

            if (!attend_id || attend_id == "undefined") {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let active_record = await db.get_active_record_by_id(attend_id);

            if (!active_record || active_record.attend_cost <= 0) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            if (active_record.payment_state != 1) {
                http.send(res, ORDER_HAS_HANDLE);
                return;
            }
            if (user.money >= active_record.attend_cost) {
                http.send(res, RET_OK, { data: {}, type: 2 })
                return;

            }
            let all_price = active_record.attend_cost
            // let all_price = 0.01
            if (all_price < 0.1) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            let { userid, openid, wx_openid } = user;




            var callbackurl = `http://47.97.32.55:9001/wechatPay_back`;

            var AppID = 'wx8b8459c0c44cb46d'
            var AppSecret = 'YBOGnUs6ZuqftOxGNCYOjdeiRGdiGepv'
            var mch_id = '1508213971'
            let my_openid = openid
            if (platform == 1) {
                AppID = 'wx1cf05273c7fe4e99'
                my_openid = wx_openid
            }

            if (!my_openid) {
                http.send(res, -1, `缺少openid`);
                return;
            }

            // var AppID = await db.get_configs('mini_AppID')||config.appInfo.H5.mini2.appid
            // var AppSecret = await db.get_configs('mini_AppSecret')||config.appInfo.H5.mini2.AppSecret
            // var mch_id = await db.get_configs('mini_mch_id')||config.appInfo.H5.mini2.mch_id
            var ip = req.ip;
            ip = ip.replace('::ffff:', '');
            //获取购买数据信息

            var time = Date.now()
            var orderid = 'BK' + time + userid;
            var data = {
                appid: AppID,//应用ID	
                mch_id: mch_id,//商户号
                nonce_str: '' + Date.now(),//随机字符串

                body: `亲接龙订单:${attend_id}`,//商品描述
                out_trade_no: orderid,//商户订单号	
                total_fee: parseInt(Number(all_price) * 100),//总金额（分）
                spbill_create_ip: ip,//ip
                openid: my_openid,
                notify_url: callbackurl,//通知地址
                trade_type: "JSAPI",//交易类型
            }
            data = objKeySort(data);
            var signStr = "";
            var eq = "";
            for (var k in data) {
                if (data[k]) {
                    signStr = signStr + eq + k + '=' + data[k];
                    eq = '&'
                }
            }
            signStr += `&key=${AppSecret}`
            var sign = crypto.md5(signStr).toUpperCase();
            data.sign = sign
            let result1 = await db.create_pay_record(orderid, attend_id, userid, active_record.attend_cost, 1)
            console.log(result1)
            if (result1) {
                // http.postXML_Sync("https://api.mch.weixin.qq.com/pay/unifiedorder", data, function (err, result) {
                let result = await http.postXML_Sync("https://api.mch.weixin.qq.com/pay/unifiedorder", data)
                console.log(result)
                if (result.err || !result.data) {
                    http.send(res, { code: 1, msg: 'fail' }, { data: null })
                } else {
                    if (result.data.return_code == 'FAIL') {
                        http.send(res, { code: 1, msg: 'fail' }, { data: null })
                        return;
                    }
                    var timestamp = parseInt(Date.now() / 1000).toString()
                    var signData = {
                        appId: AppID,
                        nonceStr: result.data.nonce_str,
                        timeStamp: timestamp,
                        package: "prepay_id=" + result.data.prepay_id,
                        signType: 'MD5'
                    }
                    signData = objKeySort(signData);
                    var signStr = "";
                    var eq = "";
                    for (var k in signData) {
                        signStr = signStr + eq + k + '=' + signData[k];
                        eq = '&'
                    }
                    signStr += `&key=${AppSecret}`
                    var sign = crypto.md5(signStr).toUpperCase();
                    signData.paySign = sign
                    http.send(res, RET_OK, { data: signData, type: 1 })
                }
            } else {
                http.send(res, { code: 1, msg: 'fail' });
            }
        }

        async reward_user(active, active_record, user) {
            if (active == null || active.state != 1 || active.enable == 1 || active.use_reward != 1 || active.remain_reward_num <= 0 || active.remain_reward_amount == null || active.remain_reward_amount <= 0) {
                return;
            }
            if (!active_record) {
                return;
            }
            if (active.use_reward_locale == 1) {
                if (!user.latitude || !user.longitude) {
                    return;
                }
                let place_list = await db.get_active_locale({ active_id: active.active_id, type: 1 })
                if (!place_list) {
                    return;
                }
                for (let i in place_list) {
                    let distance = this.getFlatternDistance(place_list[i].latitude, place_list[i].longitude, user.latitude, user.longitude)
                    if (distance > active.reward_local_area_count) {
                        return;
                    }
                }

            }

            // let active_reward_info = await db.get_active_reward_info(active.active_id)

            let remain_time = active.remain_reward_num
            let remain_money = active.remain_reward_amount
            let min = 0.01
            if (remain_money < min || remain_time <= 0) {
                return
            }
            let max = (remain_money / remain_time) * 2
            let money = Math.random() * max
            money = money <= min ? min : money
            if (remain_time == 1) {
                money = remain_money
            }

            money = Math.floor(money * 100) / 100;

            let ret = await db.update_active_reward(active_record.attend_id, money)
            if (ret) {
                let ret1 = await db.update_active_remain_reward(active.active_id, money)
                if (ret1) {
                    await db.add_user_money(active_record.userid, money, "red_packet", `接龙${active.active_id}红包`, null, active_record.attend_id)
                }
            }

            return true;

        }


        async reward_invitor(active, active_record, user_get_money) {
            console.log('进入分享奖励')

            let user_enter_info = await db.get_user_read_active(active_record.active_id, active_record.userid)
            if (!user_enter_info || !user_enter_info.invitor_id || user_enter_info.invitor_id == user_enter_info.invitor_id.originator_id) {
                return false;
            }

            let active_share_reward_rule = await db.get_active_share_reward_rule(active.active_id)
            if (!active_share_reward_rule) {
                return false;
            }
            let reward_rule = active_share_reward_rule.find(e => {
                return active_record.attend_cost >= e.start_money
            })
            if (!reward_rule) {
                return false;
            }
            let share_reward_money = active_record.attend_cost * reward_rule.reward_ratio / 100
            if (user_get_money) {
                share_reward_money = user_get_money * reward_rule.reward_ratio / 100
            }
            if (share_reward_money < 0.01) {
                return false;
            }
            let ret = await db.add_active_share_reward(active_record.active_id, user_enter_info.invitor_id, share_reward_money,
                reward_rule.share_reward_rule_id, reward_rule.start_money, reward_rule.reward_ratio, active_record.attend_id)
            if (ret) {
                await db.add_user_money(user_enter_info.invitor_id, share_reward_money, "share", `分享接龙${active.active_id}获利`, null, active_record.attend_id)
                return share_reward_money
            } else {
                return false;
            }
        }


        /**
        * showdoc
        * @catalog 订单管理 
        * @title 余额支付订单
        * @description 余额支付订单
        * @method get
        * @url https://xxx:9001/balance_for_order
        * @param token 必选 string 用户凭证token
        * @param attend_id 必选 string 订单ID
        * @return {"errcode": 0,"errmsg": "ok"}
        */
        async  balance_for_order(req, res, next) {
            let { token, attend_id } = req.query;
            if (await redis.hget(WITHDRAW_LIST, token)) {
                http.send(res, TOKEN_TIMEOUT);
                return;
            }
            let rdata = {};
            rdata[token] = 1
            await redis.hmset(WITHDRAW_LIST, rdata)
            let user = await TOKEN.getUserInfo(token);
            if (user == null) {
                await redis.hdel(WITHDRAW_LIST, token)

                http.send(res, TOKEN_TIMEOUT);
                return;
            }
            let _this = this
            let active_record = await db.get_active_record_by_id(attend_id);

            if (!active_record || active_record.attend_cost <= 0) {
                await redis.hdel(WITHDRAW_LIST, token)

                http.send(res, INVALID_PARAMETER);
                return;
            }
            if (active_record.payment_state != 1) {
                await redis.hdel(WITHDRAW_LIST, token)

                http.send(res, ORDER_HAS_HANDLE);
                return;
            }
            if (user.money >= active_record.attend_cost) {

                let active = await db.get_active_by_id(active_record.active_id);
                await db.update_active_record_state(attend_id, 3, active_record.active_id)
                await db.dec_user_money(active_record.userid, active_record.attend_cost, 'qjl', `接龙${active_record.order_id}`, null, attend_id)
                console.log(active)
                console.log('9')
                if (active.use_share_reward == 1) {
                    let reward_invitor_money = await this.reward_invitor(active, active_record)
                    console.log('6')

                    console.log(reward_invitor_money)

                    if (reward_invitor_money) {
                        console.log('7')

                        await db.add_user_money(active.originator_id, active_record.attend_cost - reward_invitor_money, 'qjl', `接龙${active_record.order_id}`, null, attend_id)

                    } else {
                        console.log('8')
                        await db.add_user_money(active.originator_id, active_record.attend_cost, 'qjl', `接龙${active_record.order_id}`, null, attend_id)
                    }
                } else {
                    await db.add_user_money(active.originator_id, active_record.attend_cost, 'qjl', `接龙${active_record.order_id}`, null, attend_id)

                }
                setTimeout(async () => {
                    let ret = await http.getSync("http://127.0.0.1:9004/buy_success_to_robot", { attend_id: attend_id })
                    console.log('接龙成功通知', ret)
                }, 0)
                setTimeout(async () => {
                    await _this.reward_user(active, active_record, user)
                }, 0)
                //添加操作记录
                db.add_active_record_log({ userid: active_record.userid, type: 3, content: '', attend_id: active_record.attend_id })
                await redis.hdel(WITHDRAW_LIST, token)
                http.send(res, RET_OK)
            } else {
                await redis.hdel(WITHDRAW_LIST, token)
                http.send(res, { code: 1, msg: 'fail' });
            }

        }



        async  get_pay_data(req, res, next) {
            let { token, pay_money, platform } = req.query;

            let user = req.user;

            ///platform   0 为小程序支付 1为 公众号 支付

            pay_money = Number(pay_money)
            if (pay_money <= 0.01) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            //  pay_money =0.01

            let fee = Math.ceil(pay_money) / 100
            if (fee < 0.01) {
                fee = 0.01
            }
            let all_price = pay_money + fee

            let { userid, openid, wx_openid } = user;

            console.log("user")
            console.log(user)
            console.log(platform)
            console.log(platform == 1)

            var callbackurl = `http://47.97.32.55:9001/wechatPay_back`;


            var AppID = 'wx8b8459c0c44cb46d'
            var AppSecret = 'YBOGnUs6ZuqftOxGNCYOjdeiRGdiGepv'
            var mch_id = '1508213971'
            let my_openid = openid

            if (platform == 1) {

                my_openid = wx_openid
            }

            console.log(my_openid)

            if (!my_openid) {
                http.send(res, -1, `缺少openid`);
                return;
            }

            // var AppID = await db.get_configs('mini_AppID')||config.appInfo.H5.mini2.appid
            // var AppSecret = await db.get_configs('mini_AppSecret')||config.appInfo.H5.mini2.AppSecret
            // var mch_id = await db.get_configs('mini_mch_id')||config.appInfo.H5.mini2.mch_id
            var ip = req.ip;
            ip = ip.replace('::ffff:', '');
            //获取购买数据信息

            var time = Date.now()
            var orderid = 'BK' + time + userid;
            var data = {
                appid: AppID,//应用ID	
                mch_id: mch_id,//商户号
                nonce_str: '' + Date.now(),//随机字符串
                body: `亲接龙充值:${all_price}元`,//商品描述
                out_trade_no: orderid,//商户订单号	
                total_fee: parseInt(Number(all_price) * 100),//总金额（分）
                spbill_create_ip: ip,//ip
                openid: my_openid,
                notify_url: callbackurl,//通知地址
                trade_type: "JSAPI",//交易类型
            }
            data = objKeySort(data);
            var signStr = "";
            var eq = "";
            for (var k in data) {
                if (data[k]) {
                    signStr = signStr + eq + k + '=' + data[k];
                    eq = '&'
                }
            }
            signStr += `&key=${AppSecret}`
            var sign = crypto.md5(signStr).toUpperCase();
            data.sign = sign
            let result1 = await db.create_pay_record(orderid, 0, userid, pay_money, 2, fee)

            if (result1) {
                // http.postXML_Sync("https://api.mch.weixin.qq.com/pay/unifiedorder", data, function (err, result) {
                let result = await http.postXML_Sync("https://api.mch.weixin.qq.com/pay/unifiedorder", data)
                if (result.err || !result.data) {
                    http.send(res, { code: 1, msg: 'fail' }, { data: null })
                } else {
                    if (result.data.return_code == 'FAIL') {
                        http.send(res, { code: 1, msg: 'fail' }, { data: null })
                        return;
                    }
                    var timestamp = parseInt(Date.now() / 1000).toString()
                    var signData = {
                        appId: AppID,
                        nonceStr: result.data.nonce_str,
                        timeStamp: timestamp,
                        package: "prepay_id=" + result.data.prepay_id,
                        signType: 'MD5'
                    }
                    signData = objKeySort(signData);
                    var signStr = "";
                    var eq = "";
                    for (var k in signData) {
                        signStr = signStr + eq + k + '=' + signData[k];
                        eq = '&'
                    }
                    signStr += `&key=${AppSecret}`
                    var sign = crypto.md5(signStr).toUpperCase();
                    signData.paySign = sign
                    http.send(res, RET_OK, { data: signData, type: 1 })
                }
            } else {
                http.send(res, { code: 1, msg: 'fail' });
            }
        }


        async  wechatPay_back(req, res, next) {
            var parseString = xml2js.parseString;
            var rawBody = '';//添加接收变量
            var json = {};
            req.setEncoding('utf8');
            req.on('data', function (chunk) {
                rawBody += chunk;
            });
            let _this = this
            req.on('end', async function () {
                console.log(rawBody)
                parseString(rawBody, { explicitArray: false }, async function (err, result) {
                    var reData = result
                    console.log(reData.xml)
                    var data = reData.xml
                    var successData = {
                        return_code: 'SUCCESS',
                        return_msg: 'OK'
                    }
                    var failData = {
                        return_code: 'FAIL',
                        return_msg: 'FAIL'
                    }
                    var suc = json2xml(successData)
                    var fail = json2xml(failData)
                    var return_code = data.return_code
                    var transaction_id = data.transaction_id
                    var result_code = data.result_code
                    var out_trade_no = data.out_trade_no
                    var orderid = data.out_trade_no;
                    if (return_code && return_code == 'SUCCESS') {
                        var changeStateOK = false;
                        var payData = await db.get_pay_data(orderid)
                        console.log("支付返回情况");
                        console.log(payData);
                        console.log(payData.type);
                        if (!payData) {
                            res.send(fail);
                            return;
                        }
                        if (payData.state == 1) {
                            var state = 2;
                            if (result_code == 'SUCCESS') {
                                state = 3;
                                changeStateOK = await db.update_pay_state(payData.ord_id, state, transaction_id)
                                console.log("支付返回情况1", changeStateOK);
                                if (changeStateOK) {
                                    if (payData.type == 1) {
                                        let active_record = await db.get_active_record_by_id(payData.attend_id);
                                        let active = await db.get_active_by_id(active_record.active_id);
                                        await db.update_active_record_state(payData.attend_id, state, active_record.active_id, 1)
                                        await db.add_user_money(payData.userid, payData.cost, 'pay', '充值')
                                        await db.dec_user_money(payData.userid, payData.cost, 'qjl', `接龙${active_record.order_id}`, null, payData.attend_id)
                                        let user_get_money = payData.cost * 0.99
                                        if (payData.cost * 0.01 < 0.01) {
                                            user_get_money = payData.cost - 0.01
                                        }
                                        setTimeout(async () => {
                                            await _this.reward_user(active, active_record, user)
                                        }, 0)

                                        if (active.use_share_reword == 1) {

                                            let reward_invitor_money = await _this.reward_invitor(active, active_record, user_get_money)
                                            if (reward_invitor_money) {
                                                await db.add_user_money(active.originator_id, user_get_money - reward_invitor_money, 'qjl', `接龙${active_record.order_id}`, null, attend_id)
                                            } else {
                                                await db.add_user_money(active.originator_id, user_get_money, 'qjl', `接龙${active_record.order_id}`, null, attend_id)
                                            }
                                        } else {
                                            await db.add_user_money(active.originator_id, user_get_money, 'qjl', `接龙${active_record.order_id}`, null, payData.attend_id)
                                        }
                                        setTimeout(async () => {
                                            let ret = await http.getSync("http://127.0.0.1:9004/buy_success_to_robot", { attend_id: payData.attend_id })
                                            console.log('接龙成功通知', ret)
                                        }, 0)

                                        //添加操作记录
                                        db.add_active_record_log({ userid: payData.userid, type: 3, content: '', attend_id: payData.attend_id })
                                    } else if (payData.type == 2) {
                                        await db.add_user_money(payData.userid, payData.cost, 'pay', '充值')
                                    }
                                    setTimeout(async () => {
                                        var ret = await http.getSync('http://localhost:9003/paySuccess?userid=' + payData.userid)
                                        console.log('充值通知', ret)
                                    }, 0)
                                }
                            } else {
                                changeStateOK = await db.update_pay_state(payData.ord_id, state)
                                await db.update_active_record_state(payData.attend_id, state)
                            }
                        }
                        //向支付平台汇报成功消息
                        res.send(suc);
                    } else {
                        res.send(fail);
                    }
                });
            });
        }

        /**
         * showdoc
         * @catalog 订单管理
         * @title 查看订单
         * @description 查看订单
         * @method get
         * @url https://xxx:9001/get_active_record_detail
         * @param token 必选 string 用户凭证token  
         * @param attend_id 必选 string 订单ID  
         * @return {"data":{"attend_id":44,"userid":40052945,"active_id":32,"time":1557561509967,"comments":"","reward_money":0,"active_content":"active_content","attend_cost":0.01,"state":1,"active_index":21,"phone":null,"real_name":null,"addr":null,"order_id":"BK155756150996540052945","logistics":"{\"userid\":40052945,\"account\":\"wx_oP7dK5PSVYW0xMtTH6D1BC1dhRVo\",\"name\":\"BigBinChan\",\"sex\":1,\"headimg\":\"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJWddt1Ficn6dUibWsQO2mFYvibnAgELnyTVloCbko7d4WuPMfxLzmQIRxEuUABgMOr9KFiaa2hK1h4IQ/132\",\"money\":198.05,\"create_time\":1556526167067,\"first_login\":null,\"last_login\":null,\"phone\":null,\"real_name\":null,\"addr\":null,\"openid\":\"oP7dK5PSVYW0xMtTH6D1BC1dhRVo\",\"invitor_id\":0,\"attent_wechat\":1,\"about_me\":null,\"userFansCount\":2,\"userFansAttentWechatCount\":1}","good_list":[{"records_good_id":39,"group_way_id":49,"attend_id":44,"num":1,"name":"33","size":"呃呃呃","price":0.01}]},"errcode":0,"errmsg":"ok"}
         * @return_param active_index int 订单号序号
         * @return_param good_list array 订单商品详情
         */

        async get_active_record_detail(req, res) {
            let { token, attend_id } = req.query;
            // let user = await TOKEN.getUserInfo(token);
            // if (user == null) {
            //     http.send(res, TOKEN_TIMEOUT);
            //     return;
            // }
            let active_record = await db.get_active_record_detail_by_id(attend_id);

            http.send(res, RET_OK, { data: active_record });

        }

        async profitsharing() {

            let data = {
                appid: 11123123123,
                mch_id: 11123123123,
                sub_appid: 11123123123,
                sub_mch_id: 11123123123,
                nonce_str: 11123123123,
                out_order_no: 11123123123,
                transaction_id: 11123123123,
                sign_type: 11123123123,
                receivers: 11123123123,
            }

            data = objKeySort(data);
            var signStr = "";
            var eq = "";
            for (var k in data) {
                if (data[k]) {
                    signStr = signStr + eq + k + '=' + data[k];
                    eq = '&'
                }

            }
            signStr += `&key=${AppSecret}`
            var sign = crypto.md5(signStr).toUpperCase();
            data.sign = sign

            let result = await http.postXML_TX_Sync("https://api.mch.weixin.qq.com/pay/unifiedorder", data)


        }

        /**
           * showdoc
           * @catalog 订单管理
           * @title 提现
           * @description 提现
           * @method get
           * @url https://xxx:9001/get_wechatPay_to_user
           * @param token 必选 string 用户凭证token  
           * @param money 必选 string 提现金额  
           * @param real_name 必选 string 真实姓名  
           * @param platform 必选 string 提现平台，0为小程序，1为H5 
           * @param type 必选 string 0为提现到零钱，1为提现到银行卡  
           * @param bank_code 非必选 string type=1时必选，银行编码 
           * @param bank_no 非必选 string type=1时必选,银行卡号   
           * @return {"errcode":0,"errmsg":"ok"}
           */

        //{"err":null,"data":{"return_code":"SUCCESS","return_msg":"","mch_appid":"wx8b8459c0c44cb46d","mchid":"1508213971","nonce_str":"1557988067519","result_code":"SUCCESS","partner_trade_no":"TX1557988067519","payment_no":"1508213971201905163386991301","payment_time":"2019-05-16 14:27:48"}}

        async  get_wechatPay_to_user(req, res, next) {

            let { token, money, real_name, platform, type, bank_code, bank_no } = req.query;

            if (!platform) {
                platform = 0
            }
            if (await redis.hget(WITHDRAW_LIST, token)) {
                http.send(res, TOKEN_TIMEOUT);
                return;
            }
            if (!type) {
                type = 0
            }

            let rdata = {};
            rdata[token] = 1
            await redis.hmset(WITHDRAW_LIST, rdata)

            if (!money || !real_name) {
                await redis.hdel(WITHDRAW_LIST, token)
                http.send(res, INVALID_PARAMETER);
                return;
            }
            if (type == 1) {
                if (!bank_code || !bank_no) {
                    await redis.hdel(WITHDRAW_LIST, token)
                    http.send(res, INVALID_PARAMETER);
                    return;
                }

            }
            let user = await TOKEN.getUserInfo(token);
            if (user == null) {
                await redis.hdel(WITHDRAW_LIST, token)
                http.send(res, TOKEN_TIMEOUT);
                return;
            }

            money = Number(money)
            if (money < 0.3) {
                await redis.hdel(WITHDRAW_LIST, token)
                http.send(res, { code: 1, msg: '最小额度为0.3元 ' });
                return;
            }

            if (user.money < money) {
                await redis.hdel(WITHDRAW_LIST, token)
                http.send(res, MONEY_NO_ENOUGH);
                return;
            }

            let user_today_withdraw_info = await db.get_user_today_withdraw_info(user.userid)

            let withdraw_max_count = Number(await db.get_configs("withdraw_max_count"))
            let withdraw_money_limit = Number(await db.get_configs("withdraw_money_limit"))
            if (withdraw_max_count > 0) {

            } else {
                withdraw_max_count = 5
            }

            if (withdraw_money_limit > 0) {

            } else {
                withdraw_money_limit = 5000
            }


            if (user_today_withdraw_info.all_count >= withdraw_max_count) {
                await redis.hdel(WITHDRAW_LIST, token)
                http.send(res, { code: 1, msg: `本日提现次数已经达到${withdraw_max_count}次，请明天再尝试` });
                return;

            }
            if (user_today_withdraw_info.all_money + money >= withdraw_money_limit) {
                await redis.hdel(WITHDRAW_LIST, token)
                http.send(res, { code: 1, msg: `本日提现金额已经达到${user_today_withdraw_info.all_money}元，本日还能提现金额为${withdraw_money_limit - user_today_withdraw_info.all_money} 元` });
                return;
            }

            // var AppID = await db.get_configs('AppID')||config.appInfo.H5.wechat.appid
            // var AppSecret = await db.get_configs('AppSecret')||config.appInfo.H5.wechat.AppSecret
            // var mch_id = await db.get_configs('mch_id')||config.appInfo.H5.wechat.mch_id
            var time = Date.now()

            var order_id = 'TX' + time + user.userid;

            let ret = await db.add_withdraw_record({
                order_id,
                userid: user.userid,
                money,
                platform,
                real_name,
                type,
                bank_no,
                bank_code,
            })

            if (ret) {
                await db.dec_user_money(user.userid, money, 'tx', '申请提现', order_id)
                if (type == 1) {
                    await this.to_withdraw_bank(order_id)
                }
                await redis.hdel(WITHDRAW_LIST, token)
                http.send(res, RET_OK)
            } else {
                await redis.hdel(WITHDRAW_LIST, token)
                http.send(res, { code: 1, msg: "fail" })
            }
        }


        async deal_withdraw_record(req, res) {
            let { order_id } = req.query


            let withdraw_info = await db.get_withdraw_record(order_id)
            let ret = false
            if (withdraw_info.type == 1) {
                ret = await this.to_withdraw_bank(withdraw_info.withdraw_id)

            } else {
                ret = await this.to_withdraw(withdraw_info.withdraw_id)

            }
            if (ret) {
                http.send(res, RET_OK)

            } else {
                http.send(res, { code: 1, msg: "fail" })
            }
        }





        async to_withdraw(order_id) {
            if (await redis.hget(WITHDRAW_LIST, order_id)) {
                return;
            }
            let rdata = {};
            rdata[order_id] = 1
            await redis.hmset(WITHDRAW_LIST, rdata)

            let withdraw_info = await db.get_withdraw_record(order_id)
            if (!withdraw_info || withdraw_info.type != 0 || withdraw_info.state != 1 || withdraw_info.money < 0.3) {
                await redis.hdel(WITHDRAW_LIST, order_id)
                return;
            }

            let user = await db.get_user_data_by_userid(withdraw_info.userid)

            if (!user) {
                await redis.hdel(WITHDRAW_LIST, order_id)
                return;
            }

            if ((withdraw_info.platform == 1 && !user.wx_openid) || (withdraw_info.platform == 0 && !user.openid)) {
                await redis.hdel(WITHDRAW_LIST, order_id)
                return;
            }
            var AppID = 'wx8b8459c0c44cb46d'
            var AppSecret = 'YBOGnUs6ZuqftOxGNCYOjdeiRGdiGepv'
            var mch_id = '1508213971'
            let my_openid = user.openid

            if (withdraw_info.platform == 1) {
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
            let result = await http.postXML_TX_Sync("https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers", data)
            if (result.data && result.data.result_code == 'SUCCESS') {
                await db.update_withdraw_record(order_id, 3, result.data.payment_no)
                await redis.hdel(WITHDRAW_LIST, order_id)
                return true
            } else {
                if (result.data) {
                    await redis.hdel(WITHDRAW_LIST, order_id)
                    return false
                } else {
                    await redis.hdel(WITHDRAW_LIST, order_id)
                    return false
                }

            }

        }
        async test_withdraw_bank(req, res, next) {
            let { order_id } = req.query;
            if (order_id) {
                await this.to_withdraw_bank(order_id)

            }

            res.send('12312312312')
        }




        async to_withdraw_bank(order_id) {
            if (await redis.hget(WITHDRAW_LIST, order_id)) {
                return;
            }
            let rdata = {};
            rdata[order_id] = 1
            await redis.hmset(WITHDRAW_LIST, rdata)

            let withdraw_info = await db.get_withdraw_record(order_id)
            if (!withdraw_info || withdraw_info.type != 1 || withdraw_info.state != 1 || withdraw_info.money < 0.3 || !withdraw_info.bank_code || !withdraw_info.bank_no || !withdraw_info.real_name) {
                await redis.hdel(WITHDRAW_LIST, order_id)
                return;
            }

            let user = await db.get_user_data_by_userid(withdraw_info.userid)

            if (!user) {
                await redis.hdel(WITHDRAW_LIST, order_id)
                return;
            }

            if (!withdraw_info.bank_code) {
                await redis.hdel(WITHDRAW_LIST, order_id)
                return;
            }
            var AppID = 'wx8b8459c0c44cb46d'
            var AppSecret = 'YBOGnUs6ZuqftOxGNCYOjdeiRGdiGepv'
            var mch_id = '1508213971'
            let my_openid = user.openid


            var data = {
                mch_id: mch_id,//商户号
                partner_trade_no: order_id,//商户订单号	
                nonce_str: '' + Date.now(),//随机字符串
                enc_bank_no: crypto.rsa_padding(withdraw_info.bank_no),
                enc_true_name: crypto.rsa_padding(withdraw_info.real_name),
                bank_code: withdraw_info.bank_code,
                amount: parseInt(Number(withdraw_info.money) * 100),//总金额（分）
                desc: '用户提现',//交易类型
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
            console.log(data)
            let result = await http.postXML_TX_Sync("https://api.mch.weixin.qq.com/mmpaysptrans/pay_bank", data)
            if (result.data && result.data.result_code == 'SUCCESS') {
                await db.update_withdraw_record(order_id, 3, result.data.payment_no)
                await redis.hdel(WITHDRAW_LIST, order_id)
                return true
            } else {
                if (result.data) {
                    await redis.hdel(WITHDRAW_LIST, order_id)
                    return false
                } else {
                    await redis.hdel(WITHDRAW_LIST, order_id)
                    return false
                }

            }

        }



        /**
          * showdoc
          * @catalog 订单管理
          * @title 查看余额账单
          * @description 查看余额账单
          * @method get
          * @url https://xxx:9001/get_user_bills
          * @param token 必选 string 用户凭证token  
          * @param note 可选 string 订单类型标记  
           * @param page 可选 number 页数，每页返回10条数据，不传返回第一页
          * @return {"data":[{"ord_id":"BK155756063359940052945","userid":40052945,"num":100,"note":"pay","time":"05-11 15:43:53","title":"充值订单","type":"add","current_num":199.05,"detail":"充值"}],"errcode":0,"errmsg":"ok"}
          * @return_param num int 变动金额
          * @return_param time string 时间
          * @return_param title string 标题
          * @return_param detail string 详情
          * @return_param current_num int 用户当前金额
          */

        async  get_user_bills(req, res, next) {
            let { token, page, note } = req.query;


            let user = req.user;


            if (page == null) {
                page = 1;
            }
            var start = null;
            let rows = 10;
            if (page != null) {
                page = Number(page) - 1;
                start = page * rows;
            }

            start < 0 ? start = null : null;

            var suc = await db.get_bills(user.userid, start, rows, note)

            if (suc) {

                http.send(res, RET_OK, { data: suc })

            } else {
                http.send(res, RET_OK, { data: [] })
            }

        }


        /**
               * showdoc
               * @catalog 订单管理
               * @title 退款
               * @description 退款
               * @method get
               * @url https://xxx:9001/refund_to_buyer
               * @param token 必选 string 用户凭证token  
               * @param attend_id 必选 string 订单ID  
                * @param refund_money 必选 number 退款金额
               * @return {"errcode":0,"errmsg":"ok"}
               */

        async  refund_to_buyer(req, res, next) {
            let { token, attend_id, refund_money } = req.query;
            refund_money = Number(refund_money)
            await redis.hdel(WITHDRAW_LIST, token)

            if (await redis.hget(WITHDRAW_LIST, token)) {
                http.send(res, TOKEN_TIMEOUT);
                return;
            }
            let rdata = {};
            rdata[token] = 1
            await redis.hmset(WITHDRAW_LIST, rdata)

            if (refund_money <= 0) {
                await redis.hdel(WITHDRAW_LIST, token)
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let user = await TOKEN.getUserInfo(token);
            if (user == null) {
                await redis.hdel(WITHDRAW_LIST, token)

                http.send(res, TOKEN_TIMEOUT);
                return;
            }
            let active_record = await db.get_active_record_by_id(attend_id);

            if (!active_record || active_record.refund_state != 1 || active_record.userid == user.userid) {

                await redis.hdel(WITHDRAW_LIST, token)

                http.send(res, INVALID_PARAMETER);
                return;
            }
            let remain_money = active_record.attend_cost - active_record.refund_num

            if (refund_money > remain_money) {
                await redis.hdel(WITHDRAW_LIST, token)

                http.send(res, INVALID_PARAMETER);
                return;
            }
            if (user.money < refund_money) {
                await redis.hdel(WITHDRAW_LIST, token)

                http.send(res, MONEY_NO_ENOUGH);
                return;
            }
            var order_id = 'RF' + Date.now() + attend_id

            if (active_record.pay_type == 0) {
                var suc = await db.dec_user_money(user.userid, refund_money, "refund", `接龙退款：${attend_id}`, order_id, attend_id)
                var suc = await db.add_user_money(active_record.userid, refund_money, "refund", `接龙退款：${attend_id}`, order_id, attend_id)
                var suc = await db.update_active_record_refund(attend_id, refund_money)

            } else if (active_record.pay_type == 1) {

                var pay_data = await db.get_pay_data_by_attendid(attend_id)
                if (pay_data.wechat_ord) {
                    var AppID = 'wx8b8459c0c44cb46d'
                    var AppSecret = 'YBOGnUs6ZuqftOxGNCYOjdeiRGdiGepv'
                    var mch_id = '1508213971'
                    var time = Date.now()

                    var data = {
                        appid: AppID,//应用ID	
                        mch_id: mch_id,//商户号
                        nonce_str: '' + time,//随机字符串
                        out_trade_no: pay_data.ord_id,//商户订单号	
                        transaction_id: pay_data.wechat_ord,//商户退款单号
                        out_refund_no: order_id,//商户退款单号
                        total_fee: parseInt((pay_data.cost + pay_data.fee) * 100),//订单金额
                        refund_fee: parseInt(refund_money * 100),//退款金额
                        refund_desc: "接龙退款",//退款原因
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

                    let result = await http.postXML_TX_Sync("https://api.mch.weixin.qq.com/secapi/pay/refund", data)
                    if (result.data && result.data.result_code == 'SUCCESS') {
                        await db.dec_user_money(user.userid, refund_money, 'refund', result.data.refund_id, order_id, attend_id)
                        var suc = await db.update_active_record_refund(attend_id, refund_money)
                    }
                } else {
                    var suc = await db.dec_user_money(user.userid, refund_money, "refund", `接龙退款：${attend_id}`, order_id, attend_id)
                    var suc = await db.add_user_money(user.userid, refund_money, "refund", `接龙退款：${attend_id}`, order_id, attend_id)
                    var suc = await db.update_active_record_refund(attend_id, refund_money)

                }
            }
            await redis.hdel(WITHDRAW_LIST, token)
            http.send(res, RET_OK, { data: { order_id, refund_money } })
        }



        async  get_wechat_order(req, res, next) {
            let { token, attend_id } = req.query;


            let result = {}
            var pay_data = await db.get_pay_data_by_attendid(attend_id)
            if (pay_data.wechat_ord) {
                var AppID = 'wx8b8459c0c44cb46d'
                var AppSecret = 'YBOGnUs6ZuqftOxGNCYOjdeiRGdiGepv'
                var mch_id = '1508213971'
                var time = Date.now()

                var data = {
                    appid: AppID,//应用ID	
                    mch_id: mch_id,//商户号
                    nonce_str: '' + time,//随机字符串
                    out_trade_no: pay_data.ord_id,//商户订单号	
                    transaction_id: pay_data.wechat_ord,//商户退款单号
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

                result = await http.postXML_TX_Sync("https://api.mch.weixin.qq.com/pay/orderquery", data)
                if (result.data && result.data.result_code == 'SUCCESS') {
                    console.log(result.data)
                }
            }
            http.send(res, RET_OK)
        }



        // async  get_public_key(req, res, next) {

        //         var AppID = 'wx8b8459c0c44cb46d'
        //         var AppSecret = 'YBOGnUs6ZuqftOxGNCYOjdeiRGdiGepv'
        //         var mch_id = '1508213971'
        //         var time = Date.now()

        //         var data = {
        //             mch_id: mch_id,
        //             nonce_str: '' + time,
        //             sign_type: 'MD5',
        //         }
        //         data = objKeySort(data);
        //         var signStr = "";
        //         var eq = "";
        //         for (var k in data) {
        //             signStr = signStr + eq + k + '=' + data[k];
        //             eq = '&'
        //         }
        //         signStr += `&key=${AppSecret}`
        //         var sign = crypto.md5(signStr).toUpperCase();
        //         data.sign = sign

        //         result = await http.postXML_TX_Sync("https://fraud.mch.weixin.qq.com/risk/getpublickey", data)
        //         if (result.data && result.data.result_code == 'SUCCESS') {
        //             console.log(result.data)
        //         }
        //     http.send(res, RET_OK)
        // }




        /**
          * showdoc
          * @catalog 订单管理
          * @title 查看玩家提现记录
          * @description 查看玩家提现记录
          * @method get
          * @url https://xxx:9001/get_user_withdraw_records
          * @param token 必选 string 用户凭证token  
           * @param page 可选 number 页数，每页返回10条数据，不传返回第一页
          * @return {"data":[{"withdraw_id":"TX156265837373640052945","userid":40052945,"money":1,"create_time":1562658373736,"state":3,"mark":null,"wechat_ord":"1508213971201907091587762552","audit_time":1562658375812,"platform":1,"real_name":"陈杨彬","auto_deal_time":1,"mch_id":null}],"errcode":0,"errmsg":"ok"}
          * @return_param withdraw_id string 平台提现订单号
          * @return_param userid int 玩家ID
          * @return_param money int 提现金额
          * @return_param create_time string 申请提现时间
          * @return_param state int 状态 提现状态  1 未审核 2  拒绝 3已审核
          * @return_param mark string 备注
          * @return_param wechat_ord string 提现成功的微信订单号
          * @return_param audit_time int 提现审核时间
          * @return_param real_name string 提现名称
          */

        async  get_user_withdraw_records(req, res, next) {
            let { token, page, note } = req.query;


            let user = req.user;


            if (page == null) {
                page = 1;
            }
            var start = null;
            let rows = 10;
            if (page != null) {
                page = Number(page) - 1;
                start = page * rows;
            }

            start < 0 ? start = null : null;

            var suc = await db.get_user_withdraw_records(user.userid, start, rows, note)
            if (suc) {
                http.send(res, RET_OK, { data: suc })

            } else {
                http.send(res, RET_OK, { data: [] })
            }

        }








        ///////////////////////////
    }

    return httpController;
};


