
const db = require('../../../utils/dbsync_hall');
const dbRedis = require('../../../utils/db_redis_hall');
const crypto = require('../../../utils/crypto');
const http = require('../../../utils/http');
const configs = require('../../../configs.js');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
// const client_service = require("../../client_service");

const TOKEN = require('../utils/token');

const ERRCODE = require('../../../utils/errcode.js');
//redis表名
const { TOKENS_USER, USERS_TOKEN } = dbRedis;
const { RET_OK } = ERRCODE;
//大厅服错误码
const { TOKEN_TIMEOUT, NO_USER, MONEY_NO_ENOUGH, OPERATE_FAILED, STOCK_NO_ENOUGH, ORDER_HAS_HANDLE } = ERRCODE.HALL_ERRS;
//系统错误码
const { INVALID_PARAMETER, INTER_NETWORK_ERROR } = ERRCODE.SYS_ERRS;

/**
 * 
 *  发送通知
 */

// import db from '../utils/dbsync_hall'
// await db.update_user_info(account, name, headimgurl, sex)
module.exports = app => {
    const controllerUtils = require('../utils')(app)
    class httpController extends controllerUtils {
        constructor() {
            super()

            this.noticeType = {
                1: { id: 'asRgm_e5ZS3v6oyurT8zq-z2loHFUPbXinuztoXfZiM', name: '取货通知' },
                2: { id: 'QBMlHxW44s66Bw_D3OkeHFsiSlLgu9KkPASAysdCN78', name: '留言通知' },
            }

        }

        /**
       * showdoc
       * @catalog 通知
       * @title 发送通知
       * @description 发送通知
       * @method get
       * @url https://xxx:9001/send_template
       * @param token 必选 string 用户凭证token
       * @param active_id 必选 string 接龙id
       * @param user_list 必选 string 用户ID数组,格式：[132456,456789,123465]
       * @param type 必选 int 1为取货通知，2为留言通知
       * @param page 可选 string 点击模板卡片后的跳转页面，仅限本小程序内的页面
       * @param keywordList 必选 array type:1=>商家名、取货时间、温馨提示,type:2=>咨询内容、咨询人、咨询时间,格式：[{value:'商家名'},{value:'取货时间'},{value:'温馨提示'}]
       * @return {"errcode": 0,"errmsg": "ok"}
       * @return_param data object 支付需要的参数
       */
        async  send_template(req, res) {
            let { token, active_id, user_list, type, page, keywordList } = req.query;

            if (!this.noticeType[type]) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let user = req.user;
            let { userid, } = user;

            try {
                user_list = JSON.parse(user_list)
            } catch (err) {
            }
            try {
                keywordList = JSON.parse(keywordList)
            } catch (err) {
            }

            if (!user_list || user_list.length <= 0 || !keywordList || keywordList.length <= 0) {
                http.send(res, INVALID_PARAMETER);
                return;
            }


            let active = await db.get_active_by_id(active_id)
            if (!active) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            if (active.originator_id != userid) {
                http.send(res, NO_PERMISSION);
                return;
            }

            let noticeUser = await db.get_active_notice_user({ active_id });
            let userObjList = {};
            if (noticeUser && noticeUser.length > 0) {
                noticeUser.forEach(e => {
                    let { userid, form_id } = e;
                    if (form_id) {
                        userObjList[userid] = true;
                    }
                })
            }

            user_list.forEach(async e => {
                if (userObjList[e]) {
                    this.send_min_template({
                        userid: e,
                        noticeType: type,
                        page,
                        keywordList: keywordList,
                        emphasis_keyword: "keyword1.DATA"
                    })
                }
            })

            http.send(res, 0, "ok");

        }


        /**
        * @title 通知
        * @description 通知
        * @method service
        * @param userid 必选 用户id
        * @param noticeType 必选 string 通知类型，1：取货通知，2：留言通知
        * @param page 可选 string 点击模板卡片后的跳转页面，仅限本小程序内的页面。支持带参数,（示例index?foo=bar）。该字段不填则模板无跳转。
        * @param keywordList 必选 string 模板内容，数据结构[{value:'sdf'}]
        * @param emphasis_keyword 必选 string 发送给对应的用户id
        * @param send_to_active_user 可选 bool 是否将消息发送给活动发起人
        * @return true/false
        */
 

        async send_money_change_template({ userid, title, change_money, remain_money }) {
            let access_token = await this.get_mini_accesstoken();

            if (!userid || !title || change_money == null || remain_money == null) {
                return;
            }
            let user = await db.get_user_data_by_userid(userid)
            if (!user || !user.openid) {
                return;
            }

            let template_id = `Elutf_hqh1CSW1t8Rb7nyMw5t6dYEeUl2oFdAxEyavM`
            let touser = user.openid || user.wx_openid;
            let data = {
                first: {
                    value: title,
                    "color": "#173177"
                },
                date: {
                    value: moment().format('YYYY/MM/DD HH:mm:ss'),
                    "color": "#173177"
                },
                adCharge: {
                    value: change_money+'元',
                    "color": "#173177"
                },
                type: {
                    value: "",
                },
                cashBalance: {
                    value: remain_money+'元',
                    "color": "#173177"
                },
                remark: {
                    value: "点击进入查看更多详情",
                    "color": "#173177"
                },
            }

            let op = {
                "touser": touser,
                "mp_template_msg": {
                    "appid": "wx1cf05273c7fe4e99",
                    "template_id": template_id,
                    "url": "http://www.csxtech.com.cn/mobile_web/",
                    "miniprogram": {
                        "appid": "wx8b8459c0c44cb46d",
                        "pagepath": "pages/index/index"
                    },
                    "data": data
                }
            }
            let ret = await http.postMENU(`https://api.weixin.qq.com/cgi-bin/message/wxopen/template/uniform_send?access_token=${access_token}`, op)
            console.log(`发送通知`, ret)
            return ret;
        }

     async send_min_template({ userid, title, change_money, remain_money }) {
            let access_token = await this.get_mini_accesstoken();

            if (!userid || !title || change_money == null || remain_money == null) {
                return;
            }
            let user = await db.get_user_data_by_userid(userid)
            if (!user || !user.openid) {
                return;
            }

            let template_id = `Elutf_hqh1CSW1t8Rb7nyMw5t6dYEeUl2oFdAxEyavM`
            let touser = user.openid || user.wx_openid;
            let data = {
                first: {
                    value: title,
                    "color": "#173177"
                },
                date: {
                    value: moment().format('YYYY/MM/DD HH:mm:ss'),
                    "color": "#173177"
                },
                adCharge: {
                    value: change_money+'元',
                    "color": "#173177"
                },
                type: {
                    value: "",
                },
                cashBalance: {
                    value: remain_money+'元',
                    "color": "#173177"
                },
                remark: {
                    value: "点击进入查看更多详情",
                    "color": "#173177"
                },
            }

            let op = {
                "touser": touser,
                "mp_template_msg": {
                    "appid": "wx1cf05273c7fe4e99",
                    "template_id": template_id,
                    "url": "http://www.csxtech.com.cn/mobile_web/",
                    "miniprogram": {
                        "appid": "wx8b8459c0c44cb46d",
                        "pagepath": "pages/index/index"
                    },
                    "data": data
                }
            }
            let ret = await http.postMENU(`https://api.weixin.qq.com/cgi-bin/message/wxopen/template/uniform_send?access_token=${access_token}`, op)
            console.log(`发送通知`, ret)
            return ret;
        }
        

          async send_sale_template({ userid, attend_id }) {
            let access_token = await this.get_mini_accesstoken();

            if (!userid || !title || change_money == null || remain_money == null) {
                return;
            }
            let user = await db.get_user_data_by_userid(userid)
            if (!user || !user.openid) {
                return;
            }
            let record_info = await db.get_active_record_detail_by_id(attend_id)
            let good_name=''
            let sep=''
            if(record_info.good_list){
                record_info.good_list.forEach(e=>{
                    good_name = good_name +sep+e.name+e.size+"*"+e.num
                })
            }
            let template_id = `KlXsUWcfVFVCoA7nCEZd2c4h6EMCRC3slJ0W545_TSQ`
            let touser = user.openid || user.wx_openid;
            let data = {
                first: {
                    value: title,
                    "color": "#173177"
                },
                keyword1: {
                    value: moment().format('YYYY/MM/DD HH:mm:ss'),
                    "color": "#173177"
                },
                keyword2: {
                    value: change_money+'元',
                    "color": "#173177"
                },
                remark: {
                    value: "点击进入查看更多详情",
                    "color": "#173177"
                },
            }

            let op = {
                "touser": touser,
                "mp_template_msg": {
                    "appid": "wx1cf05273c7fe4e99",
                    "template_id": template_id,
                    "url": "http://www.csxtech.com.cn/mobile_web/",
                    "miniprogram": {
                        "appid": "wx8b8459c0c44cb46d",
                        "pagepath": "pages/index/index"
                    },
                    "data": data
                }
            }
            let ret = await http.postMENU(`https://api.weixin.qq.com/cgi-bin/message/wxopen/template/uniform_send?access_token=${access_token}`, op)
            console.log(`发送通知`, ret)
            return ret;
        }

        async  send_template_test(req, res) {


            await this.send_sale_template({
                userid: 40052945,
                attend_id: 50,
            })

            http.send(res, RET_OK)

        }





    }

    return httpController;
};

