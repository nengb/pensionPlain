
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
 *  活动用户留言消息模块
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
        * @catalog 活动留言管理
        * @title 获取活动留言信息列表
        * @description 获取活动留言信息列表接口
        * @method get
        * @url https://xxx:9001/get_leave_msg_list
        * @param token 必选 string 用户凭证token  
        * @param active_id 必选 number 活动id
        * @param page 可选 number 页数，每页返回20条数据，不传返回第一页
        * @return {"data":[{"name":"🇳 🇪 🇳 🇬","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKR2CX866DCJ90TXtmaZWdHu3oBzvib2zu03IFvQjebXfK0sicGW53GQd85Cz97aKic6Q4VzogHMZlsA/132","leave_msg_id":1,"active_id":19,"userid":17059767,"leave_msg":"sdsfsdf","msg_type":"0","create_time":null,"thumbup_num":2,"reply_leave_msg":[{"reply_name":"🇳 🇪 🇳 🇬","reply_headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKR2CX866DCJ90TXtmaZWdHu3oBzvib2zu03IFvQjebXfK0sicGW53GQd85Cz97aKic6Q4VzogHMZlsA/132","reply_id":1,"userid":17059767,"reply_content":"sdsfasdfasdfa","leave_msg_id":1,"create_time":null}]},{"name":"🇳 🇪 🇳 🇬","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKR2CX866DCJ90TXtmaZWdHu3oBzvib2zu03IFvQjebXfK0sicGW53GQd85Cz97aKic6Q4VzogHMZlsA/132","leave_msg_id":2,"active_id":19,"userid":17059767,"leave_msg":"测试","msg_type":"0","create_time":1557900525238,"thumbup_num":2,"reply_leave_msg":[]}],"errcode":0,"errmsg":"ok"}
        * @return_param leave_msg_id number 留言id
        * @return_param leave_msg string 留言信息
        * @return_param msg_type number 留言类型，0：公开，1：私信
        * @return_param create_time number 留言创建时间
        * @return_param thumbup_num number 留言点赞数量
        * @return_param reply_leave_msg array 留言回复
        * @return_param reply_leave_msg/reply_content array 留言回复内容
        * @remark 这里是备注信息
        * @number 1
        */
        async get_leave_msg_list(req, res) {
            let { token, active_id, page } = req.query;
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

            let get_leave_msg_list = await db.get_leave_msg_list({ userid, active_id, start, rows });
            if (!get_leave_msg_list) {
                get_leave_msg_list = []
            }


            http.send(res, RET_OK, { data: get_leave_msg_list });

        }



        /**
        * showdoc
        * @catalog 活动留言管理
        * @title 添加留言列表
        * @description 添加留言列表接口
        * @method get
        * @url https://xxx:9001/add_leave_msg
        * @param token 必选 string 用户凭证token  
        * @param active_id 必选 number 活动id
        * @param leave_msg 必选 string 留言内容
        * @param msg_type 必选 number 留言类型，0：公开，1：私信
        * @return {"data":true,"errcode":0,"errmsg":"ok"}
        * @remark 这里是备注信息
        * @number 1
        */
        async add_leave_msg(req, res) {
            let { token, active_id, leave_msg, msg_type } = req.query;

            let user = req.user;


            let { userid, } = user;

            //添加我的消息
            let active = await db.get_active_by_id(active_id);
            if (!active || leave_msg == null || (leave_msg && leave_msg.length == 0) || !/^([0-1])$/gi.test(msg_type)) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let add_leave_msg = await db.add_leave_msg({ userid, active_id, leave_msg, msg_type })

            let { page_message } = app.http_controllers;
            page_message.add_message({
                userid: userid,
                type: 0,
                active_id,
                content: leave_msg,
                to_userid: userid,
                send_to_active_user: true,

            })



            http.send(res, RET_OK, { data: add_leave_msg });

        }

        /**
        * showdoc
        * @catalog 活动留言管理
        * @title 给留言点赞
        * @description 给留言点赞接口
        * @method get
        * @url https://xxx:9001/thumbup_leavemsg
        * @param token 必选 string 用户凭证token  
        * @param leave_msg_id 必选 number 留言id
        * @param state 必选 number 点赞状态：0：取消点赞，1：点赞
        * @return {"data":true,"errcode":0,"errmsg":"ok"}
        * @remark 这里是备注信息
        * @number 1
        */
        async thumbup_leavemsg(req, res) {
            let { token, leave_msg_id, state } = req.query;

            if (!/^([0-1])$/gi.test(state)) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let user = req.user;



            let { userid, } = user;

            //添加我的消息
            let leave_msg = await db.get_leave_msg_by_id({ leave_msg_id });
            if (!leave_msg) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            let { active_id } = leave_msg;

            let thumbup_leavemsg = await db.thumbup_leavemsg({ leave_msg_id, userid, active_id, state });




            http.send(res, RET_OK, { data: thumbup_leavemsg });

        }


        /**
        * showdoc
        * @catalog 活动留言管理
        * @title 回复留言
        * @description 回复留言接口
        * @method get
        * @url https://xxx:9001/reply_leave_msg
        * @param token 必选 string 用户凭证token  
        * @param leave_msg_id 必选 number 留言id
        * @param content 必选 string 回复内容
        * @return {"data":true,"errcode":0,"errmsg":"ok"}
        * @remark 这里是备注信息
        * @number 1
        */
       async reply_leave_msg(req, res) {
        let { token, leave_msg_id, content } = req.query;


        if (content == null) {
            http.send(res, INVALID_PARAMETER);
            return;
        }

        let user = await TOKEN.getUserInfo(token);
        if (user == null) {
            http.send(res, TOKEN_TIMEOUT);
            return;
        }

        let { userid, } = user;

        //添加我的消息
        let leave_msg = await db.get_leave_msg_by_id({ leave_msg_id });
        if (!leave_msg) {
            http.send(res, INVALID_PARAMETER);
            return;
        }
        let { active_id } = leave_msg;

        let active = await db.get_active_by_id(active_id)
        if (!active) {
            http.send(res, INVALID_PARAMETER);
            return;
        }
        if (active.originator_id != userid) {
            http.send(res, NO_PERMISSION);
            return;
        }


        let reply_leave_msg = await db.reply_leave_msg({ userid, leave_msg_id, content });




        http.send(res, RET_OK, { data: reply_leave_msg });

    }






    }

    return httpController;
};
