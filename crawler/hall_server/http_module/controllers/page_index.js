
const db = require('../../../utils/dbsync_hall');
const dbRedis = require('../../../utils/db_redis_hall');
const redis = require('../../../utils/redis');

const crypto = require('../../../utils/crypto');
const http = require('../../../utils/http');
const configs = require('../../../configs.js');
const config = configs.hall_server();

const path = require('path');
const fs = require('fs');
const TOKEN = require('../utils/token');

const ERRCODE = require('../../../utils/errcode.js');
//redis表名
const { TOKENS_USER, USERS_TOKEN, INDEX_SEARCH_HISTORY } = dbRedis;
const { RET_OK } = ERRCODE;
//大厅服错误码
const { TOKEN_TIMEOUT, NO_USER, OPERATE_FAILED, NO_PERMISSION } = ERRCODE.HALL_ERRS;
//系统错误码
const { INVALID_PARAMETER } = ERRCODE.SYS_ERRS;




/**
 * 
 *  用户管理模块
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
        * @catalog 首页
        * @title 获取首页列表
        * @description 获取首页列表接口
        * @method get
        * @url https://xxx:9001/get_index_list
        * @param token 必选 string 用户凭证token  
        * @param page 可选 number 页数，每页返回10条数据，不传返回第一页
        * @param type 可选 number 类型，1：全部，2：我发布的，3：我参与的，4：最近浏览 （不传默认返回全部数据）
        * @param search 可选 string 搜索，返回对应搜索的数据
        * @return {"data":[{"userid":123456,"name":"bmVuZw==","headimg":null,"active_id":4,"originator_id":123456,"active_type":1,"phone":null,"title":"cssss","state":null,"list_info":null,"o_list_info":null,"participant_info":null,"group_way":null,"most_optional":null,"hide":0,"start_time":1555062612140,"end_time":null,"locale":null,"background":0,"user_secret":0,"leave_msg":0,"all_count":-999,"start_price":0,"show_user_info":0,"pay_mode":0,"reward_setting":null,"tips":null,"create_time":null,"alter_time":1555061912144,"retAttendRecords":[{"attend_id":1,"userid":519207,"active_id":1,"time":null,"active_index":1,"comments":null,"reward_money":0,"active_content":null,"attend_cost":10,"state":null},{"attend_id":2,"userid":519207,"active_id":1,"time":null,"active_index":2,"comments":null,"reward_money":0,"active_content":null,"attend_cost":30.6,"state":null},{"attend_id":3,"userid":123456,"active_id":1,"time":null,"active_index":3,"comments":null,"reward_money":0,"active_content":null,"attend_cost":20.3,"state":null},{"attend_id":4,"userid":234567,"active_id":1,"time":null,"active_index":4,"comments":null,"reward_money":0,"active_content":null,"attend_cost":21.4,"state":null}],"activeAttendCount":1,"activeReadCount":0},{"userid":519207,"name":"8J+HsyDwn4eqIPCfh7Mg8J+HrA==","headimg":null,"active_id":3,"originator_id":519207,"active_type":2,"phone":null,"title":"测试3","state":null,"list_info":null,"o_list_info":null,"participant_info":null,"group_way":null,"most_optional":null,"hide":0,"start_time":1555061912140,"end_time":null,"locale":null,"background":0,"user_secret":0,"leave_msg":0,"all_count":-999,"start_price":0,"show_user_info":null,"pay_mode":0,"reward_setting":null,"tips":null,"create_time":1555061912140,"alter_time":1555061912143,"retAttendRecords":[{"attend_id":1,"userid":519207,"active_id":1,"time":null,"active_index":1,"comments":null,"reward_money":0,"active_content":null,"attend_cost":10,"state":null},{"attend_id":2,"userid":519207,"active_id":1,"time":null,"active_index":2,"comments":null,"reward_money":0,"active_content":null,"attend_cost":30.6,"state":null},{"attend_id":3,"userid":123456,"active_id":1,"time":null,"active_index":3,"comments":null,"reward_money":0,"active_content":null,"attend_cost":20.3,"state":null},{"attend_id":4,"userid":234567,"active_id":1,"time":null,"active_index":4,"comments":null,"reward_money":0,"active_content":null,"attend_cost":21.4,"state":null}],"activeAttendCount":0,"activeReadCount":0},{"userid":519207,"name":"8J+HsyDwn4eqIPCfh7Mg8J+HrA==","headimg":null,"active_id":1,"originator_id":519207,"active_type":1,"phone":null,"title":"测试1","state":null,"list_info":null,"o_list_info":null,"participant_info":null,"group_way":null,"most_optional":null,"hide":0,"start_time":1555061812140,"end_time":null,"locale":null,"background":0,"user_secret":0,"leave_msg":0,"all_count":-999,"start_price":0,"show_user_info":null,"pay_mode":0,"reward_setting":null,"tips":null,"create_time":1555061812140,"alter_time":1555061812141,"retAttendRecords":[{"attend_id":1,"userid":519207,"active_id":1,"time":null,"active_index":1,"comments":null,"reward_money":0,"active_content":null,"attend_cost":10,"state":null},{"attend_id":2,"userid":519207,"active_id":1,"time":null,"active_index":2,"comments":null,"reward_money":0,"active_content":null,"attend_cost":30.6,"state":null},{"attend_id":3,"userid":123456,"active_id":1,"time":null,"active_index":3,"comments":null,"reward_money":0,"active_content":null,"attend_cost":20.3,"state":null},{"attend_id":4,"userid":234567,"active_id":1,"time":null,"active_index":4,"comments":null,"reward_money":0,"active_content":null,"attend_cost":21.4,"state":null}],"activeAttendCount":4,"activeReadCount":15},{"userid":519207,"name":"8J+HsyDwn4eqIPCfh7Mg8J+HrA==","headimg":null,"active_id":2,"originator_id":519207,"active_type":1,"phone":null,"title":"测试2","state":null,"list_info":null,"o_list_info":null,"participant_info":null,"group_way":null,"most_optional":null,"hide":0,"start_time":1555061612140,"end_time":null,"locale":null,"background":0,"user_secret":0,"leave_msg":0,"all_count":-999,"start_price":0,"show_user_info":null,"pay_mode":0,"reward_setting":null,"tips":null,"create_time":1555061612140,"alter_time":1555061612142,"retAttendRecords":[{"attend_id":1,"userid":519207,"active_id":1,"time":null,"active_index":1,"comments":null,"reward_money":0,"active_content":null,"attend_cost":10,"state":null},{"attend_id":2,"userid":519207,"active_id":1,"time":null,"active_index":2,"comments":null,"reward_money":0,"active_content":null,"attend_cost":30.6,"state":null},{"attend_id":3,"userid":123456,"active_id":1,"time":null,"active_index":3,"comments":null,"reward_money":0,"active_content":null,"attend_cost":20.3,"state":null},{"attend_id":4,"userid":234567,"active_id":1,"time":null,"active_index":4,"comments":null,"reward_money":0,"active_content":null,"attend_cost":21.4,"state":null}],"activeAttendCount":1,"activeReadCount":3}],"errcode":0,"errmsg":"ok"}
        * @return_param retAttendRecords array 接龙参与记录，该接口最多只会获取10条记录,get_attend_records接口获取更多的用户参与历史记录接口
        * @return_param activeAttendCount number 接龙参与人数
        * @return_param activeReadCount number 接龙阅读人数
        * @return_param userid number 发布接龙的用户id
        * @return_param name number 发布接龙的用户名称
        * @return_param headimg number 发布接龙的用户头像
        * @return_param active_id number 接龙id
        * @return_param active_type  number 接龙类型，1：报名接龙-enlist，2：团购接龙-buy，3：互动接龙-interact，4：拼团接龙-assemble，5：阅读接龙-read，6：评选接龙-select，7：费用接龙-cost
        * @return_param phone  number 客服电话  
        * @return_param title  string 主题  
        * @return_param state  number 活动状态，0：保存预览，1：发布，2：完成 
        * @return_param list_info  array 列表内容，json数组对象，（dataType,1：文字，2：图片，3：视频）
        * @return_param o_list_info  array 列表内容，json数组对象，（报名接龙和互动接龙有效）（dataType,1：填写项，2：图片，3：视频,4:语音，5：位置，6：单选项，7：多选项）,
        * @return_param group_way  array 拼团方式，json数组对象，（报名项目、团购商品、拼团商品、选项、筹款等栏目）
        * @return_param most_optional  number 最多可选（只有在评选接龙才有效，1：最多可选1项，2：最多可选2项）
        * @return_param hide  number 传播隐私，0：所有人均可转发，1：隐藏接龙且所有人均可转发，2：只有发布者可以转发
        * @return_param start_time  number 活动开始时间，毫秒时间戳
        * @return_param end_time  number 活动结束时间，毫秒时间戳
        * @return_param locale  string 活动地点
        * @return_param background  number 活动背景(不知道有什么用，传0)
        * @return_param user_secret  number 用户隐私设置，0：公开所有参与者信息，1：匿名所有参与者信息
        * @return_param leave_msg number  留言设置，0：参与者无需留言，1：参与者可留言(不传默认0）
        * @return_param all_count number 接龙次数，-999：无限次(不传默认-999）
        * @return_param start_price number 接龙起购价(不传默认0）
        * @return_param start_price_mode number 接龙起购价模式，0：每次接龙需满足的起购金额，1：只需满足第一次的起购金额
        * @return_param show_user_info number 参与人显示，0：头像+微信名，1：头像+微信名匿名，2：头像，3：微信名，4：微信名匿名(不传默认0）
        * @return_param pay_mode number 确认接龙方式，0：支付后完成接龙，1：先完成接龙暂不支付(不传默认0）
        * @return_param reward_setting array 接龙奖励设置，json数组对象，（奖励费用、是否公开奖励规则、设定奖励区域范围、参与接龙有镜像、分享有奖励等）
        * @return_param tips string 填写让参与人注意的重要信息
        * @return_param create_time number 创建时间
        * @return_param alter_time number 修改时间
        * @return_param share_num number 转发次数
        * @return_param hidden number 是否隐藏，0：显示，1：隐藏
        * @return_param logistics_mode  object json对象,物流方式设置
        * @return_param show_reward_rule  number 是否公开奖励规则，0：公开，1：隐藏
        * @return_param reward_amount  number 奖励总金额
        * @return_param reward_num  number 红包数量
        * @return_param reward_locale  object json对象,设定奖励区域范围
        * @return_param use_reward  number 使用参与接龙获得奖励,0：不使用，1：使用
        * @return_param use_share_reward  number 使用分享接龙奖励，0：不使用，1：使用
        * @return_param use_reward_locale  number 使用奖励区域范围，0：不使用，1：使用
        * @return_param share_reward_rule  object json对象,分享奖励，数据结构[{share_reward_rule_id:1,num:1,reward_money:22.13}]
        * @return_param myActiveRecordsGoods  array 我的凭证商品
        * @return_param myActiveRecordsGoods/allNum  array 我的凭证商品-该商品数量
        * @remark 这里是备注信息
        * @number 1
        */
        async get_index_list(req, res) {
            let { token, page, type, search } = req.query;
            let user = req.user;


            type = type != null ? type : 1;
            if (!/^([1-5])$/gi.test(type)) {

                http.send(res, INVALID_PARAMETER);
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

            let { userid,latitude,longitude } = user;

            let getIndexActiveList = await db.getIndexActiveList({ userid, start, rows, type, search,latitude,longitude });
            if (!getIndexActiveList) {
                getIndexActiveList = [];
            }

            if (getIndexActiveList.length > 0) {

                let filedData_activeId = db.retFiledData_to_arr(getIndexActiveList, 'active_id');
                let active_ids = filedData_activeId.queryString;
                let id_arr = filedData_activeId.arr;
                if (active_ids && active_ids.length > 2) {
                    //获取多个活动的凭证记录
                    let AttendRecordsData = await db.getUserAttendRecords_by_activeIds({ active_ids, start: 0, rows: 10 });
                    //获取每个接龙的商品信息
                    let groupWayData = await db.get_group_way_by_activeIds({ active_ids });
                    //接龙参加的凭证数量
                    let activeAttendCount = await db.getActivesAttendCount_by_activeIds({ active_ids,userDistinct:true });
                    //每个接龙看过的总人数
                    let activeReadCount = await db.getActivesReadCount_by_activeIds({ active_ids });
                    //获取每个接龙商品最大价格和最小价格
                    let activeMaxMinPrice = await db.getActivesMaxMinPrice_by_activeIds({ active_ids });
                    //获取每个接龙我的凭证商品
                    let myActiveRecordsGoods = await db.getMyActiveRecordsGoods_by_activeIds({ userid, active_ids });
                    //组合数据
                    getIndexActiveList.map(e => {
                        let { active_id, name } = e;
                        e.retAttendRecords = AttendRecordsData[active_id] || [];
                        e.group_way = groupWayData[active_id] || [];
                        e.myActiveRecordsGoods = myActiveRecordsGoods[active_id] || [];

                        e.activeAttendCount = activeAttendCount[active_id] ? activeAttendCount[active_id] : 0;
                        e.activeReadCount = activeReadCount[active_id] ? activeReadCount[active_id] : 0;
                        e.max_price = activeMaxMinPrice[active_id] ? activeMaxMinPrice[active_id].max_price : 0;
                        e.min_price = activeMaxMinPrice[active_id] ? activeMaxMinPrice[active_id].min_price : 0;

                        try {
                            e.name = crypto.fromBase64(name);
                        } catch (error) {
                            console.error(error)
                        }
                    })

                }

            }


            http.send(res, RET_OK, { data: getIndexActiveList });

            if (search != null && this.isString(search)) {

                let rd_key = `${INDEX_SEARCH_HISTORY}:${userid}`
                let len = await redis.llen(rd_key)
                console.log(len)
                let searchData = JSON.stringify({
                    type,
                    value: search
                })

                await redis.lrem(rd_key, 1, searchData)
                await redis.lpush(rd_key, searchData)
                if (len > 7) {
                    console.log(`删除`)
                    redis.rpop(rd_key)
                }

            }


        }


        /**
       * showdoc
       * @catalog 首页
       * @title 获取我的接龙凭证
       * @description 获取我的接龙凭证接口
       * @method get
       * @url https://xxx:9001/get_active_certificates
       * @param token 必选 string 用户凭证token  
       * @param page 可选 number 页数，每页返回10条数据，不传返回第一页
       * @param active_id 可选 number 活动id
       * @param state 可选 number 1:已参与（默认），2：待支付，3：已完成
       * @return {"data":[{"locale":"{\"count\":1,\"zoneFlag\":true,\"placeList\":[]}","title":"234","originator_id":17059767,"active_user_name":"🇳 🇪 🇳 🇬","active_user_headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKR2CX866DCJ90TXtmaZWdHu3oBzvib2zu03IFvQjebXfK0sicGW53GQd85Cz97aKic6Q4VzogHMZlsA/132","attend_id":99,"userid":17059767,"active_id":44,"time":1558158310345,"comments":"测试备注","active_creator_comments":"创建人备注","reward_money":0,"active_content":"active_content","attend_cost":1,"state":1,"active_index":1,"phone":null,"real_name":null,"addr":null,"order_id":"BK155815831034517059767","logistics":"{\"type\":\"快递发货\",\"items\":[{\"name\":\"contact\",\"value\":\"联系人\",\"content\":\"张三\",\"checked\":true,\"must\":true},{\"name\":\"phone\",\"value\":\"联系电话\",\"content\":\"020-81167888\",\"checked\":true,\"must\":true},{\"name\":\"addr\",\"value\":\"联系地址\",\"content\":\"广东省广州市海珠区新港中路397号\",\"checked\":true,\"must\":true}]}","read_state":1,"payment_state":3,"refund_num":2,"refund_state":3,"activeRecordsGoods":[{"records_good_id":97,"group_way_id":74,"attend_id":99,"num":1,"name":"22","size":"1","price":1}]},{"locale":"{\"count\":1,\"zoneFlag\":true,\"placeList\":[]}","title":"接龙主题色调12444","originator_id":17059767,"active_user_name":"🇳 🇪 🇳 🇬","active_user_headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKR2CX866DCJ90TXtmaZWdHu3oBzvib2zu03IFvQjebXfK0sicGW53GQd85Cz97aKic6Q4VzogHMZlsA/132","attend_id":98,"userid":17059767,"active_id":19,"time":1558156283800,"comments":"","active_creator_comments":"","reward_money":0,"active_content":"active_content","attend_cost":41,"state":1,"active_index":7,"phone":null,"real_name":null,"addr":null,"order_id":"BK155815628379917059767","logistics":"{\"type\":\"去设置\",\"items\":[]}","read_state":1,"payment_state":3,"refund_num":0,"refund_state":0,"activeRecordsGoods":[{"records_good_id":95,"group_way_id":37,"attend_id":98,"num":1,"name":"烤羊肉","size":"1斤","price":40},{"records_good_id":96,"group_way_id":38,"attend_id":98,"num":1,"name":"花生米","size":"1斤","price":1}]},{"locale":null,"title":null,"originator_id":null,"active_user_name":null,"active_user_headimg":null,"attend_id":18,"userid":17059767,"active_id":-1,"time":1557540748634,"comments":"","active_creator_comments":"","reward_money":0,"active_content":"active_content","attend_cost":0,"state":1,"active_index":2,"phone":null,"real_name":null,"addr":null,"order_id":"BK155754074863217059767","logistics":"{\"name\":\"张三\",\"phone\":\"020-81167888\",\"address\":\"广东省广州市海珠区新港中路397号\"}","read_state":1,"payment_state":0,"refund_num":0,"refund_state":0,"activeRecordsGoods":[]},{"locale":null,"title":null,"originator_id":null,"active_user_name":null,"active_user_headimg":null,"attend_id":17,"userid":17059767,"active_id":-1,"time":1557540742557,"comments":"","active_creator_comments":"","reward_money":0,"active_content":"active_content","attend_cost":0,"state":1,"active_index":2,"phone":null,"real_name":null,"addr":null,"order_id":"BK155754074255617059767","logistics":"{\"userid\":17059767,\"account\":\"wx_oP7dK5NPQN4BnaMStTOLqM4xcpxg\",\"name\":\"","read_state":1,"payment_state":0,"refund_num":0,"refund_state":0,"activeRecordsGoods":[]},{"locale":"{\"count\":1,\"zoneFlag\":true,\"placeList\":[]}","title":"接龙主题色调12444","originator_id":17059767,"active_user_name":"🇳 🇪 🇳 🇬","active_user_headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKR2CX866DCJ90TXtmaZWdHu3oBzvib2zu03IFvQjebXfK0sicGW53GQd85Cz97aKic6Q4VzogHMZlsA/132","attend_id":10,"userid":17059767,"active_id":19,"time":1556000235972,"comments":"","active_creator_comments":"","reward_money":0,"active_content":null,"attend_cost":62,"state":2,"active_index":1,"phone":null,"real_name":null,"addr":null,"order_id":null,"logistics":null,"read_state":1,"payment_state":0,"refund_num":0,"refund_state":0,"activeRecordsGoods":[{"records_good_id":1,"group_way_id":35,"attend_id":10,"num":1,"name":"12123","size":"350","price":1},{"records_good_id":2,"group_way_id":36,"attend_id":10,"num":1,"name":"烤兔子","size":"1斤","price":20},{"records_good_id":3,"group_way_id":37,"attend_id":10,"num":1,"name":"烤羊肉","size":"1斤","price":40},{"records_good_id":4,"group_way_id":38,"attend_id":10,"num":2,"name":"花生米","size":"1斤","price":1}]}],"errcode":0,"errmsg":"ok"}

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
       * @return_param locale string 地理位置
       * @return_param active_user_headimg string 接龙发起人的头像
       * @return_param active_user_name string 接龙发起人的名称
 
       * @remark 这里是备注信息
       * @number 1
       */
        async get_active_certificates(req, res) {
            let { token, page, state, active_id } = req.query;
            let user = req.user;


            state = state != null ? state : 1;
            if (!/^([1-3])$/gi.test(state)) {
                http.send(res, INVALID_PARAMETER);
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

            let { userid, } = user;

            let getActiveCertificates = await db.getActiveCertificates({ userid, start, rows, state, active_id });
            if (!getActiveCertificates) {
                getActiveCertificates = [];
            }

            http.send(res, RET_OK, { data: getActiveCertificates });

        }


        /**
        * showdoc
        * @catalog 首页
        * @title 获取我的订阅
        * @description 获取我的订阅接口
        * @method get
        * @url https://xxx:9001/get_subscribe
        * @param token 必选 string 用户凭证token  
        * @param page 可选 number 页数，每页返回10条数据，不传返回第一页
        * @param search 可选 string 搜索的内容
        * @return {"data":{"subscribeData":[{"userid":17059767,"subscribe_id":17059767,"create_time":1555920063132,"name":"🇳 🇪 🇳 🇬","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKR2CX866DCJ90TXtmaZWdHu3oBzvib2zu03IFvQjebXfK0sicGW53GQd85Cz97aKic6Q4VzogHMZlsA/132","sex":1,"fansCount":4,"activeCount":14},{"userid":13012409,"subscribe_id":13012409,"create_time":1555920063130,"name":"stones","headimg":"https://wx.qlogo.cn/mmopen/vi_32/M8XkRL1icroT8UPeGeEuicJ4BicqAnd7yz2o7WjYHQ1JUOQnZ46s4lmtkpu1ZoCqQr8Fj8gkd0z5NHYs8qPdmSOGQ/132","sex":0,"fansCount":0,"activeCount":4},{"userid":40052945,"subscribe_id":40052945,"create_time":1555920063130,"name":"BigBinChan","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJWddt1Ficn6dUibWsQO2mFYvibnAgELnyTVloCbko7d4WuPMfxLzmQIRxEuUABgMOr9KFiaa2hK1h4IQ/132","sex":1,"fansCount":0,"activeCount":0}],"subscribeCount":3},"errcode":0,"errmsg":"ok"}
        * @return_param subscribeData array 订阅人的数据
        * @return_param subscribeCount number 订阅人的总数
        * @return_param subscribe_id number 订阅人的id
        * @return_param create_time number 订阅的时间
        * @return_param name string 订阅人的名称
        * @return_param headimg number 订阅人的头像
        * @return_param sex number 订阅人的性别
        * @return_param fansCount number 订阅人的接龙粉丝数
        * @return_param activeCount number 订阅人的接龙数量
        * @remark 这里是备注信息
        * @number 1
        */
        async get_subscribe(req, res) {
            let { token, page,search } = req.query;
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

            let { userid, } = user;

            let getSubscribe = await db.getSubscribe({ userid, search, start, rows });
            if (!getSubscribe) {
                getSubscribe = { subscribeData: [], subscribeCount: 0 };
            }

            http.send(res, RET_OK, { data: getSubscribe });

        }


        /**
        * showdoc
        * @catalog 首页
        * @title 不再订阅
        * @description 不再订阅接口
        * @method get
        * @url https://xxx:9001/delete_subscribe
        * @param token 必选 string 用户凭证token  
        * @param subscribe_id 必选 number 订阅人的id
        * @return {"errcode":0,"errmsg":"ok"}
        * @remark 这里是备注信息
        * @number 1
        */
        async delete_subscribe(req, res) {
            let { token, subscribe_id, } = req.query;
            let user = req.user;



            if (subscribe_id == null) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let { userid } = user;

            let delete_subscribe = await db.delete_subscribe({ userid, subscribe_id })
            if (delete_subscribe) {
                http.send(res, RET_OK);
            } else {
                http.send(res, OPERATE_FAILED);
            }

        }

        /**
       * showdoc
       * @catalog 首页
       * @title 修改用户订阅状态
       * @description 修改用户订阅状态接口
       * @method get
       * @url https://xxx:9001/update_subscribe_state
       * @param token 必选 string 用户凭证token  
       * @param subscribe_id 必选 number 订阅人的id
       * @param state 必选 number 
       * @return {"errcode":0,"errmsg":"ok"}
       * @remark 这里是备注信息
       * @number 1
       */
        async update_subscribe_state(req, res) {
            let { token, subscribe_id, state } = req.query;

            if (!/^([0-1])$/gi.test(state)) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let user = req.user;



            let { userid } = user;

            if (userid == subscribe_id) {
                http.send(res, INVALID_PARAMETER);
                return;
            }


            let subscribe_user = await db.get_user_data_by_userid(subscribe_id);
            if (!subscribe_user) {
                http.send(res, INVALID_PARAMETER);
                return;
            }


            let update_subscribe_state = state == 1 ? await db.subscribe_user({ userid, subscribe_id }) : await db.delete_subscribe({ userid, subscribe_id })

            if (update_subscribe_state) {
                http.send(res, RET_OK);
            } else {
                http.send(res, OPERATE_FAILED);
            }

        }



        /**
        * showdoc
        * @catalog 首页
        * @title 获取活动详情
        * @description 获取活动详情接口
        * @method get
        * @url https://xxx:9001/get_active_info
        * @param token 必选 string 用户凭证token  
        * @param active_id 可选 number 活动id
        * @return {"data":{"userid":17059767,"name":"🇳 🇪 🇳 🇬","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKR2CX866DCJ90TXtmaZWdHu3oBzvib2zu03IFvQjebXfK0sicGW53GQd85Cz97aKic6Q4VzogHMZlsA/132","active_id":19,"originator_id":17059767,"active_type":2,"phone":"null","title":"接龙主题色调12444","state":1,"list_info":"[{\"type\":\"单图\",\"value\":[\"http://47.96.43.115/userActiveFile/17059767/image/201947/wx8b8459c0c44cb46d.o6zAJs5OwFyTnt5BT3u1Jrd2mL0c.3JsgwmIstt2B4ef2dfa6ffc4905ce2386506173aa1a1.png\"]},{\"type\":\"文字\",\"value\":\"23123沙发燃烧大润发大撒旦法阿萨德发阿萨德发阿斯钢傻大个阿萨德噶色调阿萨德阿萨德发\"},{\"type\":\"多图\",\"value\":[\"http://47.96.43.115/userActiveFile/17059767/image/201947/wx8b8459c0c44cb46d.o6zAJs5OwFyTnt5BT3u1Jrd2mL0c.IOtETUx6nTxM6af0c95ee719c449047ecb2a85410c9c.jpg\",\"http://47.96.43.115/userActiveFile/17059767/image/201947/wx8b8459c0c44cb46d.o6zAJs5OwFyTnt5BT3u1Jrd2mL0c.yBhVcD0oWaJC7ea3569e9cb36cdae30648d7879b5018.png\",\"http://47.96.43.115/userActiveFile/17059767/image/201947/wx8b8459c0c44cb46d.o6zAJs5OwFyTnt5BT3u1Jrd2mL0c.ozywuy52JTz3fe8a706c8c97612e3b231ed21fcff418.jpg\",\"http://47.96.43.115/userActiveFile/17059767/image/201947/wx8b8459c0c44cb46d.o6zAJs5OwFyTnt5BT3u1Jrd2mL0c.ydjNTSfcVPcdd6c6f5da1fd807790c0069585d380cc1.jpg\",\"http://47.96.43.115/userActiveFile/17059767/image/201947/wx8b8459c0c44cb46d.o6zAJs5OwFyTnt5BT3u1Jrd2mL0c.Ygbntn1rkFFp11fc2a39e275bbd5bcf5ec9d137e5448.jpg\",\"http://47.96.43.115/userActiveFile/17059767/image/201947/wx8b8459c0c44cb46d.o6zAJs5OwFyTnt5BT3u1Jrd2mL0c.1oicwVw2gBKN85c630f9de4af67a5c45180888961475.jpg\",\"http://47.96.43.115/userActiveFile/17059767/image/201947/wx8b8459c0c44cb46d.o6zAJs5OwFyTnt5BT3u1Jrd2mL0c.M4nlg9omSrAa707b1f665fdab1e6a9a78ee93177beba.png\",\"http://47.96.43.115/userActiveFile/17059767/image/201947/wx8b8459c0c44cb46d.o6zAJs5OwFyTnt5BT3u1Jrd2mL0c.OR4VmbEIZu9t306ca8c3be45212eeadc6865fa2fc3ae.png\",\"http://47.96.43.115/userActiveFile/17059767/image/201947/wx8b8459c0c44cb46d.o6zAJs5OwFyTnt5BT3u1Jrd2mL0c.eBTpszoHZGMhc9c0d92e3facde96706b46a790822fb8.jpg\"]},{\"type\":\"文字\",\"value\":\"第三个是的弗格森都发生过的发\"}]","o_list_info":"null","most_optional":null,"hide":0,"start_time":null,"end_time":null,"locale":"{\"count\":1,\"zoneFlag\":true,\"placeList\":[]}","background":null,"user_secret":null,"leave_msg":null,"all_count":10,"start_price":10,"start_price_mode":0,"show_user_info":0,"pay_mode":0,"reward_setting":"{\"publicFlag\":true,\"placeFlag\":false,\"placeList\":[],\"surpriseFlag\":false,\"surpriseAmount\":0,\"surpriseCount\":0,\"shareFlag\":false,\"shareList\":[]}","tips":"","create_time":1557196016243,"alter_time":1557487945843,"share_num":1,"hidden":0,"logistics_mode":null,"notice_num":0,"show_reward_rule":0,"reward_amount":null,"reward_num":0,"reward_locale":null,"use_reward":0,"use_share_reward":0,"use_reward_locale":0,"all_attend_cost":246.1,"retAttendRecords":[{"attend_id":98,"userid":17059767,"active_id":19,"time":1558156283800,"comments":"1111","active_creator_comments":"","reward_money":0,"active_content":"active_content","attend_cost":41,"state":1,"active_index":7,"phone":null,"real_name":null,"addr":null,"order_id":"BK155815628379917059767","logistics":"{\"type\":\"去设置\",\"items\":[]}","read_state":1,"payment_state":3,"refund_num":0,"refund_state":0,"pay_type":0,"name":"🇳 🇪 🇳 🇬","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKR2CX866DCJ90TXtmaZWdHu3oBzvib2zu03IFvQjebXfK0sicGW53GQd85Cz97aKic6Q4VzogHMZlsA/132","activeRecordsGoods":[{"group_way_id":37,"attend_id":98,"num":1,"name":"烤羊肉","size":"1斤","price":40,"sign_in":1},{"group_way_id":38,"attend_id":98,"num":1,"name":"花生米","size":"1斤","price":1,"sign_in":1}]},{"attend_id":15,"userid":40052945,"active_id":19,"time":1557284615894,"comments":"123123","active_creator_comments":"","reward_money":0,"active_content":"active_content","attend_cost":41,"state":1,"active_index":6,"phone":"1231231","real_name":"123123","addr":"123123","order_id":"BK155728461583840052945","logistics":null,"read_state":1,"payment_state":0,"refund_num":0,"refund_state":0,"pay_type":0,"name":"BigBinChan","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJWddt1Ficn6dUibWsQO2mFYvibnAgELnyTVloCbko7d4WuPMfxLzmQIRxEuUABgMOr9KFiaa2hK1h4IQ/132","activeRecordsGoods":[]},{"attend_id":14,"userid":40052945,"active_id":19,"time":1557284356942,"comments":"123123","active_creator_comments":"","reward_money":0,"active_content":"active_content","attend_cost":41,"state":1,"active_index":5,"phone":"1231231","real_name":"123123","addr":"123123","order_id":"BK155728435688440052945","logistics":null,"read_state":1,"payment_state":0,"refund_num":0,"refund_state":0,"pay_type":0,"name":"BigBinChan","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJWddt1Ficn6dUibWsQO2mFYvibnAgELnyTVloCbko7d4WuPMfxLzmQIRxEuUABgMOr9KFiaa2hK1h4IQ/132","activeRecordsGoods":[]},{"attend_id":13,"userid":40052945,"active_id":19,"time":1557284295020,"comments":"123123","active_creator_comments":"","reward_money":0,"active_content":"active_content","attend_cost":41,"state":1,"active_index":4,"phone":"1231231","real_name":"123123","addr":"123123","order_id":"BK155728429496140052945","logistics":null,"read_state":1,"payment_state":0,"refund_num":0,"refund_state":0,"pay_type":0,"name":"BigBinChan","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJWddt1Ficn6dUibWsQO2mFYvibnAgELnyTVloCbko7d4WuPMfxLzmQIRxEuUABgMOr9KFiaa2hK1h4IQ/132","activeRecordsGoods":[]},{"attend_id":12,"userid":40052945,"active_id":19,"time":1557284184347,"comments":"123123","active_creator_comments":"","reward_money":0,"active_content":"active_content","attend_cost":41,"state":1,"active_index":3,"phone":"1231231","real_name":"123123","addr":"123123","order_id":"BK155728418428840052945","logistics":null,"read_state":1,"payment_state":0,"refund_num":0,"refund_state":0,"pay_type":0,"name":"BigBinChan","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJWddt1Ficn6dUibWsQO2mFYvibnAgELnyTVloCbko7d4WuPMfxLzmQIRxEuUABgMOr9KFiaa2hK1h4IQ/132","activeRecordsGoods":[]},{"attend_id":11,"userid":40052945,"active_id":19,"time":1557284116861,"comments":"123123","active_creator_comments":"","reward_money":0,"active_content":"active_content","attend_cost":41,"state":4,"active_index":2,"phone":"1231231","real_name":"123123","addr":"123123","order_id":"BK155728411680340052945","logistics":null,"read_state":1,"payment_state":0,"refund_num":0,"refund_state":0,"pay_type":0,"name":"BigBinChan","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJWddt1Ficn6dUibWsQO2mFYvibnAgELnyTVloCbko7d4WuPMfxLzmQIRxEuUABgMOr9KFiaa2hK1h4IQ/132","activeRecordsGoods":[{"group_way_id":30,"attend_id":11,"num":1,"name":"花生","size":"1斤","price":0.5,"sign_in":1}]},{"attend_id":10,"userid":17059767,"active_id":19,"time":1556000235972,"comments":"","active_creator_comments":"","reward_money":0,"active_content":null,"attend_cost":0.1,"state":2,"active_index":1,"phone":null,"real_name":null,"addr":null,"order_id":null,"logistics":null,"read_state":1,"payment_state":0,"refund_num":0,"refund_state":0,"pay_type":0,"name":"🇳 🇪 🇳 🇬","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKR2CX866DCJ90TXtmaZWdHu3oBzvib2zu03IFvQjebXfK0sicGW53GQd85Cz97aKic6Q4VzogHMZlsA/132","activeRecordsGoods":[{"group_way_id":35,"attend_id":10,"num":1,"name":"12123","size":"350","price":1,"sign_in":3},{"group_way_id":36,"attend_id":10,"num":1,"name":"烤兔子","size":"1斤","price":20,"sign_in":1},{"group_way_id":37,"attend_id":10,"num":1,"name":"烤羊肉","size":"1斤","price":40,"sign_in":1},{"group_way_id":38,"attend_id":10,"num":2,"name":"花生米","size":"1斤","price":1,"sign_in":2}]}],"group_way":[{"group_way_id":35,"active_id":19,"url":"[]","name":"12123","size":"350","price":1,"stock":5,"good_class_id":1,"desc":"","ensure":"","join_num":2,"class_name":"sdv"},{"group_way_id":36,"active_id":19,"url":"[]","name":"烤兔子","size":"1斤","price":20,"stock":4,"good_class_id":2,"desc":"","ensure":"","join_num":3,"class_name":"bbb"},{"group_way_id":37,"active_id":19,"url":"[]","name":"烤羊肉","size":"1斤","price":40,"stock":6,"good_class_id":null,"desc":"","ensure":"","join_num":0,"class_name":null},{"group_way_id":38,"active_id":19,"url":"[]","name":"花生米","size":"1斤","price":1,"stock":2,"good_class_id":null,"desc":"","ensure":"","join_num":0,"class_name":null},{"group_way_id":45,"active_id":19,"url":"[]","name":"wer2","size":"1","price":1,"stock":1,"good_class_id":0,"desc":"","ensure":"","join_num":0,"class_name":null}],"activeAttendCount":7,"activeReadCount":4,"activesMyAllShareReward":0,"leave_msg_data":[{"name":"8J+HsyDwn4eqIPCfh7Mg8J+HrA==","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKR2CX866DCJ90TXtmaZWdHu3oBzvib2zu03IFvQjebXfK0sicGW53GQd85Cz97aKic6Q4VzogHMZlsA/132","leave_msg_id":1,"active_id":19,"userid":17059767,"leave_msg":"sdsfsdf","msg_type":"0","create_time":null},{"name":"8J+HsyDwn4eqIPCfh7Mg8J+HrA==","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKR2CX866DCJ90TXtmaZWdHu3oBzvib2zu03IFvQjebXfK0sicGW53GQd85Cz97aKic6Q4VzogHMZlsA/132","leave_msg_id":2,"active_id":19,"userid":17059767,"leave_msg":"测试","msg_type":"0","create_time":1557900525238}],"my_active_records":[{"attend_id":98,"userid":17059767,"active_id":19,"time":1558156283800,"comments":"1111","active_creator_comments":"","reward_money":0,"active_content":"active_content","attend_cost":41,"state":1,"active_index":7,"phone":null,"real_name":null,"addr":null,"order_id":"BK155815628379917059767","logistics":"{\"type\":\"去设置\",\"items\":[]}","read_state":1,"payment_state":3,"refund_num":0,"refund_state":0,"pay_type":0,"name":"🇳 🇪 🇳 🇬","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKR2CX866DCJ90TXtmaZWdHu3oBzvib2zu03IFvQjebXfK0sicGW53GQd85Cz97aKic6Q4VzogHMZlsA/132","activeRecordsGoods":[{"group_way_id":37,"attend_id":98,"num":1,"name":"烤羊肉","size":"1斤","price":40,"sign_in":1},{"group_way_id":38,"attend_id":98,"num":1,"name":"花生米","size":"1斤","price":1,"sign_in":1}]},{"attend_id":10,"userid":17059767,"active_id":19,"time":1556000235972,"comments":"","active_creator_comments":"","reward_money":0,"active_content":null,"attend_cost":0.1,"state":2,"active_index":1,"phone":null,"real_name":null,"addr":null,"order_id":null,"logistics":null,"read_state":1,"payment_state":0,"refund_num":0,"refund_state":0,"pay_type":0,"name":"🇳 🇪 🇳 🇬","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKR2CX866DCJ90TXtmaZWdHu3oBzvib2zu03IFvQjebXfK0sicGW53GQd85Cz97aKic6Q4VzogHMZlsA/132","activeRecordsGoods":[{"group_way_id":35,"attend_id":10,"num":1,"name":"12123","size":"350","price":1,"sign_in":3},{"group_way_id":36,"attend_id":10,"num":1,"name":"烤兔子","size":"1斤","price":20,"sign_in":1},{"group_way_id":37,"attend_id":10,"num":1,"name":"烤羊肉","size":"1斤","price":40,"sign_in":1},{"group_way_id":38,"attend_id":10,"num":2,"name":"花生米","size":"1斤","price":1,"sign_in":2}]}],"invitor_num":3,"share_reward_rule":[{"share_reward_rule_id":1,"active_id":19,"num":2,"reward_money":2,"create_time":null,"alter_time":null}]},"errcode":0,"errmsg":"ok"}

        * @return_param userid number 发布接龙的用户id
        * @return_param name number 发布接龙的用户名称
        * @return_param headimg number 发布接龙的用户头像
        * @return_param active_id number 接龙id
        * @return_param active_type  number 接龙类型，1：报名接龙-enlist，2：团购接龙-buy，3：互动接龙-interact，4：拼团接龙-assemble，5：阅读接龙-read，6：评选接龙-select，7：费用接龙-cost
        * @return_param phone  number 客服电话  
        * @return_param title  string 主题  
        * @return_param state  number 活动状态，0：保存预览，1：发布，2：完成，3：隐藏
        * @return_param list_info  array 列表内容，json数组对象，（dataType,1：文字，2：图片，3：视频）
        * @return_param o_list_info  array 列表内容，json数组对象，（报名接龙和互动接龙有效）（dataType,1：填写项，2：图片，3：视频,4:语音，5：位置，6：单选项，7：多选项）,
        * @return_param group_way  array 拼团方式，json数组对象，（报名项目、团购商品、拼团商品、选项、筹款等栏目）
        * @return_param most_optional  number 最多可选（只有在评选接龙才有效，1：最多可选1项，2：最多可选2项）
        * @return_param hide  number 传播隐私，0：所有人均可转发，1：隐藏接龙且所有人均可转发，2：只有发布者可以转发
        * @return_param start_time  number 活动开始时间，毫秒时间戳
        * @return_param end_time  number 活动结束时间，毫秒时间戳
        * @return_param locale  string 活动地点
        * @return_param background  number 活动背景(不知道有什么用，传0)
        * @return_param user_secret  number 用户隐私设置，0：公开所有参与者信息，1：匿名所有参与者信息
        * @return_param leave_msg number  留言设置，0：参与者无需留言，1：参与者可留言(不传默认0）
        * @return_param all_count number 接龙次数，-999：无限次(不传默认-999）
        * @return_param start_price number 接龙起购价(不传默认0）
        * @return_param start_price_mode number 接龙起购价模式，0：每次接龙需满足的起购金额，1：只需满足第一次的起购金额
        * @return_param show_user_info number 参与人显示，0：头像+微信名，1：头像+微信名匿名，2：头像，3：微信名，4：微信名匿名(不传默认0）
        * @return_param pay_mode number 确认接龙方式，0：支付后完成接龙，1：先完成接龙暂不支付(不传默认0）
        * @return_param reward_setting array 接龙奖励设置，json数组对象，（奖励费用、是否公开奖励规则、设定奖励区域范围、参与接龙有镜像、分享有奖励等）
        * @return_param tips string 填写让参与人注意的重要信息
        * @return_param create_time number 接龙创建时间
        * @return_param alter_time number 接龙最后修改时间
        * @return_param share_num number 转发次数
        * @return_param hidden number 是否隐藏，0：显示，1：隐藏
        * @return_param logistics_mode  object json对象,物流方式设置
        * @return_param show_reward_rule  number 是否公开奖励规则，0：公开，1：隐藏
        * @return_param reward_amount  number 奖励总金额
        * @return_param reward_num  number 红包数量
        * @return_param reward_locale  object json对象,设定奖励区域范围
        * @return_param use_reward  number 使用参与接龙获得奖励,0：不使用，1：使用
        * @return_param use_share_reward  number 使用分享接龙奖励，0：不使用，1：使用
        * @return_param use_reward_locale  number 使用奖励区域范围，0：不使用，1：使用
        * @return_param all_attend_cost  number 统计活动所有参加接龙的总费用
        * @return_param retAttendRecords array 接龙参与记录，该接口最多只会获取10条记录,get_attend_records接口获取更多的用户参与历史记录接口
        * @return_param retAttendRecords/comments  string 活动的凭证记录-用户备注
        * @return_param retAttendRecords/active_creator_comments  string 活动的凭证记录-发起人备注
        * @return_param retAttendRecords/reward_money  number 活动的凭证记录-接龙奖励金额
        * @return_param retAttendRecords/attend_cost  number 活动的凭证记录-接龙花费
        * @return_param retAttendRecords/state  number 活动的凭证记录-接龙状态，1：已参与，2：取消接龙，3：已完成接龙（收到货），4：申请取消
        * @return_param retAttendRecords/active_index  number 活动的凭证记录-接龙序号
        * @return_param retAttendRecords/payment_state  number 活动的凭证记录-支付状态，0：无需支付，1：待支付，2：取消支付，3：完成支付
        * @return_param retAttendRecords/refund_num  number 活动的凭证记录-退款金额
        * @return_param retAttendRecords/refund_state  number 活动的凭证记录-退款状态，0：无款项，1：已付款，2：申请退款中，3：退款成功
        * @return_param retAttendRecords/pay_type  number 活动的凭证记录-付款方式 0零钱 1为微信支付
        * @return_param retAttendRecords/activeRecordsGoods  array 活动的凭证记录-购买的商品信息
        * @return_param group_way  array 接龙的商品信息
        * @return_param activeAttendCount number 接龙参与人数
        * @return_param activeReadCount number 接龙阅读人数
        * @return_param activesMyAllShareReward  number 接龙我的分享奖励
        * @return_param leave_msg_data array 留言信息
        * @return_param leave_msg_data/leave_msg string 留言信息-内容
        * @return_param leave_msg_data/msg_type array 留言信息-留言类型，0：公开，1：私信
        * @return_param my_active_records array 我的凭证
        * @return_param invitor_num  number 我带来的人数
        * @return_param share_reward_rule  array 分享奖励规则
        * 
        * @remark 这里是备注信息
        * @number 1
        */
        async get_active_info(req, res) {
            let { token, active_id } = req.query;
            let user = req.user;




            if (active_id == null) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            let { userid, } = user;
            //获取活动详情
            let get_active_info = await db.get_active_info({ userid, active_id });
            if (!get_active_info) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let { userid: active_userid } = get_active_info;

            if (active_userid == userid) {
                //统计活动所有参加接龙的总费用
                let get_active_all_attend_cost = await db.get_active_all_attend_cost({ active_id })
                if (get_active_all_attend_cost) {
                    get_active_info.all_attend_cost = get_active_all_attend_cost.all_attend_cost
                }
            }

            

            let active_ids = `(${active_id})`;
            //获取活动的凭证记录
            let AttendRecordsData = await db.getUserAttendRecords_by_activeIds({ active_ids, start: 0, rows: 10 });
            //获取接龙的商品信息
            let groupWayData = await db.get_group_way_by_activeIds({ active_ids });
            //接龙参加的凭证数量
            let activeAttendCount = await db.getActivesAttendCount_by_activeIds({ active_ids });
            //接龙看过的总人数
            let activeReadCount = await db.getActivesReadCount_by_activeIds({ active_ids });

            //接龙我的分享奖励
            let activesMyAllShareReward = await db.getActivesMyAllShareReward_by_activeIds({ active_ids, userid });

            //接龙分享奖励规则
            let activesShareRewardRule = await db.activesShareRewardRule_by_activeIds({ active_ids });

            //获取活动留言
            let get_leave_msg = await db.get_leave_msg_list({ userid, active_id });
            if (!get_leave_msg) {
                get_leave_msg = []
            }
            //获取我的凭证
            let get_my_active_records = await db.get_my_active_records({ userid, active_id })
            if (!get_my_active_records) {
                get_my_active_records = []
            }

            //获取我带来的人数
            let get_invitor_num = await db.get_invitor_num({ userid, active_id })
            if (!get_invitor_num) {
                get_invitor_num = 0
            }

            //获取活动限制地址列表
            let get_locale = await db.get_active_locale({ active_id, type:0 })
            if (!get_locale) {
                get_locale = []
            }

            //获取活动奖励限制地址列表
            let get_reward_locale = await db.get_active_locale({ active_id, type:1 })
            if (!get_reward_locale) {
                get_reward_locale = []
            }

            //获取用户接龙的奖励
            let get_user_reward = await db.get_user_reward({ active_id, userid })
            if (!get_user_reward) {
                get_user_reward =  {
                    all_count: 0,
                    all_money: 0,
                };
            }

            //获取接龙的奖励信息
            let get_active_reward_info = await db.get_active_reward_info(active_id);
            if(!get_active_reward_info){
                get_active_reward_info =  {
                    all_count: 0,
                    all_money: 0,
                };
            }
             //获取用户接龙的分享奖励
             let get_user_share_reward = await db.get_user_share_reward({ active_id, userid })
             if (!get_user_share_reward) {
                 get_user_share_reward =  {
                     all_count: 0,
                     all_money: 0,
                 };
             }
            

            get_active_info.retAttendRecords = AttendRecordsData[active_id] || [];
            get_active_info.group_way = groupWayData[active_id] || [];
            get_active_info.activeAttendCount = activeAttendCount[active_id] || 0;
            get_active_info.activeReadCount = activeReadCount[active_id] || 0
            get_active_info.activesMyAllShareReward = activesMyAllShareReward[active_id] || 0;
            get_active_info.leave_msg_data = get_leave_msg;
            get_active_info.my_active_records = get_my_active_records;
            get_active_info.invitor_num = get_invitor_num;

            get_active_info.locale = {count:get_active_info.local_area_count, placeList:get_locale};
            get_active_info.reward_locale = {count:get_active_info.reward_local_area_count, placeList:get_reward_locale};
            
            get_active_info.reward_count = get_active_reward_info.all_count;
            get_active_info.user_reward_money = get_user_reward.all_money;
            get_active_info.user_share_reward_money = get_user_share_reward.all_money;

            get_active_info.share_reward_rule = activesShareRewardRule[active_id] || [];
            http.send(res, RET_OK, { data: get_active_info });

        }


        /**
        * showdoc
        * @catalog 首页
        * @title 首页历史搜索记录
        * @description 首页历史搜索记录接口
        * @method get
        * @url https://xxx:9001/get_index_search_history
        * @param token 必选 string 用户凭证token  
        * @return {"data":[{"type":1,"value":"1"},{"type":1,"value":"121321"},{"type":1,"value":"2"}],"errcode":0,"errmsg":"ok"}
        * @return_param type number 搜索的类型，1：全部，2：我发布的，3：我参与的，4：最近浏览 
        * @return_param value string 搜索的内容
        * 
        * @remark 这里是备注信息
        * @number 1
        */
        async get_index_search_history(req, res) {
            let { token, } = req.query;
            let user = req.user;



            let { userid, } = user;
            let rd_key = `${INDEX_SEARCH_HISTORY}:${userid}`

            let index_search_history = await redis.lrange(rd_key, 0, -1)
            if (!index_search_history) {
                index_search_history = [];
            }

            http.send(res, RET_OK, { data: index_search_history });

        }



        /**
        * showdoc
        * @catalog 首页
        * @title 删除首页历史搜索记录
        * @description 删除首页历史搜索记录接口
        * @method get
        * @url https://xxx:9001/del_index_search_history
        * @param token 必选 string 用户凭证token  
        * @return {"data":1,"errcode":0,"errmsg":"ok"}
        * @remark 这里是备注信息
        * @number 1
        */
        async del_index_search_history(req, res) {
            let { token, } = req.query;
            let user = req.user;



            let { userid, } = user;
            let rd_key = `${INDEX_SEARCH_HISTORY}:${userid}`
            let del_index_search_history = await redis.del(rd_key)
            if (!del_index_search_history) {
                del_index_search_history = { subscribeData: [], subscribeCount: 0 };
            }

            http.send(res, RET_OK, { data: del_index_search_history });

        }



    }

    return httpController;
};
