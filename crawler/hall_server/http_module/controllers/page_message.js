
const db = require('../../../utils/dbsync_hall');
const dbRedis = require('../../../utils/db_redis_hall');
const crypto = require('../../../utils/crypto');
const http = require('../../../utils/http');
const configs = require('../../../configs.js');
const config = configs.hall_server();

const path = require('path');
const fs = require('fs');
const TOKEN = require('../utils/token');

const ERRCODE = require('../../../utils/errcode.js');
//redis表名
const { TOKENS_USER, USERS_TOKEN } = dbRedis;
const { RET_OK } = ERRCODE;
//大厅服错误码
const { TOKEN_TIMEOUT, NO_USER, OPERATE_FAILED } = ERRCODE.HALL_ERRS;
//系统错误码
const { INVALID_PARAMETER, INTER_NETWORK_ERROR } = ERRCODE.SYS_ERRS;



/**
 * 
 *  用户消息管理模块
 */

// import db from '../utils/dbsync_hall'
// await db.update_user_info(account, name, headimgurl, sex)
module.exports = app => {
    const controllerUtils = require('../utils')(app)
    class httpController extends controllerUtils {
        constructor() {
            super()

        }

        /**
        * showdoc
        * @catalog 消息管理
        * @title 获取我的消息列表
        * @description 获取我的消息列表接口
        * @method get
        * @url https://xxx:9001/get_message_list
        * @param token 必选 string 用户凭证token  
        * @param page 可选 number 页数，每页返回20条数据，不传返回第一页
        * @return {"data":[{"good_class_id":1,"userid":17059767,"class_name":"sdv","create_time":null,"level":1},{"good_class_id":2,"userid":17059767,"class_name":"bbb","create_time":null,"level":2},{"good_class_id":3,"userid":17059767,"class_name":"gg","create_time":null,"level":3},{"good_class_id":4,"userid":17059767,"class_name":"test","create_time":null,"level":4},{"good_class_id":5,"userid":17059767,"class_name":"bebeb","create_time":1556519835292,"level":5}],"errcode":0,"errmsg":"ok"}
        * @return_param class_name string 分类名称
        * @return_param level number 排序
        * @remark 这里是备注信息
        * @number 1
        */
        async get_message_list(req, res) {
            let { token, page } = req.query;
            let user = req.user;


            let { userid, } = user;

            if (page == null) {
                page = 1;
            }
            var start = null;
            let rows = 20;
            if (page != null) {
                page = Number(page) - 1;
                start = page * rows;
            }

            start < 0 ? start = null : null;

            let get_message_list = await db.get_message_list({ userid, start, rows });
            if (!get_message_list) {
                get_message_list = []
            }

            get_message_list.map(e => {
                try {
                    e.name = crypto.fromBase64(e.name);
                } catch (error) {
                }
                try {
                    e.active_user_name = crypto.fromBase64(e.active_user_name);
                } catch (error) {
                }
                switch (Number(e.type)) {
                    case 0: e.msg_info = e.content; break;
                    case 1: e.msg_info = `接龙NO.${e.active_index}, 备注：${e.content}`; break;
                    case 2: e.msg_info = `接龙NO.${e.active_index}, 申请取消接龙！`; break;
                    case 3: e.msg_info = `接龙NO.${e.active_index}, 已取消`; break;
                    case 4: e.msg_info = `接龙NO.${e.active_index}, 已退款：￥${Number(e.content).toFixed(2)}`; break;
                    case 5: e.msg_info = `接龙NO.${e.active_index}, 管理员备注：${e.content}`; break;
                }

                return e;
            })
            http.send(res, RET_OK, { data: get_message_list });

        }

        /**
        * showdoc
        * @catalog 消息管理
        * @title 阅读我的消息
        * @description 阅读我的消息接口
        * @method get
        * @url https://xxx:9001/read_message
        * @param token 必选 string 用户凭证token  
        * @param msg_id 可选 number 消息id
        * @return {"data":true,"errcode":0,"errmsg":"ok"}
        * @remark 这里是备注信息
        * @number 1
        */
        async read_message(req, res) {
            let { token, msg_id } = req.query;
            if (msg_id == null) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let user = req.user;


            let { userid, } = user;

            let read_message = await db.read_message({ userid, msg_id });

            http.send(res, RET_OK, { data: read_message });

        }


        /**
        * @title 添加我的消息列表
        * @description 添加我的消息列表接口
        * @method service
        * @param userid 必选 string 用户id
        * @param type 必选 string 消息类型，0：留言消息，1：凭证备注，2：凭证申请取消，3：凭证已取消，4：凭证已退款,5:凭证管理员备注
        * @param active_id 必选 string 活动id 
        * @param attend_id 可选 string 用户凭证凭证id (type>=1的时候传)
        * @param content 必选 string 留言消息内容/凭证备注内容/退款金额
        * @param to_userid 必选 string 发送给对应的用户id
        * @param send_to_active_user 可选 bool 是否将消息发送给活动发起人
        * @return true/false
        */
        async add_message({ userid, type, active_id, attend_id, content, to_userid ,send_to_active_user}) {
            if (userid == null || to_userid == null) {
                return false;
            }
            if (!/^([0-4])$/gi.test(type)) {
                return false;
            }
            let active_index = null;
            if (type >= 1) {
                let active_record = await db.get_active_record_by_id(attend_id);
                if (!active_record) {
                    return false;
                }
                active_index = active_record.active_index;
            }
            if (type == 4) {
                if (!content) {
                    return false;
                } else if ((content.length == 0 || isNaN(Number(content)))) {
                    return false;
                }
            }

            let active = await db.get_active_by_id(active_id);
            if (!active) {
                return false;
            }
            let { originator_id } = active;

            await db.add_message({ userid, content, active_id, active_title: active.title, type, active_index, to_userid })
          
            if(send_to_active_user && originator_id != to_userid){
                to_userid = originator_id;
                await db.add_message({ userid, content, active_id, active_title: active.title, type, active_index, to_userid })
                
            }

            return true;


        }






    }

    return httpController;
};
