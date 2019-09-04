const http = require('../../utils/http');
const TOKEN = require('./utils/token');

/**
 * 
 *  路由模块
 */
module.exports = app => {
    const { 
        config,                 //配置文件
        http_controllers,       //http控制器
        HTTP_AES_KEY,           //http加密密钥
        // http,                   //http模块
        crypto,                 
        HTTP_SERVER,            //外部http服务
    } = app;
    const Controllers = http_controllers;
    var bodyParser = require("body-parser");
    var multipart = require('connect-multiparty');
    
    //默认使用外部http服务
    let http_server = HTTP_SERVER;
    if(!http_server){
        //无外部http服务，使用 express 做http服务
        http_server = require('express')();
        http_server.use(bodyParser.urlencoded({ extended: true }));
        http_server.all('*',async function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
            res.header("X-Powered-By", ' 3.2.1');
            res.header("Content-Type", "application/json;charset=utf-8");

            
            req.start_time = Date.now()
            let user = await TOKEN.check_token(req, res)
            //检测token
            if(!user){
                return;
            }
            req.user = user;

            next();
        });
    }

  
    //加密路由
    var router = ((HTTP_AES_KEY != null) ? new http.HttpRoutMgr() : http_server);

    //加密路由统一的接口
    if (HTTP_AES_KEY != null) {
        http_server.get('/my_sec', function (req, res) {
            var arr = req.originalUrl.split('?');
            if (arr.length >= 2) {
                var url = arr[1];
                url = crypto.AesDecrypt(url, HTTP_AES_KEY, 128);
                var urlobj = JSON.parse(url);
                var path = urlobj.path;
                req.query = urlobj.data;
                // if (!http_shield.is_valid_req(req.ip, path, req.query)) {
                //     // http.send(res, RET_OK);
                //     http.send(res, RET_OK, HALL_ERRS.TOO_MUCH_ACTIVITY);
                //     return;
                // }
                router.rout(req.method, path, req, res);
            }
        });
    }

    /**
    * ali_oss 
    */
    //文件上传
    http_server.post('/ali_oss_callback', multipart(), Controllers.ali_oss.ali_oss_callback);


    /**
    * files 
    */
    //文件上传
    http_server.post('/upload_files', multipart(), Controllers.files.upload_files);
    http_server.post('/upload_web_files', multipart(), Controllers.files.upload_web_files);

    router.get('/get_img', Controllers.files.get_img);
    router.get('/get_short_url', Controllers.files.get_short_url);

    
    /**
    * getWXMsg 
    */
    //小程序-校验服务器接口
    router.get('/getWechatCustomerMsg', Controllers.getWXMsg.getWechatCustomerMsg);
    //小程序-接受微信客服消息
    http_server.post('/getWechatCustomerMsg', multipart(), Controllers.getWXMsg.postWechatCustomerMsg);

    //公众号-校验服务器接口
    router.get('/getWechatMsg', Controllers.getWXMsg.getWechatMsg);
    //公众号-接受微信公众号消息
    http_server.post('/getWechatMsg', multipart(), Controllers.getWXMsg.postWechatMsg);

  
    /**
    * user 
    */
    //微信小程序-用户注册
    router.get('/mini_wechat_auth', Controllers.user.mini_wechat_auth);
    //微信网页 - 用户注册
    router.get('/h5_wechat_auth', Controllers.user.h5_wechat_auth);
    //用户登录
    router.get('/login', Controllers.user.login);
    //上报用户定位
    router.get('/uploadLocation', Controllers.user.uploadLocation);
    //获取用户信息
    router.get('/get_user_info', Controllers.user.get_user_info);
    //获取用户粉丝列表信息
    router.get('/get_user_fans', Controllers.user.get_user_fans);
    //屏蔽粉丝或修改粉丝备注
    router.get('/update_user_fans_info', Controllers.user.update_user_fans_info);
    //阅读我的所有粉丝
    router.get('/read_user_all_fans', Controllers.user.read_user_all_fans);
    //更新用户联系信息
    router.get('/update_user_contact_info', Controllers.user.update_user_contact_info);
    //上报用户表单id（发送服务通知使用）
    router.get('/report_user_formid', Controllers.user.report_user_formid);
    //获取其他用户的信息
    router.get('/get_other_user_info', Controllers.user.get_other_user_info);
    //获取用户接龙列表
    router.get('/get_user_active_list', Controllers.user.get_user_active_list);
    //获取用户二维码
    router.get('/get_mini_scanCode', Controllers.user.get_mini_scanCode);
    //获取微信jssdk配置
    router.get('/get_wechat_jssdk_config', Controllers.user.get_wechat_jssdk_config);
    //获取用户小程序码
    http_server.post('/get_mini_scanCode',multipart(), Controllers.user.get_mini_scanCode);
    
    /**
    * certificate_manage 
    */

    //修改接龙凭证信息
    router.get('/update_active_record_info', Controllers.certificate_manage.update_active_record_info);
    //修改接龙凭证状态
    router.get('/update_active_record_state', Controllers.certificate_manage.update_active_record_state);
    //阅读我的所有凭证
    router.get('/read_user_all_active_records', Controllers.certificate_manage.read_user_all_active_records);
    //获取用户单个凭证
    router.get('/get_active_record_by_id', Controllers.certificate_manage.get_active_record_by_id);
    //获取用户单个凭证的操作记录
    router.get('/get_active_record_log', Controllers.certificate_manage.get_active_record_log);
    //获取接龙的凭证管理信息
    router.get('/get_active_record_manage_info',  Controllers.certificate_manage.get_active_record_manage_info);
    //获取接龙凭证管理页面的凭证列表
    router.get('/get_active_records_manage_list',  Controllers.certificate_manage.get_active_records_manage_list);
    //获取签到管理信息
    router.get('/get_active_record_signIn_manage_info',  Controllers.certificate_manage.get_active_record_signIn_manage_info);
    //获取签到管理页面的凭证列表
    router.get('/get_active_records_signIn_manage_list',  Controllers.certificate_manage.get_active_records_signIn_manage_list);
    //签到凭证
    router.get('/signIn_active_records',  Controllers.certificate_manage.signIn_active_records);
    //获取接龙可通知的用户列表
    router.get('/get_active_notice_user',  Controllers.certificate_manage.get_active_notice_user);

    /**
    * page_active 
    */
    //获取接龙类型列表接口
    router.get('/get_activetype_list', Controllers.page_active.get_activetype_list);
    //发布接龙
    http_server.post('/publish_active', multipart(), Controllers.page_active.publish_active);
    //修改接龙
    http_server.post('/update_active', multipart(), Controllers.page_active.update_active);
    //修改接龙状态
    router.get('/update_active_state', Controllers.page_active.update_active_state);
    //阅读接龙
    router.get('/read_active', Controllers.page_active.read_active);
    //获取活动参与记录
    router.get('/get_attend_records',  Controllers.page_active.get_attend_records);
    //不看这个接龙
    router.get('/shield_active',  Controllers.page_active.shield_active);
    //添加历史地理位置
    router.get('/add_history_local',  Controllers.page_active.add_history_local);
    //删除历史地理位置
    router.get('/del_history_local',  Controllers.page_active.del_history_local);
    //获取历史地理位置
    router.get('/get_history_local',  Controllers.page_active.get_history_local);
    //获取活动数据统计
    router.get('/get_active_data_statistics',  Controllers.page_active.get_active_data_statistics);
    //获取活动数据-用户信息
    router.get('/get_active_data_userinfo',  Controllers.page_active.get_active_data_userinfo);

    /**
    * page_index 
    */
    //获取首页列表
    router.get('/get_index_list',  Controllers.page_index.get_index_list);
    //获取活动详情
    router.get('/get_active_info',  Controllers.page_index.get_active_info);
    //获取我的接龙凭证
    router.get('/get_active_certificates',  Controllers.page_index.get_active_certificates);
    //获取我的订阅
    router.get('/get_subscribe',  Controllers.page_index.get_subscribe);
    //删除我的订阅
    router.get('/delete_subscribe',  Controllers.page_index.delete_subscribe);
    //修改用户订阅状态
    router.get('/update_subscribe_state',  Controllers.page_index.update_subscribe_state);
    //获取首页历史搜索记录
    router.get('/get_index_search_history',  Controllers.page_index.get_index_search_history);
    //删除首页历史搜索记录
    router.get('/del_index_search_history',  Controllers.page_index.del_index_search_history);
    
     
    /**
    * page_good 
    */
    //获取商品分类列表
    router.get('/get_goodclass_list',  Controllers.page_good.get_goodclass_list);
    //添加商品分类
    router.get('/add_good_class',  Controllers.page_good.add_good_class);
    //修改商品分类
    router.get('/update_good_class',  Controllers.page_good.update_good_class);
    //删除商品分类
    router.get('/delete_good_class',  Controllers.page_good.delete_good_class);

    //获取商品列表
    router.get('/get_good_list',  Controllers.page_good.get_good_list);
    //添加商品
    http_server.post('/add_good', multipart(), Controllers.page_good.add_good);
    //修改商品
    http_server.post('/update_good',multipart(),  Controllers.page_good.update_good);
    //删除商品
    router.get('/delete_good',  Controllers.page_good.delete_good);

        //获取历史商品
    router.get('/get_history_good_list',  Controllers.page_good.get_history_good_list);
    
    /**
    * page_money 
    */
    //提现接口
    http_server.get('/user_withdraw',  Controllers.page_money.user_withdraw);
    //获取支付参数
    http_server.get('/pay_for_order',  Controllers.page_money.pay_for_order);
    //获取支付参数
    http_server.get('/submit_order',  Controllers.page_money.submit_order);
    //支付异步通知
    http_server.post('/wechatpay_back', multipart(), Controllers.page_money.wechatPay_back);

    //获取订单详情
    http_server.get('/get_active_record_detail',  Controllers.page_money.get_active_record_detail);
       //获取账单
    http_server.get('/get_user_bills',  Controllers.page_money.get_user_bills);
    //提现
    http_server.get('/get_wechatPay_to_user',  Controllers.page_money.get_wechatPay_to_user);
    
    http_server.get('/get_pay_data',  Controllers.page_money.get_pay_data);
//余额支付
    http_server.get('/balance_for_order',  Controllers.page_money.balance_for_order);

//退款
    http_server.get('/refund_to_buyer',  Controllers.page_money.refund_to_buyer);
    http_server.get('/get_wechat_order',  Controllers.page_money.get_wechat_order);


//提现记录
    http_server.get('/get_user_withdraw_records',  Controllers.page_money.get_user_withdraw_records);


    http_server.get('/test_withdraw_bank',  Controllers.page_money.test_withdraw_bank);
    http_server.get('/deal_withdraw_record',  Controllers.page_money.deal_withdraw_record);

    /**
    * page_notice
    */
    //发送消息
    http_server.get('/send_template',  Controllers.page_notice.send_template);
    
    http_server.get('/send_template_test',  Controllers.page_notice.send_template_test);


    /**
    * page_message
    */
    //获取我的消息列表
    http_server.get('/get_message_list',  Controllers.page_message.get_message_list);
    //阅读我的消息
    http_server.get('/read_message',  Controllers.page_message.read_message);


    /**
    * leave_msg
    */
    //获取活动留言信息列表
    http_server.get('/get_leave_msg_list',  Controllers.leave_msg.get_leave_msg_list);
    //添加留言列表
    http_server.get('/add_leave_msg',  Controllers.leave_msg.add_leave_msg);
    //给留言点赞
    http_server.get('/thumbup_leavemsg',  Controllers.leave_msg.thumbup_leavemsg);
    //回复留言
    http_server.get('/reply_leave_msg',  Controllers.leave_msg.reply_leave_msg);

    


    // Controllers.user.get_all_accesstoken()







    //子进程事件路由
    // const worker = require('./utils/worker');
    // worker.set('gen_price_list',Controllers.luckyBag.setRedisGoodPriceListData);
    // worker.set('countPro',Controllers.luckyBag.saveCountPro);

    // worker.set('gen_egg_price_list',Controllers.egg.setRedisGoodPriceListData);
    // worker.set('egg_countPro',Controllers.egg.saveCountPro);
    // worker.createWorker();
    
    http_server.listen(config.HTTP_PORT);
    console.log("http service is listening on " + config.SERVER_CONF.LOCAL_IP + ":" + config.HTTP_PORT);

};
