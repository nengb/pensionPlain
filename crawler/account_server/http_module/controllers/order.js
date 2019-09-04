
const db = require('../../../utils/dbsync_account');
const crypto = require('../../../utils/crypto');
const http = require('../../../utils/http');
const configs = require('../../../configs.js');
const path = require('path');
const fs = require('fs');
const ERRCODE = require('../../../utils/errcode.js');
//redis表名
const { RET_OK } = ERRCODE;
//大厅服错误码
const { TOKEN_TIMEOUT, NO_USER, MONEY_NO_ENOUGH, OPERATE_FAILED, STOCK_NO_ENOUGH, ORDER_HAS_HANDLE } = ERRCODE.HALL_ERRS;
//系统错误码
const { INVALID_PARAMETER, INTER_NETWORK_ERROR } = ERRCODE.SYS_ERRS;

/**
 * 
 *  晒单模块
 */

// import db from '../utils/dbsync_hall'
// await db.update_user_info(account, name, headimgurl, sex)
module.exports = app => {
    const controllerUtils = require('../utils')(app)
    class httpController extends controllerUtils {
        constructor() {
            super()
        }
        async  get_order_list(req, res) {
            var start = req.query.start;
            var rows = req.query.rows;
            var user_id = req.query.user_id;
            var ord_id = req.query.ord_id;
            var good_id = req.query.good_id;
            var post_no = req.query.post_no;
            var start_time = req.query.start_time;
            var end_time = req.query.end_time;
            var state = req.query.state;
            var agent = req.query.agent;
            var admin = req.query.admin;
            if (start == null) {
                http.send(res, -1, "failed");
                return;
            }
            if (rows == null) {
                http.send(res, -1, "failed");
                return;
            }
            var suc = await db.get_order(start, rows, user_id, ord_id, start_time, end_time, state, good_id,post_no,agent,admin);
            // db.get_user_ranking(start,rows,function(suc){
            if (suc !== null) {
                http.send(res, 0, "ok", suc);
            }
            else {
                http.send(res, 1, "failed");
            }
            // });
        }
        async  del_order(req, res) {
            // console.log(req.query)
            var ord_id = req.query.ord_id;
            var msg = req.query.msg;
            var check_id=ord_id.substring(5);
            
            var suc = await db.delete_order(ord_id);
        
            if (!msg) {
                msg = `发货订单<${ord_id}>异常,后台进行取消，请检查您发货地址信息`
        
            } else {
                msg = `发货订单<${ord_id}>异常,原因:` + msg
        
            }
            var title = `订单异常`
        
        
            if (suc.change) {
                // var ret = await db.recover(suc.user_id, 3, msg, null, title);
                http.send(res, 0, "ok");
            }
            else {
                http.send(res, 1, "failed");
            }
        }
        async  get_goods_by_order(req, res) {
            var start = req.query.start;
            var rows = req.query.rows;
            var order_id = req.query.order_id;
        
            var suc = await db.get_goods_by_order(order_id);
        
            if (suc !== null) {
                http.send(res, RET_OK, suc);
            }
            else {
                http.send(res, RET_OK, {});
            }
        }

        async  add_post(req, res) {
            var orderid = req.query.order_id;
            var userid = req.query.user_id;
            var postType = req.query.post_type;
            var postNo = req.query.post_no;
            var good = req.query.good;
            var order_list = req.query.order_list;
            var mark = req.query.mark;
            var title = '发货通知'
            var msg = '发货通知'
            if (order_list) {
                try {
                    order_list = JSON.parse(order_list)
                } catch (err) {
                    http.send(res, 0, "OK");
                    return;
                }
                for (let i in order_list) {
        
                    var order = await db.get_order_by_id(order_list[i])
                if(!order||(order&&order.info.state==4)){
                http.send(res, 1, "failed");
        return;
        }
                    var suc = await db.add_post_all(order_list[i], postType, postNo, mark, good);
                    if (suc) {
                        var ret = await db.recover(order.info.user_id, 2, msg, null, title, order_list[i]);
                        if (ret) {
                            setTimeout(async () => {
                                var check_post = await db.check_post_no(postNo)
                                if (check_post) {
                                    var option = {
                                        "mobile": order.info.tel,
                                        "sign_id": '6523',
                                        "temp_id": 162817,
                                        "temp_para": {
                                            "order": order_list[i],
                                            "express": postType,
                                            "tracking": postNo,
                                        }
                                    }
                                    http.post_jiguang2(`https://api.sms.jpush.cn/v1/messages`, option, function (err, data) {
                                        console.log('发货通知成功')
        
                                    }, true)
                                }
        
                            }, 0)
                            let option = {
                                userid: userid,
                                order_id: order_list[i],
                                type: 1,
                            }
                            setTimeout(() => {
                                http.post12(`localhost`, 9003, '/sendUserHallNotice', option, function (err, data) { console.log('发货通知成功') })
                            }, 0)
                        }
        
                    }
        
                }
            } else {
                var order = await db.get_order_by_id(orderid)
            if(!order||(order&&order.info.state==4)){
                http.send(res, 1, "failed");
        return;
        }
                var suc = await db.add_post(orderid, postType, postNo, mark, good);
                if (suc) {
                    var ret = await db.recover(order.info.user_id, 2, msg, null, title, orderid);
                    if (ret) {
                        setTimeout(async () => {
                            var check_post = await db.check_post_no(postNo)
                            if (check_post) {
                                var option = {
                                    "mobile": order.info.tel,
                                    "sign_id": '6523',
                                    "temp_id": 162817,
                                    "temp_para": {
                                        "order": orderid,
                                        "express": postType,
                                        "tracking": postNo,
                                    }
                                }
                                http.post_jiguang2(`https://api.sms.jpush.cn/v1/messages`, option, function (err, data) {
                                    console.log('发货通知成功')
        
                                }, true)
                            }
        
                        }, 0)
                        let option = {
                            userid: userid,
                            order_id: orderid,
                            type: 1,
                        }
                        setTimeout(() => {
                            http.post12(`localhost`, 9003, '/sendUserHallNotice', option, function (err, data) { console.log('发货通知成功') })
                        }, 0)
                    }
        
                }
            }
        
        
            http.send(res, 0, "OK");
        
        }
        
        
        async  auto_post_all(req, res) {
            // var orderid = req.query.order_id;
            var username = req.query.username;
            var order_list = req.query.order_list;
        
            try {
                order_list = JSON.parse(order_list)
            } catch (err) {
                http.send(res, 0, "OK");
                return;
            }
            var name = null;
            var tel = null;
            var addr = null;
            var user_id = null;
            for (let i in order_list) {
                var order = await db.get_order_by_id(order_list[i])
            if(!order||(order&&order.info.state!=0)){
                http.send(res, 1, "failed");
        return;
        }
                if (i == 0) {
                    name = order.info.name
                    tel = order.info.tel
                    addr = order.info.addr
                    user_id = order.info.user_id
                } else {
                    if (name != order.info.name || tel != order.info.tel || addr != order.info.addr || user_id != order.info.user_id) {
                        http.send(res, 1, "fail.");
                        return;
                    }
                }
        
            }
        
            var partnerId = config.partnerId
            var partnerKey = config.partnerKey
            var net = config.net
            var kuaidicom = config.kuaidicom
            var send_name = config.send_name
            var send_mobile = config.send_mobile
            var send_tel = config.send_tel
            var send_printAddr = config.send_printAddr
            var post_type = '圆通'
            if (kuaidicom == 'zhongtong') {
                post_type = '中通'
            }
        
            if (username == 'FW') {
                partnerId = "嗨的电子";
                partnerKey = "Sto*510000";
                net = "广东广州番禺祈福分部";
                kuaidicom = "shentong";
                send_name = "嗨的电子";
                send_mobile = "";
                send_tel = "02084891275";
                send_printAddr = "广东省广州市番禺区沙头大平村";
                post_type = '申通'
            }
            var key = config.POST_KEY
            var data = {
                partnerId: partnerId,
                partnerKey: partnerKey,
                net: net,
                kuaidicom: kuaidicom,
                kuaidinum: "",
                orderId: order.info.ord_id,
                recMan: {
                    name: order.info.name,
                    mobile: order.info.tel,
                    tel: "",
                    zipCode: "",
                    province: "",
                    city: "",
                    district: "",
                    addr: "",
                    printAddr: order.info.addr,
                    company: ""
                },
                sendMan: {
                    name: send_name,
                    mobile: send_mobile,
                    tel: send_tel,
                    zipCode: "",
                    province: "",
                    city: "",
                    district: "",
                    addr: "",
                    printAddr: send_printAddr,
                    company: ""
                },
                cargo: "口红",
                count: "1",
                weight: "1",
                volumn: "",
                payType: "MONTHLY",
                expType: "标准快递",
                remark: "",
                valinsPay: "",
                collection: "",
                needChild: "0",
                needBack: "0",
                needTemplate: "1"
            }
            // console.log(data)
            var t = Date.now()
            var secret = config.secret
            var datastr = JSON.stringify(data)
            var str = datastr + t + key + secret;
            var sign = crypto.md5(str);
            var options = {
                method: "getElecOrder",
                key: key,
                param: datastr,
                sign: sign.toUpperCase(),
                t: t
            }
            http.get("api.kuaidi100.com", '80', "/eorderapi.do", options, async function (err, data) {
                if (data.status == 200) {
                    for (let i in order_list) {
        
                        var order = await db.get_order_by_id(order_list[i])
                        if (!order) {
                            http.send(res, 1, "fail.");
                            return;
                        }
                        // var suc = await db.add_post_all(order_list[i], postType, postNo, mark);
                        var suc = await db.add_post_all(order_list[i], post_type, data.data[0].kuaidinum, '无');
                        var post_url = await db.add_post_url(order_list[i], data.data[0].templateurl[0]);
                        
                        if (suc) {
                            var title = '发货通知'
                            var msg = '发货通知'
                            var aa = await db.recover(order.info.user_id, 2, msg, null, title, order_list[i]);
        
                            var option = {
                                userid: order.info.user_id,
                                order_id: order_list[i],
                                type: 1,
                            }
                            setTimeout(() => {
                                http.post12(`localhost`, 9003, '/sendUserHallNotice', option, function (err, data) { console.log('发货通知成功') })
                            }, 0)
                        }
                        else {
                            http.send(res, 1, "failed");
                        }
        
                    }
                    setTimeout(async () => {
                        var option = {
                            "mobile": order.info.tel,
                            "sign_id": '6523',
                            "temp_id": 162817,
                            "temp_para": {
                                "order": order_list[0],
                                "express": post_type,
                                "tracking": data.data[0].kuaidinum,
                            }
                        }
                        http.post_jiguang2(`https://api.sms.jpush.cn/v1/messages`, option, function (err, data) {
                            console.log('发货通知成功')
        
                        }, true)
        
                    }, 0)
        
                    http.send(res, 0, "ok");
        
                } else {
                    http.send(res, 1, "failed");
        
                }
        
            })
            
        }


        async  importPost(req, res) {
            var data = req.query.data;
            var mark = req.query.mark;
            let ret = []
            try {
                ret = JSON.parse(data)
            } catch (err) {
        
            }
            console.log(ret)
            var title = '发货通知'
            var msg = '发货通知'
            for (let i in ret) {
                var orderid = ret[i].订单编号;
                var userid = ret[i].用户ID;
                var postType = ret[i].快递公司;
                var postNo = ret[i].快递号;
                var mobile = ret[i].手机;
                
        
                if (orderid && postType && postNo) {
        
                    var suc = await db.add_post_all(ret[i].订单编号, postType, postNo, mark);
                    if (suc) {
                        var ret1 = await db.recover(userid, 2, msg, null, title, orderid);
                        if (ret1) {
                                    setTimeout(async () => {
                                            var check_post_no = await check_post_no(postNo)
                                if(check_post_no){
                                    var option = {
                                        "mobile": mobile,
                                        "sign_id": '6523',
                                        "temp_id": 162817,
                                        "temp_para": {
                                            "order": orderid,
                                            "express": postType,
                                            "tracking": postNo,
                                        }
                                    }
                                            http.post_jiguang2(`https://api.sms.jpush.cn/v1/messages`, option, function (err, data) { 
                                    console.log('发货通知成功')
        
                                },true)
                                }
                                }, 0)
        
        
                            // setTimeout(async () => {
                            // 	var userdata = await db.get_user_data_by_userid(userid)
                            // 	if (userdata.openid) {
                            // 		var op = {
                            // 			"touser": userdata.openid,
                            // 			"template_id": "1fmzoWQXQIMNF182EsRKog5xFVL0fK-0NXOKNUXOnEI",
                            // 			"url": "http://h5.wjwlddz.com/web_wjwl_kouhong",
                            // 			"data": {
                            // 				"first": {
                            // 					"value": `感谢你对闯关得口红的支持！订单号：${orderid},我们已经帮你发货配送。`,
                            // 					"color": "#173177"
                            // 				},
                            // 				"delivername": {
                            // 					"value": postType,
                            // 					"color": "#173177"
                            // 				},
                            // 				"ordername": {
                            // 					"value": postNo,
                            // 					"color": "#173177"
                            // 				},
                            // 				"remark": {
                            // 					"value": "如有任何疑问，请联系平台的微信客服kgsl88888888 。",
                            // 					"color": "#173177"
                            // 				}
                            // 			}
                            // 		}
                            // 		http.postMENU(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${MEMORY.ACCESSTOKEN.value}`, op, async function (err, data1) {
        
                            // 			console.log(data1)
        
                            // 		}, true)
                            // 	}
                            // }, 0)
                            let option = {
                                userid: userid,
                                order_id: orderid,
                                type: 1,
                            }
                            setTimeout(() => {
                                http.post12(`localhost`, 9003, '/sendUserHallNotice', option, function (err, data) { console.log('发货通知成功') })
                            }, 0)
                        }
                    }
                }
            }
                http.send(res, 0, "ok");
        }
        


        
        async  update_post_info(req, res) {
            var orderid = req.query.order_id;
            var name = req.query.name;
            var tel = req.query.tel;
            var addr = req.query.addr;
            var suc = await db.update_post_info(orderid, name,tel,addr);
            if (suc) {
                http.send(res, 0, "ok");
            }
            else {
                http.send(res, 1, "failed");
            }
        }
        

        async  update_post(req, res) {
            var orderid = req.query.order_id;
            var post_type = req.query.post_type;
            var postNo = req.query.post_no;
        
            var suc = await db.update_post(orderid, postNo,post_type);
        
            if (suc) {
                http.send(res, 0, "ok");
            }
            else {
                http.send(res, 1, "failed");
            }
        }
        
        async  get_post(req, res) {
        
            var orderid = req.query.order_id;
        
            var suc = await db.get_post(orderid);
        
            if (suc) {
                http.send(res, 0, "ok", suc);
            }
            else {
                http.send(res, 1, "failed", null);
            }
        }

        async  auto_post(req, res) {

            var orderid = req.query.order_id;
            var good = req.query.good;
            var userid = req.query.user_id;
            var username = req.query.username;
            var order = await db.get_order_by_id(orderid)
        if(!order||(order&&order.info.state==4)){
                http.send(res, 1, "failed");
        return;
        }
            var partnerId = config.partnerId
            var partnerKey = config.partnerKey
            var net = config.net
            var kuaidicom = config.kuaidicom
            var send_name = config.send_name
            var send_mobile = config.send_mobile
            var send_tel = config.send_tel
            var send_printAddr = config.send_printAddr
            var post_type='圆通'
            if(kuaidicom=='zhongtong'){
                post_type='中通'
            }
        
            if (username == 'FW') {
            partnerId="嗨的电子";
            partnerKey="Sto*510000";
            net="广东广州番禺祈福分部";
            kuaidicom="shentong";
            send_name="嗨的电子";
            send_mobile="";
            send_tel="02084891275";
            send_printAddr= "广东省广州市番禺区沙头大平村";
            post_type='申通'
            }
            var key = config.POST_KEY
            var data = {
                partnerId: partnerId,
                partnerKey: partnerKey,
                net: net,
                kuaidicom: kuaidicom,
                kuaidinum: "",
                orderId: order.info.ord_id,
                recMan: {
                    name: order.info.name,
                    mobile: order.info.tel,
                    tel: "",
                    zipCode: "",
                    province: "",
                    city: "",
                    district: "",
                    addr: "",
                    printAddr: order.info.addr,
                    company: ""
                },
                sendMan: {
                    name: send_name,
                    mobile: send_mobile,
                    tel: send_tel,
                    zipCode: "",
                    province: "",
                    city: "",	
                    district: "",
                    addr: "",
                    printAddr: send_printAddr,
                    company: ""
                },
                cargo: "口红",
                count: "1",
                weight: "1",
                volumn: "",
                payType: "MONTHLY",
                expType: "标准快递",
                remark: "",
                valinsPay: "",
                collection: "",
                needChild: "0",
                needBack: "0",
                needTemplate: "1"
            }
            // console.log(data)
            var t = Date.now()
            var secret = config.secret
             var datastr = JSON.stringify(data)
            var str = datastr + t + key + secret;
            var sign = crypto.md5(str);
            var options = {
                method: "getElecOrder",
                key: key,
                param: datastr,
                sign: sign.toUpperCase(),
                t: t
            }
            http.get("api.kuaidi100.com", '80', "/eorderapi.do", options, async function (err, data) {
                if (data.status == 200) {
                    console.log(data)
                    console.log(data.data[0].templateurl)
                    var mark = req.query.mark;
                    var title = '发货通知'
                    var msg = '发货通知'
        
                    var post_url = await db.add_post_url(orderid, data.data[0].templateurl[0]);
                    var addmsg = false
                    var suc = await db.add_post(orderid, post_type, data.data[0].kuaidinum, mark, good);
                    if (suc) {
                        var aa = await db.recover(order.info.user_id, 2, msg, null, title, orderid);
                        addmsg = true
                        setTimeout(async () => {
                                    var option = {
                                        "mobile": order.info.tel,
                                        "sign_id": '6523',
                                        "temp_id": 162817,
                                        "temp_para": {
                                            "order": order.ord_id,
                                            "express": post_type,
                                            "tracking": data.data[0].kuaidinum,
                                        }
                                    }
                                http.post_jiguang2(`https://api.sms.jpush.cn/v1/messages`, option, function (err, data) { 
                                    console.log('发货通知成功')
                                },true)
        
                                }, 0)
        
                    // 			setTimeout(async () => {
                    // 	var userdata = await db.get_user_data_by_userid(order.info.user_id)
                    // 	if (userdata.openid) {
        
                    // 		var op = {
                    // 			"touser": userdata.openid,
                    // 			"template_id": "1fmzoWQXQIMNF182EsRKog5xFVL0fK-0NXOKNUXOnEI",
                    // 			"url": "http://h5.wjwlddz.com/web_wjwl_kouhong",
                    // 			"data": {
                    // 				"first": {
                    // 					"value": `感谢你对闯关得口红的支持！订单号：${orderid},我们已经帮你发货配送。`,
                    // 					"color": "#173177"
                    // 				},
                    // 				"delivername": {
                    // 					"value": "圆通",
                    // 					"color": "#173177"
                    // 				},
                    // 				"ordername": {
                    // 					"value": data.data[0].kuaidinum,
                    // 					"color": "#173177"
                    // 				},
                    // 				"remark": {
                    // 					"value": "如有任何疑问，请联系平台的微信客服kgsl88888888 。",
                    // 					"color": "#173177"
                    // 				}
                    // 			}
                    // 		}
                    // 		http.postMENU(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${MEMORY.ACCESSTOKEN.value}`, op, async function (err, data1) {
                        
                    // 			console.log(data1)
        
                    // 		}, true)
                    // 	}
                    // }, 0)
                    }
                    else {
                        http.send(res, 1, "failed");
                    }
            let option = {
                userid: order.info.user_id,
                order_id:orderid,
                type:1,
            }
             setTimeout(() => {
                http.post12(`localhost`, 9003, '/sendUserHallNotice', option, function (err, data) { console.log('发货通知成功') })
                }, 0)
                    var tag = 0
            
                    http.send(res, 0, "OK");
                } else {
                    http.send(res, 1, data.message);
                }
            });
        }
        
        
        
        
      
        
        async  auto_post_test(req, res) {
            var name = req.query.name;
            var tel = req.query.tel;
            var addr = req.query.addr;
            var partnerId = config.partnerId
            var partnerKey = config.partnerKey
            var net = config.net
            var kuaidicom = config.kuaidicom
                var send_name = config.send_name
            var send_mobile = config.send_mobile
            // var send_name = `周周`
            // var send_mobile = `18027295213`
            var send_tel = config.send_tel
            var send_printAddr = config.send_printAddr
        
            var key = config.POST_KEY
            var data = {
                partnerId: partnerId,
                partnerKey: partnerKey,
                net: net,
                kuaidicom: kuaidicom,
                kuaidinum: "",
                orderId: tel+Date.now(),
                recMan: {
                    name: name,
                    mobile: tel,
                    tel: "",
                    zipCode: "",
                    province: "",
                    city: "",
                    district: "",
                    addr: "",
                    printAddr: addr,
                    company: ""
                },
                sendMan: {
                    name: send_name,
                    mobile: send_mobile,
                    tel: send_tel,
                    zipCode: "",
                    province: "",
                    city: "",
                    district: "",
                    addr: "",
                    printAddr: send_printAddr,
                    company: ""
                },
                cargo: "口红",
                count: "1",
                weight: "1",
                volumn: "",
                payType: "MONTHLY",
                expType: "标准快递",
                remark: "",
                valinsPay: "",
                collection: "",
                needChild: "0",
                needBack: "0",
                needTemplate: "1"
            }
            var t = Date.now()
            var secret = config.secret
            var datastr = JSON.stringify(data)
            var str = datastr + t + key + secret;
            var sign = crypto.md5(str);
            var options = {
                method: "getElecOrder",
                key: key,
                param: datastr,
                sign: sign.toUpperCase(),
                t: t
            }
            http.get("api.kuaidi100.com", '80', "/eorderapi.do", options, async function (err, data) {
                if (data.status == 200) {
                    console.log(data)
                    console.log(data.data[0].templateurl)
                    http.send(res, 0, "OK",data.data[0].templateurl);
                } else {
                    http.send(res, 1, data.message);
                }
            });
        }


        


        /////////////////////////////
    }

    return httpController;
};


