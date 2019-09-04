
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
const { TOKEN_TIMEOUT, NO_USER, OPERATE_FAILED, NO_PERMISSION } = ERRCODE.HALL_ERRS;
//系统错误码
const { INVALID_PARAMETER, INTER_NETWORK_ERROR } = ERRCODE.SYS_ERRS;



/**
 * 
 *  凭证管理模块
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
        * @catalog 凭证管理
        * @title 修改接龙凭证信息
        * @description 修改接龙凭证信息的接口
        * @method get
        * @url https://xxx:9001/update_active_record_info
        * @param token 必选 string 用户凭证token  
        * @param attend_id 必选 number 接龙id
        * @param comments 可选 string 凭证的用户备注
        * @param active_creator_comments 可选 string 接龙创建人对接龙的备注
        * @param logistics 可选 string 接龙信息
        * @return {"data":true,"errcode":0,"errmsg":"ok"}
        * @remark 这里是备注信息
        * @number 1
        */
        async update_active_record_info(req, res) {
            let { token, attend_id, comments, active_creator_comments, logistics } = req.query;
            if (attend_id == null) {
                http.send(res, INVALID_PARAMETER);
                return;
            }


            let user = req.user;


            let { userid, } = user;

            let activeRecord = await db.get_active_record_by_id(attend_id);
            if (!activeRecord) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            let { active_id } = activeRecord;
            let active = await db.get_active_by_id(active_id)
            if (!active) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            if (active.originator_id != userid && userid != activeRecord.userid) {
                http.send(res, NO_PERMISSION);
                return;
            }

            let { page_message } = app.http_controllers;

            if (comments != null) {
                //添加操作记录
                db.add_active_record_log({ userid, type: 1, content: comments, attend_id: attend_id })

                page_message.add_message({
                    userid: userid,
                    type: 1,
                    active_id,
                    content: comments,
                    to_userid: activeRecord.userid,
                    send_to_active_user: true,
                })


            }
            if (active_creator_comments != null) {
                if (active.originator_id != userid) {
                    http.send(res, NO_PERMISSION);
                    return;
                }

                page_message.add_message({
                    userid: userid,
                    type: 5,
                    active_id,
                    content: active_creator_comments,
                    to_userid: activeRecord.userid,
                    send_to_active_user: true,

                })
            }
            let update_active_record_info = await db.update_active_record_info({ userid, attend_id, comments, active_creator_comments, logistics });

            http.send(res, RET_OK, { data: update_active_record_info });

        }


        /**
        * showdoc
        * @catalog 凭证管理
        * @title 修改接龙凭证状态
        * @description 修改接龙凭证状态的接口
        * @method get
        * @url https://xxx:9001/update_active_record_state
        * @param token 必选 string 用户凭证token  
        * @param attend_id 必选 number 接龙id
        * @param state 必选 number 接龙状态，2：取消接龙，3：已完成接龙（收到货），4：申请取消
        * @return {"data":true,"errcode":0,"errmsg":"ok"}
        * @remark 这里是备注信息
        * @number 1
        */
        async update_active_record_state(req, res) {
            let { token, attend_id, state } = req.query;
            if (attend_id == null || state == null) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            if (!/^([2-4])$/gi.test(state)) {
                http.send(res, INVALID_PARAMETER);
                return;
            }


            let user = req.user;

            let { userid, } = user;

            let activeRecord = await db.get_active_record_by_id(attend_id);
            if (!activeRecord) {
                return false;
            }

            let { active_id } = activeRecord;
            let logType = {
                2: {
                    type: 6,
                },
                3: {
                    type: 7,
                },
                4: {
                    type: 8
                }
            }

            let active = await db.get_active_by_id(active_id)
            if (!active) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            if (active.originator_id != userid && userid != activeRecord.userid) {
                http.send(res, NO_PERMISSION);
                return;
            }


            let { page_message } = app.http_controllers;
            if (state == 2 || state == 3) {

                if (active.originator_id != userid) {
                    http.send(res, NO_PERMISSION);
                    return;
                }

                let logTypeData = logType[state];
                if (logTypeData) {
                    //添加操作记录
                    db.add_active_record_log({ userid: active.originator_id, type: logTypeData.type, attend_id: attend_id })
                }

                if (state == 2) {
                    page_message.add_message({
                        userid: active.originator_id,
                        type: 3,
                        active_id,
                        content: `已取消`,
                        to_userid: activeRecord.userid,
                        send_to_active_user: true,
                    })

                }
            } else {

                if (userid != activeRecord.userid) {
                    http.send(res, NO_PERMISSION);
                    return;
                }

                if (state == 4) {
                    page_message.add_message({
                        userid: activeRecord.userid,
                        type: 2,
                        active_id,
                        content: `申请取消接龙！`,
                        to_userid: activeRecord.userid,
                        send_to_active_user: true,
                    })

                }
            }

            let updateActiveRecordState = await db.updateActiveRecordState({ userid, attend_id, state });

            http.send(res, RET_OK, { data: updateActiveRecordState });

        }


        /**
        * showdoc
        * @catalog 凭证管理
        * @title 阅读我的所有凭证
        * @description 阅读我的所有凭证接口,会将用户所有凭证状态标记为已读
        * @method get
        * @url https://xxx:9001/read_user_all_active_records
        * @param token 必选 string 用户凭证token  
        * @return {"data":true,"errcode":0,"errmsg":"ok"}
        * @remark 这里是备注信息
        * @number 1
        */
        async read_user_all_active_records(req, res) {
            let { token } = req.query;


            let user = req.user;

            let { userid, } = user;

            let read_user_all_active_records = await db.read_user_all_active_records({ userid });

            http.send(res, RET_OK, { data: read_user_all_active_records });

        }



        /**
        * showdoc
        * @catalog 凭证管理
        * @title 获取用户单个凭证
        * @description 获取用户单个凭证接口
        * @method get
        * @url https://xxx:9001/get_active_record_by_id
        * @param token 必选 string 用户凭证token  
        * @param attend_id 必选 number 凭证id
        * @return {"data":{"attend_id":80,"userid":17059767,"active_id":42,"time":1557911478960,"comments":"","reward_money":0,"active_content":"active_content","attend_cost":0.5,"state":1,"active_index":null,"phone":null,"real_name":null,"addr":null,"order_id":"BK155791147896017059767","logistics":"","active_creator_comments":null,"read_state":1,"payment_state":1,"refund_num":0,"refund_state":0},"errcode":0,"errmsg":"ok"}
        * @remark 这里是备注信息
        * @number 1
        */
        async get_active_record_by_id(req, res) {
            let { token, attend_id } = req.query;

            let user = req.user;


            let { userid, } = user;
            let activeRecord = await db.get_active_record_by_id(attend_id);
            if (!activeRecord) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            http.send(res, RET_OK, { data: activeRecord });

        }

        /**
        * showdoc
        * @catalog 凭证管理
        * @title 获取用户单个凭证的操作记录
        * @description 获取用户单个凭证的操作记录接口
        * @method get
        * @url https://xxx:9001/get_active_record_log
        * @param token 必选 string 用户凭证token  
        * @param attend_id 必选 number 凭证id
        * @return {"data":[{"record_log_id":6,"log_content":"【 取消接龙 】 后台取消订单","create_time":1558073581566,"userid":17059767,"attend_id":10,"name":"🇳 🇪 🇳 🇬"},{"record_log_id":5,"log_content":"【 取消接龙 】 后台取消订单","create_time":1558073559217,"userid":17059767,"attend_id":10,"name":"🇳 🇪 🇳 🇬"},{"record_log_id":4,"log_content":"【 用户备注 】 dddd1","create_time":1558072192662,"userid":17059767,"attend_id":10,"name":"🇳 🇪 🇳 🇬"},{"record_log_id":3,"log_content":"【 用户备注 】 dddd1","create_time":1558072150188,"userid":17059767,"attend_id":10,"name":"🇳 🇪 🇳 🇬"},{"record_log_id":1,"log_content":"【 用户备注 】 dddd","create_time":1558072142030,"userid":17059767,"attend_id":10,"name":"🇳 🇪 🇳 🇬"}],"errcode":0,"errmsg":"ok"}
        * @remark 这里是备注信息
        * @number 1
        */
        async get_active_record_log(req, res) {
            let { token, attend_id } = req.query;

            let user = req.user;


            let { userid, } = user;
            let get_active_record_log = await db.get_active_record_log({ attend_id });
            if (!get_active_record_log) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            http.send(res, RET_OK, { data: get_active_record_log });

        }


        /**
        * showdoc
        * @catalog 凭证管理
        * @title 获取接龙的凭证管理信息
        * @description 获取接龙的凭证管理信息接口
        * @method get
        * @url https://xxx:9001/get_active_record_manage_info
        * @param token 必选 string 用户凭证token  
        * @param active_id 必选 number 接龙id
        * @return {"data":{"recordCount":6,"payMoneyCount":267,"refundMoneyCount":0,"navList":[{"title":"全部","type":0,"num":6},{"title":"申请取消接龙","type":1,"num":1},{"title":"已取消接龙","type":2,"num":1},{"title":"已退款","type":3,"num":0},{"title":"备注","type":4,"num":1}],"buyGoodList":[]},"errcode":0,"errmsg":"ok"}
        * @return_param recordCount number 总订单数
        * @return_param payMoneyCount number 总订单金额
        * @return_param refundMoneyCount number 总退款金额
        * @return_param navList/title number 导航标题
        * @return_param navList/type number 导航类型
        * @return_param navList/num number 导航对应的订单数量
        * @return_param buyGoodList array 已团商品信息
        * @remark 这里是备注信息
        * @number 1
        */
        async get_active_record_manage_info(req, res) {
            let { token, active_id } = req.query;

            let user = req.user;


            let { userid, } = user;

            let active = await db.get_active_by_id(active_id)
            if (!active) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            if (active.originator_id != userid) {
                http.send(res, NO_PERMISSION);
                return;
            }

            //获取接龙统计（总订单数、总金额、总退款金额）
            let activeCount = await db.get_active_count({ active_id })
            if (!activeCount) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let { recordCount, payMoneyCount, refundMoneyCount, applyCancelCount, cancelCount, refundCount, commentsCount } = activeCount
            //获取接龙已团的商品信息
            let buyGoodList = await db.get_active_buyGoodList({ active_id });
            let navList = [
                { title: '全部', type: 0, num: recordCount },
                { title: '申请取消接龙', type: 1, num: applyCancelCount },
                { title: '已取消接龙', type: 2, num: cancelCount },
                { title: '已退款', type: 3, num: refundCount },
                { title: '备注', type: 4, num: commentsCount },
            ]
            navList = navList.filter(e => {
                return e.num > 0
            })


            let resultData = {
                userid: active.originator_id,
                name: active.name,
                headimg: active.headimg,
                recordCount,
                payMoneyCount,
                refundMoneyCount,
                navList,
                buyGoodList,
            }


            http.send(res, RET_OK, { data: resultData });

        }



        /**
        * showdoc
        * @catalog 凭证管理
        * @title 获取接龙凭证管理页面的凭证列表
        * @description 获取接龙凭证管理页面的凭证列表接口
        * @method get
        * @url https://xxx:9001/get_active_records_manage_list
        * @param token 必选 string 用户凭证token  
        * @param type 必选 number 凭证类型，0:全部（默认），1：申请取消接龙，2：已取消接龙，3：已退款，4：备注
        * @param page 必选 number 页数，每页返回10条数据，不传返回第一页
        * @param active_id 必选 number 接龙id
        * @param search 可选 string 搜索的数据
        * @return {"data":[{"attend_id":15,"userid":40052945,"active_id":19,"time":1557284615894,"comments":"123123","active_creator_comments":"","reward_money":0"active_content":"active_content","attend_cost":41,"state":1,"active_index":6,"phone":"1231231","real_name":"123123","addr":"123123","order_id":"BK155728461583840052945""logistics":null,"read_state":1,"payment_state":0,"refund_num":0,"refund_state":0,"name":"BigBinChan","headimg":"https://wx.qlogo.cn/mmopen/vi_32Q0j4TwGTfTJWddt1Ficn6dUibWsQO2mFYvibnAgELnyTVloCbko7d4WuPMfxLzmQIRxEuUABgMOr9KFiaa2hK1h4IQ/132","activeRecordsGoods":[]},{"attend_id":14,"userid":40052945,"active_id":19"time":1557284356942,"comments":"123123","active_creator_comments":"","reward_money":0,"active_content":"active_content","attend_cost":41,"state":1,"active_index":5"phone":"1231231","real_name":"123123","addr":"123123","order_id":"BK155728435688440052945","logistics":null,"read_state":1,"payment_state":0,"refund_num":0,"refund_state":0"name":"BigBinChan","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJWddt1Ficn6dUibWsQO2mFYvibnAgELnyTVloCbko7d4WuPMfxLzmQIRxEuUABgMOr9KFiaa2hK1h4IQ/132""activeRecordsGoods":[]},{"attend_id":13,"userid":40052945,"active_id":19,"time":1557284295020,"comments":"123123","active_creator_comments":"","reward_money":0"active_content":"active_content","attend_cost":41,"state":1,"active_index":4,"phone":"1231231","real_name":"123123","addr":"123123","order_id":"BK155728429496140052945""logistics":null,"read_state":1,"payment_state":0,"refund_num":0,"refund_state":0,"name":"BigBinChan","headimg":"https://wx.qlogo.cn/mmopen/vi_32Q0j4TwGTfTJWddt1Ficn6dUibWsQO2mFYvibnAgELnyTVloCbko7d4WuPMfxLzmQIRxEuUABgMOr9KFiaa2hK1h4IQ/132","activeRecordsGoods":[]},{"attend_id":12,"userid":40052945,"active_id":19"time":1557284184347,"comments":"123123","active_creator_comments":"","reward_money":0,"active_content":"active_content","attend_cost":41,"state":1,"active_index":3"phone":"1231231","real_name":"123123","addr":"123123","order_id":"BK155728418428840052945","logistics":null,"read_state":1,"payment_state":0,"refund_num":0,"refund_state":0"name":"BigBinChan","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJWddt1Ficn6dUibWsQO2mFYvibnAgELnyTVloCbko7d4WuPMfxLzmQIRxEuUABgMOr9KFiaa2hK1h4IQ/132""activeRecordsGoods":[]},{"attend_id":11,"userid":40052945,"active_id":19,"time":1557284116861,"comments":"123123","active_creator_comments":"","reward_money":0"active_content":"active_content","attend_cost":41,"state":4,"active_index":2,"phone":"1231231","real_name":"123123","addr":"123123","order_id":"BK155728411680340052945""logistics":null,"read_state":1,"payment_state":0,"refund_num":0,"refund_state":0,"name":"BigBinChan","headimg":"https://wx.qlogo.cn/mmopen/vi_32Q0j4TwGTfTJWddt1Ficn6dUibWsQO2mFYvibnAgELnyTVloCbko7d4WuPMfxLzmQIRxEuUABgMOr9KFiaa2hK1h4IQ/132","activeRecordsGoods":[{"records_good_id":8,"group_way_id":30,"attend_id":11"num":1,"name":"花生","size":"1斤","price":0.5}]},{"attend_id":10,"userid":17059767,"active_id":19,"time":1556000235972,"comments":"","active_creator_comments":"""reward_money":0,"active_content":null,"attend_cost":62,"state":2,"active_index":1,"phone":null,"real_name":null,"addr":null,"order_id":null,"logistics":null,"read_state":1"payment_state":0,"refund_num":0,"refund_state":0,"name":"🇳 🇪 🇳 🇬","headimg":"https://wx.qlogo.cn/mmopen/vi_32Q0j4TwGTfTKR2CX866DCJ90TXtmaZWdHu3oBzvib2zu03IFvQjebXfK0sicGW53GQd85Cz97aKic6Q4VzogHMZlsA/132","activeRecordsGoods":[{"records_good_id":1,"group_way_id":35,"attend_id":10"num":1,"name":"12123","size":"350","price":1},{"records_good_id":2,"group_way_id":36,"attend_id":10,"num":1,"name":"烤兔子","size":"1斤","price":20},{"records_good_id":3"group_way_id":37,"attend_id":10,"num":1,"name":"烤羊肉","size":"1斤","price":40},{"records_good_id":4,"group_way_id":38,"attend_id":10,"num":2,"name":"花生米","size":"1斤""price":1}]}],"errcode":0,"errmsg":"ok"}
        * 
        * @return_param attend_id number 参与接龙的记录id
        * @return_param userid number 参与接龙的用户id
        * @return_param active_id number 接龙id
        * @return_param time number 参与接龙的时间
        * @return_param comments string 备注
        * @return_param reward_money number 奖励金额
        * @return_param active_content string 接龙内容
        * @return_param attend_cost number 参与接龙花费
        * @return_param state number 接龙状态，1：未完成，2：失败，3：已付款，4，申请退款中，,5：同意退款，6：已完成接龙（收到货）
        * @return_param active_index number 接龙序号
        * @remark 这里是备注信息
        * @number 1
        */
        async get_active_records_manage_list(req, res) {
            let { token, type, page, active_id, search } = req.query;

            if (!/^([0-4])$/gi.test(type)) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let user = req.user;


            let { userid, } = user;

            let active = await db.get_active_by_id(active_id)
            if (!active) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            if (active.originator_id != userid) {
                http.send(res, NO_PERMISSION);
                return;
            }

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

            let getActiveRecordsManageList = await db.getActiveRecordsManageList({ userid, type, active_id, search, start, rows });
            if (!getActiveRecordsManageList) {
                getActiveRecordsManageList = []
            }
            http.send(res, RET_OK, { data: getActiveRecordsManageList });

        }


        /**
        * showdoc
        * @catalog 凭证管理
        * @title 获取签到管理信息
        * @description 获取签到管理信息接口
        * @method get
        * @url https://xxx:9001/get_active_record_signIn_manage_info
        * @param token 必选 string 用户凭证token  
        * @param active_id 必选 number 接龙id
        * @return {"data":{"userid":17059767,"name":"🇳 🇪 🇳 🇬","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKR2CX866DCJ90TXtmaZWdHu3oBzvib2zu03IFvQjebXfK0sicGW53GQd85Cz97aKic6Q4VzogHMZlsA/132","navList":[{"title":"全部","type":0,"num":0},{"title":"已签完","type":1,"num":1},{"title":"未签到","type":2,"num":1}],"buyGoodList":[{"records_good_id":1,"group_way_id":35,"attend_id":10,"num":1,"name":"12123","size":"350","price":1,"sign_in":0},{"records_good_id":2,"group_way_id":36,"attend_id":10,"num":1,"name":"烤兔子","size":"1斤","price":20,"sign_in":0},{"records_good_id":3,"group_way_id":37,"attend_id":10,"num":1,"name":"烤羊肉","size":"1斤","price":40,"sign_in":0},{"records_good_id":4,"group_way_id":38,"attend_id":10,"num":2,"name":"花生米","size":"1斤","price":1,"sign_in":0},{"records_good_id":8,"group_way_id":30,"attend_id":11,"num":1,"name":"花生","size":"1斤","price":0.5,"sign_in":1},{"records_good_id":95,"group_way_id":37,"attend_id":98,"num":1,"name":"烤羊肉","size":"1斤","price":40,"sign_in":0},{"records_good_id":96,"group_way_id":38,"attend_id":98,"num":1,"name":"花生米","size":"1斤","price":1,"sign_in":0}]},"errcode":0,"errmsg":"ok"}
        * 
        * @return_param navList/title number 导航标题
        * @return_param navList/type number 导航类型
        * @return_param navList/num number 导航对应的订单数量
        * @return_param buyGoodList array 已团商品信息
        * @return_param buyGoodList/sign_in number 已签到数量
        * @remark 这里是备注信息
        * @number 1
        */
        async get_active_record_signIn_manage_info(req, res) {
            let { token, active_id } = req.query;

            let user = req.user;


            let { userid, } = user;

            let active = await db.get_active_by_id(active_id)
            if (!active) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            if (active.originator_id != userid) {
                http.send(res, NO_PERMISSION);
                return;
            }


            //获取接龙签到统计
            let get_signIn_count = await db.get_signIn_count({ active_id })
            if (!get_signIn_count) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let { finish_sign_in, no_sign_in, part_sign_in } = get_signIn_count

            //获取接龙已团的商品信息
            let buyGoodList = await db.get_active_buyGoodList_by_records({ active_id });
            let navList = [
                { title: '全部', type: 0, num: 0 },
                { title: '已签完', type: 1, num: finish_sign_in },
                { title: '未签到', type: 2, num: no_sign_in },
                { title: '部分签到', type: 3, num: part_sign_in },
            ]
            navList = navList.filter(e => {
                return e.num > 0 || e.title == '全部'
            })


            let resultData = {
                userid: active.originator_id,
                name: active.name,
                headimg: active.headimg,

                navList,
                buyGoodList,
            }


            http.send(res, RET_OK, { data: resultData });

        }


        /**
        * showdoc
        * @catalog 凭证管理
        * @title 获取签到管理页面的凭证列表
        * @description 获取签到管理页面的凭证列表接口
        * @method get
        * @url https://xxx:9001/get_active_records_signIn_manage_list
        * @param token 必选 string 用户凭证token  
        * @param type 必选 number 凭证类型，0:全部（默认），1：已签完，2：未签到，3：部分签到
        * @param page 必选 number 页数，每页返回10条数据，不传返回第一页
        * @param active_id 必选 number 接龙id
        * @param search 可选 string 搜索的数据
        * @return {"data":[{"attend_id":98,"all_sign_in":0,"all_num":2,"userid":17059767,"active_id":19,"time":1558156283800,"comments":"11","active_creator_comments":"","reward_money":0,"active_content":"active_content","attend_cost":41,"state":1,"active_index":7,"phone":null,"real_name":null,"addr":null,"order_id":"BK155815628379917059767","logistics":"{\"type\":\"去设置\",\"items\":[]}","read_state":1,"payment_state":3,"refund_num":0,"refund_state":0,"name":"🇳 🇪 🇳 🇬","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKR2CX866DCJ90TXtmaZWdHu3oBzvib2zu03IFvQjebXfK0sicGW53GQd85Cz97aKic6Q4VzogHMZlsA/132","activeRecordsGoods":[{"records_good_id":95,"group_way_id":37,"attend_id":98,"num":1,"name":"烤羊肉","size":"1斤","price":40,"sign_in":0},{"records_good_id":96,"group_way_id":38,"attend_id":98,"num":1,"name":"花生米","size":"1斤","price":1,"sign_in":0}]},{"attend_id":15,"all_sign_in":0,"all_num":0,"userid":40052945,"active_id":19,"time":1557284615894,"comments":"123123","active_creator_comments":"","reward_money":0,"active_content":"active_content","attend_cost":41,"state":1,"active_index":6,"phone":"1231231","real_name":"123123","addr":"123123","order_id":"BK155728461583840052945","logistics":null,"read_state":1,"payment_state":0,"refund_num":0,"refund_state":0,"name":"BigBinChan","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJWddt1Ficn6dUibWsQO2mFYvibnAgELnyTVloCbko7d4WuPMfxLzmQIRxEuUABgMOr9KFiaa2hK1h4IQ/132","activeRecordsGoods":[]},{"attend_id":14,"all_sign_in":0,"all_num":0,"userid":40052945,"active_id":19,"time":1557284356942,"comments":"123123","active_creator_comments":"","reward_money":0,"active_content":"active_content","attend_cost":41,"state":1,"active_index":5,"phone":"1231231","real_name":"123123","addr":"123123","order_id":"BK155728435688440052945","logistics":null,"read_state":1,"payment_state":0,"refund_num":0,"refund_state":0,"name":"BigBinChan","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJWddt1Ficn6dUibWsQO2mFYvibnAgELnyTVloCbko7d4WuPMfxLzmQIRxEuUABgMOr9KFiaa2hK1h4IQ/132","activeRecordsGoods":[]},{"attend_id":13,"all_sign_in":0,"all_num":0,"userid":40052945,"active_id":19,"time":1557284295020,"comments":"123123","active_creator_comments":"","reward_money":0,"active_content":"active_content","attend_cost":41,"state":1,"active_index":4,"phone":"1231231","real_name":"123123","addr":"123123","order_id":"BK155728429496140052945","logistics":null,"read_state":1,"payment_state":0,"refund_num":0,"refund_state":0,"name":"BigBinChan","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJWddt1Ficn6dUibWsQO2mFYvibnAgELnyTVloCbko7d4WuPMfxLzmQIRxEuUABgMOr9KFiaa2hK1h4IQ/132","activeRecordsGoods":[]},{"attend_id":12,"all_sign_in":0,"all_num":0,"userid":40052945,"active_id":19,"time":1557284184347,"comments":"123123","active_creator_comments":"","reward_money":0,"active_content":"active_content","attend_cost":41,"state":1,"active_index":3,"phone":"1231231","real_name":"123123","addr":"123123","order_id":"BK155728418428840052945","logistics":null,"read_state":1,"payment_state":0,"refund_num":0,"refund_state":0,"name":"BigBinChan","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJWddt1Ficn6dUibWsQO2mFYvibnAgELnyTVloCbko7d4WuPMfxLzmQIRxEuUABgMOr9KFiaa2hK1h4IQ/132","activeRecordsGoods":[]},{"attend_id":11,"all_sign_in":1,"all_num":1,"userid":40052945,"active_id":19,"time":1557284116861,"comments":"123123","active_creator_comments":"","reward_money":0,"active_content":"active_content","attend_cost":41,"state":4,"active_index":2,"phone":"1231231","real_name":"123123","addr":"123123","order_id":"BK155728411680340052945","logistics":null,"read_state":1,"payment_state":0,"refund_num":0,"refund_state":0,"name":"BigBinChan","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJWddt1Ficn6dUibWsQO2mFYvibnAgELnyTVloCbko7d4WuPMfxLzmQIRxEuUABgMOr9KFiaa2hK1h4IQ/132","activeRecordsGoods":[{"records_good_id":8,"group_way_id":30,"attend_id":11,"num":1,"name":"花生","size":"1斤","price":0.5,"sign_in":1}]}],"errcode":0,"errmsg":"ok"} 
        * @return_param attend_id number 参与接龙的记录id
        * @return_param userid number 参与接龙的用户id
        * @return_param active_id number 接龙id
        * @return_param time number 参与接龙的时间
        * @return_param comments string 备注
        * @return_param reward_money number 奖励金额
        * @return_param active_content string 接龙内容
        * @return_param attend_cost number 参与接龙花费
        * @return_param state number 接龙状态，1：未完成，2：失败，3：已付款，4，申请退款中，,5：同意退款，6：已完成接龙（收到货）
        * @return_param active_index number 接龙序号
        * @remark 这里是备注信息
        * @number 1
        */
        async get_active_records_signIn_manage_list(req, res) {
            let { token, type, page, active_id, search } = req.query;

            if (!/^([0-3])$/gi.test(type)) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let user = req.user;


            let { userid, } = user;

            let active = await db.get_active_by_id(active_id)
            if (!active) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            if (active.originator_id != userid) {
                http.send(res, NO_PERMISSION);
                return;
            }

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

            let getActiveRecordsSignInManageList = await db.getActiveRecordsSignInManageList({ userid, type, active_id, search, start, rows });
            if (!getActiveRecordsSignInManageList) {
                getActiveRecordsSignInManageList = []
            }
            http.send(res, RET_OK, { data: getActiveRecordsSignInManageList });

        }


        /**
        * showdoc
        * @catalog 凭证管理
        * @title 签到凭证
        * @description 签到凭证
        * @method get
        * @url https://xxx:9001/signIn_active_records
        * @param token 必选 string 用户凭证token  
        * @param attend_id 必选 number 接龙凭证id
        * @param type 必选 number 签到类型，1：部分签到,2：全部签到
        * @param signInGoodList 可选 array 签到的商品数据（type为2的时候不用传） ,数据格式：[{group_way_id:1,sign_in:1}]
        * @return {"data":true,"errcode":0,"errmsg":"ok"}
        * @remark 这里是备注信息
        * @number 1
        */
        async signIn_active_records(req, res) {
            let { token, type, signInGoodList, attend_id } = req.query;

            if (!/^([1-2])$/gi.test(type)) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            if (type == 1) {
                try {
                    signInGoodList = JSON.parse(signInGoodList)
                    if (signInGoodList && signInGoodList.length > 0) {
                        signInGoodList = signInGoodList.filter(e => {
                            let { group_way_id, sign_in } = e;
                            return group_way_id != null && sign_in != null
                        })
                    }

                } catch (error) {
                    http.send(res, INVALID_PARAMETER);
                    return;
                }


                if (!signInGoodList || signInGoodList.length <= 0) {
                    http.send(res, INVALID_PARAMETER);
                    return;
                }

            }

            let user = req.user;


            let { userid, } = user;

            let activeRecord = await db.get_active_record_by_id(attend_id);
            if (!activeRecord) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            let { active_id } = activeRecord;

            let active = await db.get_active_by_id(active_id)
            if (!active) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            if (active.originator_id != userid && activeRecord.userid != userid) {
                http.send(res, NO_PERMISSION);
                return;
            }


            let signIn_active_records = await db.signIn_active_records({ userid, type, signInGoodList, attend_id });

            http.send(res, RET_OK, { data: signIn_active_records });

        }



        /**
        * showdoc
        * @catalog 凭证管理
        * @title 获取接龙可通知的用户列表
        * @description 获取接龙可通知的用户列表
        * @method get
        * @url https://xxx:9001/get_active_notice_user
        * @param token 必选 string 用户凭证token  
        * @param active_id 必选 number 接龙id
        * @return {"data":[{"form_id":"24b48bf243744ed0a8d17322893d8fa8","userid":40052945,"name":"BigBinChan","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJWddt1Ficn6dUibWsQO2mFYvibnAgELnyTVloCbko7d4WuPMfxLzmQIRxEuUABgMOr9KFiaa2hK1h4IQ/132"},{"form_id":"016c7dc642b746a38dd7c463258a1bb6","userid":17059767,"name":"🇳 🇪 🇳 🇬","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKR2CX866DCJ90TXtmaZWdHu3oBzvib2zu03IFvQjebXfK0sicGW53GQd85Cz97aKic6Q4VzogHMZlsA/132"}],"errcode":0,"errmsg":"ok"}
        * @return_param form_id number 不为null表示可发送服务通知
        * @return_param userid number 用户id
        * @return_param name number 用户名称
        * @return_param headimg number 用户头像
        * @remark 这里是备注信息
        * @number 1
        */
       async get_active_notice_user(req, res) {
            let { token, active_id, } = req.query;
            
            let user = req.user;
            let { userid, } = user;

            let active = await db.get_active_by_id(active_id)
            if (!active) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            if (active.originator_id != userid) {
                http.send(res, NO_PERMISSION);
                return;
            }

            let get_active_notice_user = await db.get_active_notice_user({  active_id });
            http.send(res, RET_OK, { data: get_active_notice_user });
        }






    }

    return httpController;
};
