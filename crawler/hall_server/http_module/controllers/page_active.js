
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
        * @catalog 发布接龙
        * @title 获取接龙类型列表
        * @description 接龙类型列表接口
        * @method get
        * @url https://xxx:9001/get_activetype_list
        * @param token 必选 string 用户凭证token  
        * @return {"data":{"activeCount":3,"attendActiveCount":1,"userCount":1,"getActiveList":[{"active_type":1,"name_en":"enlist","name_cn":"报名接龙","state":1,"description":"适用于各种活动报名，自动统计，简单高效","last_attend_time":1555061812140},{"active_type":2,"name_en":"buy","name_cn":"团购接龙","state":1,"description":"服务于团购活动的接龙，轻松统计订单、收款","last_attend_time":1555061912140},{"active_type":3,"name_en":"interact","name_cn":"互动接龙","state":1,"description":"用于参加多媒体的话题互动、信息收集、观点陈述","last_attend_time":null},{"active_type":4,"name_en":"assemble","name_cn":"拼团接龙","state":1,"description":"发布多阶梯的减价拼团接龙，人数越多越便宜","last_attend_time":null},{"active_type":5,"name_en":"read","name_cn":"阅读接龙","state":1,"description":"用于发布重要信息，获取参与者的反馈","last_attend_time":null},{"active_type":6,"name_en":"select","name_cn":"评选接龙","state":1,"description":"使用于投票、评选、调查等常见统计场所","last_attend_time":null},{"active_type":7,"name_en":"cost","name_cn":"费用接龙","state":1,"description":"服务于集体、班级收款，社群捐款、收款等场景","last_attend_time":null}]},"errcode":0,"errmsg":"ok"}
        * @return_param activeCount number 总接龙数量
        * @return_param attendActiveCount number 参与接龙的总人数
        * @return_param userCount number 总访问数量（总人数）
        * @return_param getActiveList object 所有接龙类型列表
        * @return_param active_type number 接龙类型，1：报名接龙-enlist，2：团购接龙-buy，3：互动接龙-interact，4：拼团接龙-assemble，5：阅读接龙-read，6：评选接龙-select，7：费用接龙-cost
        * @return_param name_en string 接龙类别英文名
        * @return_param name_cn string 接龙类别中文名
        * @return_param state number 接龙上架状态，0，下架，1：上架
        * @return_param description string 接龙描述
        * @return_param last_attend_time number 该类型接龙中上次发布时间，未发布过为null
        * @remark 这里是备注信息
        * @number 1
        */
        async get_activetype_list(req, res) {
            let { token } = req.query;
            let user = req.user;


            let { userid, } = user;
            let activeCountData = await db.getActiveCount();
            let attendActiveCountData = await db.getAttendActiveCount();
            let userCountData = await db.getUserCount();

            let activeCount = activeCountData ? activeCountData.activeCount : 0;
            let attendActiveCount = attendActiveCountData ? attendActiveCountData.attendActiveCount : 0;
            let userCount = userCountData ? userCountData.userCount : 0;


            let getActiveList = await db.getActiveTypeList_user({ userid });
            if (!getActiveList) {
                getActiveList = []
            }
            http.send(res, RET_OK, { data: { activeCount, attendActiveCount, userCount, getActiveList } });

        }
        /**
        * showdoc
        * @catalog 发布接龙
        * @title 发布接龙
        * @description 发布接龙接口
        * @method post
        * @url https://xxx:9001/publish_active
        * @param token 必选 string 用户凭证token 
        * @param active_type 必选 number 接龙类型，1：报名接龙-enlist，2：团购接龙-buy，3：互动接龙-interact，4：拼团接龙-assemble，5：阅读接龙-read，6：评选接龙-select，7：费用接龙-cost
        * @param phone 必选 number 客服电话  
        * @param title 必选 string 主题  
        * @param state 必选 number 活动状态，0：保存预览，1：发布，2：完成 
        * @param list_info 可选  array 列表内容，json数组对象，（dataType,1：文字，2：图片，3：视频）
        * @param o_list_info 可选  array 列表内容，json数组对象，（报名接龙和互动接龙有效）（dataType,1：填写项，2：图片，3：视频,4:语音，5：位置，6：单选项，7：多选项）,
        * @param group_way 必选 array 拼团方式，json数组对象，（报名项目、团购商品、拼团商品、选项、筹款等栏目）
        * @param most_optional 必选 number 最多可选（只有在评选接龙才有效，1：最多可选1项，2：最多可选2项）
        * @param hide 必选 number 传播隐私，0：所有人均可转发，1：隐藏接龙且所有人均可转发，2：只有发布者可以转发
        * @param start_time 必选 number 活动开始时间，毫秒时间戳
        * @param end_time 必选 number 活动结束时间，毫秒时间戳
        * @param background 必选 number 活动背景 (不知道有什么用，传0)
        * @param user_secret 必选 number 用户隐私设置，0：公开所有参与者信息，1：匿名所有参与者信息
        * @param leave_msg 可选 number  留言设置，0：参与者无需留言，1：参与者可留言(不传默认0）
        * @param all_count 可选 number 接龙次数，-999：无限次(不传默认-999）
        * @param start_price 可选 number 接龙起购价(不传默认0）
        * @param start_price_mode 可选 number 接龙起购价模式，0：每次接龙需满足的起购金额，1：只需满足第一次的起购金额
        * @param show_user_info 可选 number 参与人显示，0：头像+微信名，1：头像+微信名匿名，2：头像，3：微信名，4：微信名匿名(不传默认0）
        * @param pay_mode 可选 number 确认接龙方式，0：支付后完成接龙，1：先完成接龙暂不支付(不传默认0）
        * @param tips 可选 string 填写让参与人注意的重要信息
        * @param logistics_mode 可选 object json对象,物流方式设置
        * 
        * @param show_reward_rule 可选 number 是否公开奖励规则，0：公开，1：隐藏
        * @param reward_amount 可选 number 奖励总金额
        * @param reward_num 可选 number 红包数量
        * @param use_reward 可选 number 使用参与接龙获得奖励,0：不使用，1：使用
        * @param use_share_reward 可选 number 使用分享接龙奖励，0：不使用，1：使用
        * @param use_reward_locale 可选 number 使用奖励区域范围，0：不使用，1：使用
        * @param share_reward_rule 可选 object json对象分享奖励，数据结构[{num:1,reward_money:22.13}]
        * @param use_local 可选 number 是否使用地址 , 0：不使用，1：使用
        * @param local_area_count 可选 number 地址限制的公里数
        * @param local_list 可选 array 活动限制地址列表：数据结构[{latitude:1,longitude:22.13,name:'广东省',address:'广州市番禺区'}]
        * @param reward_local_area_count 可选 number 奖励地址限制的公里数
        * @param reward_local_list 可选 array 活动限制地址列表：数据结构[{latitude:1,longitude:22.13,name:'广东省',address:'广州市番禺区'}]
        * 
        * @return {"data":{"active_id":1},"errcode":0,"errmsg":"ok"}
        * @return_param last_attend_time number 该类型接龙中上次发布时间，未发布过为null
        * @remark 这里是备注信息
        * @number 2
        */
        async publish_active(req, res) {
            let { token } = req.query;
            let { active_type, phone, title, state, list_info, o_list_info, group_way,
                most_optional, hide, start_time, end_time, background, user_secret,
                leave_msg, all_count, start_price,start_price_mode, show_user_info, pay_mode, reward_setting, 
                tips, logistics_mode, show_reward_rule, reward_amount, reward_num, 
                use_reward,use_share_reward,use_reward_locale,share_reward_rule,
                use_local,local_area_count,local_list, reward_local_area_count, reward_local_list  } = req.body;

            let user = req.user;


            if (!await this.check_activeType(active_type)) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let { userid } = user;
            try {
                group_way = JSON.parse(group_way)
            } catch (error) {
            }
            try {
                local_list = JSON.parse(local_list)
            } catch (error) {
            }
            try {
                reward_local_list = JSON.parse(reward_local_list)
            } catch (error) {
            }
            try {
                share_reward_rule = JSON.parse(share_reward_rule)
            } catch (error) {
            }
            group_way == null ? group_way = [] : null;
            share_reward_rule == null ? share_reward_rule = [] : null;

            phone == null ? phone = null : null;
            o_list_info == null ? o_list_info = null : null;

            if(use_reward == 1){
                if(reward_amount>0 && reward_num>0){

                }else{
                    return http.send(res, INVALID_PARAMETER);
                }
            }
            let add_user_active = await db.add_user_active({
                originator_id: userid, active_type, phone, title, state, list_info, o_list_info, group_way,
                most_optional, hide, start_time, end_time, background, user_secret,
                leave_msg, all_count, start_price,start_price_mode, show_user_info, pay_mode, reward_setting, tips, logistics_mode,
                show_reward_rule, reward_amount, reward_num,use_reward,use_share_reward,use_reward_locale, share_reward_rule,
                use_local, local_area_count, local_list, reward_local_area_count, reward_local_list 
            })
            if (!add_user_active) {
                http.send(res, OPERATE_FAILED);
                return;
            } else {
                // exports.dec_user_money = async function (userid, money, note, title, orderid, attend_id) {
                if(use_reward == 1 && reward_amount>0 ){
                    var suc = await db.dec_user_money(userid, reward_amount, "reward", `接龙创建红包`, null, null)
                }

                http.send(res, RET_OK, { data: { active_id: add_user_active } });
            }


        }

        /**
        * showdoc
        * @catalog 发布接龙
        * @title 修改接龙
        * @description 修改接龙接口
        * @method post
        * @url https://xxx:9001/update_active
        * @param token 必选 string 用户凭证token 
        * @param active_id 必选 number 接龙id  
        * @param phone 可选 number 客服电话  
        * @param title 可选 string 主题  
        * @param state 可选 number 活动状态，0：保存预览，1：发布，2：完成 
        * @param list_info 可选  array 列表内容，json数组对象，（dataType,1：文字，2：图片，3：视频）
        * @param o_list_info 可选  array 列表内容，json数组对象，（报名接龙和互动接龙有效）（dataType,1：填写项，2：图片，3：视频,4:语音，5：位置，6：单选项，7：多选项）,
        * @param group_way 可选 array 拼团方式，json数组对象，（报名项目、团购商品、拼团商品、选项、筹款等栏目）
        * @param most_optional 可选 number 最多可选（只有在评选接龙才有效，1：最多可选1项，2：最多可选2项）
        * @param hide 可选 number 传播隐私，0：所有人均可转发，1：隐藏接龙且所有人均可转发，2：只有发布者可以转发
        * @param start_time 可选 number 活动开始时间，毫秒时间戳
        * @param end_time 可选 number 活动结束时间，毫秒时间戳
        * @param background 可选 number 活动背景(不知道有什么用，传0)
        * @param user_secret 可选 number 用户隐私设置，0：公开所有参与者信息，1：匿名所有参与者信息
        * @param leave_msg 可选 number  留言设置，0：参与者无需留言，1：参与者可留言(不传默认0）
        * @param all_count 可选 number 接龙次数，-999：无限次(不传默认-999）
        * @param start_price 可选 number 接龙起购价(不传默认0）
        * @param start_price_mode 可选 number 接龙起购价模式，0：每次接龙需满足的起购金额，1：只需满足第一次的起购金额
        * @param show_user_info 可选 number 参与人显示，0：头像+微信名，1：头像+微信名匿名，2：头像，3：微信名，4：微信名匿名(不传默认0）
        * @param pay_mode 可选 number 确认接龙方式，0：支付后完成接龙，1：先完成接龙暂不支付(不传默认0）
        * @param reward_setting 可选 array 接龙奖励设置，json数组对象，（奖励费用、是否公开奖励规则、设定奖励区域范围、参与接龙有镜像、分享有奖励等）
        * @param tips 可选 string 填写让参与人注意的重要信息
        * @param logistics_mode 可选 object json对象,物流方式设置
        * @param show_reward_rule 可选 number 是否公开奖励规则，0：公开，1：隐藏
        * @param reward_amount 可选 number 奖励总金额
        * @param reward_num 可选 number 红包数量
        * @param use_reward 可选 number 使用参与接龙获得奖励,0：不使用，1：使用
        * @param use_share_reward 可选 number 使用分享接龙奖励，0：不使用，1：使用
        * @param use_reward_locale 可选 number 使用奖励区域范围，0：不使用，1：使用
        * @param share_reward_rule 可选 object json对象分享奖励，数据结构[{share_reward_rule_id:1,num:1,reward_money:22.13}]
        * @param use_local 可选 number 是否使用地址 , 0：不使用，1：使用
        * @param local_area_count 可选 number 地址限制的公里数
        * @param local_list 可选 array 活动限制地址列表：数据结构[{latitude:1,longitude:22.13,name:'广东省',address:'广州市番禺区'}]
        * @param reward_local_area_count 可选 number 奖励地址限制的公里数
        * @param reward_local_list 可选 array 活动限制地址列表：数据结构[{latitude:1,longitude:22.13,name:'广东省',address:'广州市番禺区'}]
        * 
        * @return {"data":true,"errcode":0,"errmsg":"ok"}
        * @remark 这里是备注信息
        * @number 2
        */
        async update_active(req, res) {
            let { token } = req.query;

   

            let { active_id, phone, title, state, list_info, o_list_info, group_way,
                most_optional, hide, start_time, end_time, background, user_secret,
                leave_msg, all_count, start_price, start_price_mode, show_user_info, pay_mode, reward_setting, 
                tips, logistics_mode, show_reward_rule, reward_amount, reward_num, 
                use_reward, use_share_reward,use_reward_locale,share_reward_rule, 
                use_local,local_area_count, local_list, reward_local_area_count, reward_local_list } = req.body;

            if (active_id == null) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let user = req.user;


            let { userid } = user;

            let active = await db.get_active_by_id(active_id)
            if (!active) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            if (active.originator_id != userid) {
                http.send(res, NO_PERMISSION);
                return;
            }

            try {
                group_way = JSON.parse(group_way)
            } catch (error) {
            }
            try {
                local_list = JSON.parse(local_list)
            } catch (error) {
            }
            try {
                reward_local_list = JSON.parse(reward_local_list)
            } catch (error) {
            }
            try {
                share_reward_rule = JSON.parse(share_reward_rule)
            } catch (error) {
            }
            group_way == null ? group_way = [] : null;
            share_reward_rule == null ? share_reward_rule = [] : null;

            if(use_reward == 1){
                if(reward_amount>0 && reward_num>0){
                    
                  

                }else{
                    return http.send(res, INVALID_PARAMETER);
                }
            }

            // let old_reward_amount  = active.reward_amount;
            // let old_reward_num  = active.reward_num;
            // let old_remain_reward_amount  = active.remain_reward_amount;
            // let old_remain_reward_num  = active.remain_reward_num;
            

            // let update_user_active = await db.update_user_active({
            //     active_id, phone, title, state, list_info, o_list_info, group_way,
            //     most_optional, hide, start_time, end_time, background, user_secret,
            //     leave_msg, all_count, start_price, start_price_mode, show_user_info, pay_mode, reward_setting, 
            //     tips, logistics_mode,show_reward_rule, reward_amount:Number(old_reward_amount)+Number(reward_amount), reward_num:Number(old_reward_num)+Number(reward_num),
            //     remain_reward_amount:Number(old_remain_reward_amount)+Number(reward_amount),remain_reward_num:Number(old_remain_reward_num)+Number(reward_num),
            //     use_reward, use_share_reward,use_reward_locale,share_reward_rule, 
            //     use_local, local_area_count, local_list, reward_local_area_count, reward_local_list
            // })
            let update_user_active = await db.update_user_active({
                active_id, phone, title, state, list_info, 
                o_list_info, group_way, most_optional, hide, start_time, 
                end_time, background, user_secret, leave_msg, all_count, 
                start_price, start_price_mode, show_user_info, pay_mode, reward_setting, 
                tips, logistics_mode, show_reward_rule, reward_amount, reward_num, 
                use_reward, use_share_reward, use_reward_locale, share_reward_rule, use_local, 
                local_area_count, local_list,reward_local_area_count, reward_local_list
            })
            if (!update_user_active) {
                http.send(res, OPERATE_FAILED);
                return;
            }

            if(use_reward == 1 && reward_amount>0 ){
                var suc = await db.dec_user_money(userid, reward_amount, "reward", `接龙修改添加红包`, null, null)
            }

            http.send(res, RET_OK, { data: update_user_active });

        }
        //校验活动类型
        async check_activeType(active_type) {
            let getActiveTypeList = await db.getActiveTypeList(active_type);
            if (!getActiveTypeList) {
                return false;
            }

            return true;

        }




        /**
       * showdoc
       * @catalog 发布接龙
       * @title 获取接龙的用户参与历史记录
       * @description 获取接龙的用户参与历史记录接口
       * @method get
       * @url https://xxx:9001/get_attend_records
       * @param token 必选 string 用户凭证token  
       * @param page 可选 number 页数，每页返回10条数据，不传返回第一页
       * @param active_id 可选 number 接龙id
       * @return {"data":[{"attend_id":1,"userid":519207,"active_id":1,"time":1556000235979,"comments":null,"reward_money":0,"active_content":null,"attend_cost":10,"state":1,"active_index":7},{"attend_id":2,"userid":519207,"active_id":1,"time":1556000235978,"comments":null,"reward_money":0,"active_content":null,"attend_cost":30.6,"state":1,"active_index":6},{"attend_id":3,"userid":123456,"active_id":1,"time":1556000235977,"comments":null,"reward_money":0,"active_content":null,"attend_cost":20.3,"state":1,"active_index":5},{"attend_id":4,"userid":234567,"active_id":1,"time":1556000235976,"comments":null,"reward_money":0,"active_content":null,"attend_cost":21.4,"state":1,"active_index":4},{"attend_id":7,"userid":519207,"active_id":1,"time":1556000235973,"comments":null,"reward_money":0,"active_content":null,"attend_cost":0,"state":1,"active_index":3},{"attend_id":8,"userid":519207,"active_id":1,"time":1556000235972,"comments":null,"reward_money":0,"active_content":null,"attend_cost":0,"state":1,"active_index":2},{"attend_id":9,"userid":519207,"active_id":1,"time":1556000235971,"comments":null,"reward_money":0,"active_content":null,"attend_cost":0,"state":1,"active_index":1}],"errcode":0,"errmsg":"ok"}
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
        async get_attend_records(req, res) {
            let { token, page, active_id } = req.query;
            if (active_id == null) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            let user = req.user;


            let { userid, } = user;

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

            let getAttendRecords = await db.getAttendRecords({ userid, active_id, start, rows });
            if (!getAttendRecords) {
                getAttendRecords = []
            }
            http.send(res, RET_OK, { data: getAttendRecords });

        }


        /**
       * showdoc
       * @catalog 发布接龙
       * @title 不看这个接龙
       * @description 不看这个接龙的接口
       * @method get
       * @url https://xxx:9001/shield_active
       * @param token 必选 string 用户凭证token  
       * @param active_id 可选 number 接龙id
       * @return {"data":true,"errcode":0,"errmsg":"ok"}
       * @remark 这里是备注信息
       * @number 1
       */
        async shield_active(req, res) {
            let { token, active_id } = req.query;
            if (active_id == null) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            let user = req.user;


            let { userid, } = user;

            let shieldActive = await db.shieldActive({ userid, active_id });

            http.send(res, RET_OK, { data: shieldActive });

        }

        /**
       * showdoc
       * @catalog 发布接龙
       * @title 添加历史地理位置
       * @description 添加历史地理位置的接口
       * @method get
       * @url https://xxx:9001/add_history_local
       * @param token 必选 string 用户凭证token  
       * @param address 必选 string 详细地址
       * @param latitude 必选 string 纬度，范围为-90~90，负数表示南纬
       * @param longitude 必选 string 经度，范围为-180~180，负数表示西经
       * @param name 必选 string 位置名称
       * @return {"data":true,"errcode":0,"errmsg":"ok"}
       * @remark 这里是备注信息
       * @number 1
       */
        async add_history_local(req, res) {
            let { token, address, latitude, longitude, name } = req.query;
            if (name == null && address == null && latitude == null && longitude == null) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            let user = req.user;


            let { userid, } = user;

            let addHistoryLocal = await db.addHistoryLocal({ userid, name, address, latitude, longitude });

            http.send(res, RET_OK, { data: addHistoryLocal });

        }

         /**
         * showdoc
         * @catalog 发布接龙
         * @title 删除历史地理位置
         * @description 删除历史地理位置的接口
         * @method get
         * @url https://xxx:9001/del_history_local
         * @param token 必选 string 用户凭证token  
         * @param local_id 必选 number 地址id
         * @return {"data":true,"errcode":0,"errmsg":"ok"}
         * @remark 这里是备注信息
         * @number 1
         */
        async del_history_local(req, res) {
            let { token, local_id } = req.query;
            if (local_id == null ) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            let user = req.user;


            let { userid, } = user;

            let delHistoryLocal = await db.delHistoryLocal({ userid, local_id });

            http.send(res, RET_OK, { data: delHistoryLocal });

        }


        /**
        * showdoc
        * @catalog 发布接龙
        * @title 获取历史地理位置
        * @description 获取历史地理位置的接口
        * @method get
        * @url https://xxx:9001/get_history_local
        * @param token 必选 string 用户凭证token  
        * @return 
        * @return_param data arr 地址列表
        * @return_param address string 详细地址
        * @return_param latitude string 纬度，范围为-90~90，负数表示南纬
        * @return_param longitude string 经度，范围为-180~180，负数表示西经
        * @return_param name string 位置名称
        * @remark 这里是备注信息
        * @number 1
        */
        async get_history_local(req, res) {
            let { token } = req.query;

            let user = req.user;


            let { userid, } = user;

            let getHistoryLocal = await db.getHistoryLocal({ userid });

            http.send(res, RET_OK, { data: getHistoryLocal });

        }


        /**
       * showdoc
       * @catalog 发布接龙
       * @title 修改接龙状态
       * @description 修改接龙状态的接口
       * @method get
       * @url https://xxx:9001/update_active_state
       * @param token 必选 string 用户凭证token  
       * @param active_id 必选 number 接龙id
       * @param state 必选 number 活动状态，-1：删除接龙，0：保存预览，1：发布，2：完成 
       * @param hidden 可选 number 是否隐藏，0：显示，1：隐藏
       * @param start_time 可选 number 活动开始时间
       * @param end_time 可选 number 活动结束时间
       * @return {"data":true,"errcode":0,"errmsg":"ok"}
       * @remark 这里是备注信息
       * @number 1
       */
        async update_active_state(req, res) {
            let { token, active_id, state, hidden, start_time, end_time } = req.query;

            if (!/^(-1|[0-2])$/gi.test(state)) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            if (hidden && !/^([0-1])$/gi.test(hidden)) {
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

            let update_active_state = await db.update_active_state({ userid, active_id, state, hidden, start_time, end_time });

            http.send(res, RET_OK, { data: update_active_state });

        }


        /**
       * showdoc
       * @catalog 发布接龙
       * @title 阅读接龙
       * @description 阅读接龙的接口
       * @method get
       * @url https://xxx:9001/read_active
       * @param token 必选 string 用户凭证token  
       * @param active_id 必选 number 接龙id
       * @param invitor_id 必选 number 邀请人id
       * @return {"data":true,"errcode":0,"errmsg":"ok"}
       * @remark 这里是备注信息
       * @number 1
       */
        async read_active(req, res) {
            let { token, active_id, invitor_id } = req.query;
            if (active_id == null) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let user = req.user;
            if(invitor_id !=null){
                let invitor_user = await db.get_user_data_by_userid(invitor_id)
                if(!invitor_user){
                    invitor_id = undefined
                }
            }
            let active = await db.get_active_by_id(active_id)
            if (!active) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let { userid, } = user;

            let read_active = await db.read_active({ userid, active_id, invitor_id });

            http.send(res, RET_OK, { data: read_active });

        }


        /**
         * showdoc
         * @catalog 发布接龙
         * @title 获取活动数据统计
         * @description 获取活动数据统计接口
         * @method get
         * @url https://xxx:9001/get_active_data_statistics
         * @param token 必选 string 用户凭证token  
         * @param active_id 必选 number 接龙id
         * @return {"data":{"activeRecordsCount":7,"activeRecordsUserCount":2,"attendCostCount":246.1,"refundNumCount":0,"share_num":1,"readUserCount":1,"service_fee":2.47,"service_fee_rate":0.01,"real_income":243.63,"cvr":2},"errcode":0,"errmsg":"ok"}
         * @return_param activeRecordsCount number 接龙总数
         * @return_param activeRecordsUserCount number 接龙的人数
         * @return_param readUserCount number 来过的人
         * @return_param cvr number 转化率
         * @return_param share_num number 转发次数
         * @return_param attendCostCount number 本次收入
         * @return_param service_fee number 服务费
         * @return_param service_fee_rate number 服务费用率
         * @return_param refundNumCount number 退款金额
         * @return_param real_income number 实际收入
         * @remark 这里是备注信息
         * @number 1
         */
        async get_active_data_statistics(req, res) {
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

            //服务费用率
            let service_fee_rate = 0.01;

            let get_active_data_statistics = await db.get_active_data_statistics({ userid, active_id, service_fee_rate });
            if (!get_active_data_statistics) {
                get_active_data_statistics = {}
            }
            let { activeRecordsUserCount, readUserCount, attendCostCount, service_fee, refundNumCount } = get_active_data_statistics;

            get_active_data_statistics.service_fee_rate = service_fee_rate
            //实际收入
            get_active_data_statistics.real_income = attendCostCount - service_fee - refundNumCount;
            //转化率
            let cvr = readUserCount != 0 ? activeRecordsUserCount / readUserCount : 0
            get_active_data_statistics.cvr = Number(cvr.toFixed(3))
            http.send(res, RET_OK, { data: get_active_data_statistics });

        }


        /**
        * showdoc
        * @catalog 发布接龙
        * @title 获取活动数据-用户信息
        * @description 获取活动数据-用户信息接口
        * @method get
        * @url https://xxx:9001/get_active_data_userinfo
        * @param token 必选 string 用户凭证token  
        * @param active_id 必选 number 接龙id
        * @param page 必选 number 页数，每页返回20条数据，不传返回第一页
        * @param userid 可选 number 用户id，获取该用户转发带来的用户信息
        * @return {"data":[{"name":"stones","headimg":"https://wx.qlogo.cn/mmopen/vi_32/M8XkRL1icroT8UPeGeEuicJ4BicqAnd7yz2o7WjYHQ1JUOQnZ46s4lmtkpu1ZoCqQr8Fj8gkd0z5NHYs8qPdmSOGQ/132","shareUserCount":0,"userid":13012409,"active_id":19,"readTimes":2,"create_time":1557741139152,"alter_time":1557741658708,"invitor_id":59385001,"originator_id":13012409,"title":"微观"},{"name":"🇳 🇪 🇳 🇬","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKR2CX866DCJ90TXtmaZWdHu3oBzvib2zu03IFvQjebXfK0sicGW53GQd85Cz97aKic6Q4VzogHMZlsA/132","shareUserCount":2,"userid":17059767,"active_id":19,"readTimes":69,"create_time":1557390573617,"alter_time":1558343172632,"invitor_id":17059767,"originator_id":17059767,"title":"111"},{"name":"BigBinChan","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJWddt1Ficn6dUibWsQO2mFYvibnAgELnyTVloCbko7d4WuPMfxLzmQIRxEuUABgMOr9KFiaa2hK1h4IQ/132","shareUserCount":0,"userid":40052945,"active_id":19,"readTimes":3,"create_time":1555309567416,"alter_time":1555309567416,"invitor_id":17059767,"originator_id":17059767,"title":"dcesdf"},{"name":"Laugh","headimg":"https://wx.qlogo.cn/mmopen/vi_32/SGEFHF9uaxAVibQYbq8P2jfpy5T4JJgjIc3JSP8D6jseFZWSLZvFibCLmjoaM3lPSCDRgwWZ6oLib48mIfxWzLfbw/132","shareUserCount":1,"userid":59385001,"active_id":19,"readTimes":20,"create_time":1557819113693,"alter_time":1558157058048,"invitor_id":17059767,"originator_id":17059767,"title":""}],"errcode":0,"errmsg":"ok"}
        * @return_param name string 用户名称
        * @return_param headimg string 用户头像
        * @return_param userid number 用户id
        * @return_param shareUserCount number 带来的人数
        * @return_param readTimes number 进入的次数
        * @remark 这里是备注信息
        * @number 1
        */
        async get_active_data_userinfo(req, res) {
            let { token, active_id, page } = req.query;

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
            let rows = 20;
            if (page != null) {
                page = Number(page) - 1;
                start = page * rows;
            }

            start < 0 ? start = null : null;


            let get_active_data_userinfo = await db.get_active_data_userinfo({ userid, active_id, start, rows });
            if (!get_active_data_userinfo) {
                get_active_data_userinfo = []
            }

            http.send(res, RET_OK, { data: get_active_data_userinfo });

        }









    }

    return httpController;
};
