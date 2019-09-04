const http = require('../../utils/http');

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
    if (!http_server) {
        //无外部http服务，使用 express 做http服务
        http_server = require('express')();
        http_server.use(bodyParser.urlencoded({ extended: true }));
        http_server.all('*', function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
            res.header("X-Powered-By", ' 3.2.1');
            res.header("Content-Type", "application/json;charset=utf-8");

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



    // //扭蛋抽奖
    // router.get('/get_egg_lottery', Controllers.egg.get_egg_lottery);

    // //购买幸运盒子
    // router.get('/get_luckybag', Controllers.luckyBag.get_luckybag);

    //获取幸运盒子游戏记录
    // router.get('/get_luckybag_records', Controllers.luckyBag.get_luckybag_records);


    router.get('/get_user_list', Controllers.user.get_user_list);
    router.get('/get_pay_list', Controllers.payment.get_pay_list);
    router.get('/get_bills_list', Controllers.payment.get_bills_list);

    router.get('/get_jielong_list', Controllers.jielong.get_jielong_list);
    router.get('/get_group_way', Controllers.jielong.get_group_way);
    router.get('/update_user_active_enable', Controllers.jielong.update_user_active_enable);
    router.get('/get_order_list', Controllers.jielong.get_orders);

    router.get('/get_all_pictures', Controllers.jielong.get_all_pictures);
    router.get('/get_all_videos', Controllers.jielong.get_all_videos);
    router.get('/update_active_list_enable', Controllers.jielong.update_active_list_enable);
    router.get('/get_withdraw_records', Controllers.jielong.get_withdraw_records);

    router.get('/get_good_list', Controllers.good.get_good_list);
    router.get('/add_good', Controllers.good.add_good);
    router.get('/update_good', Controllers.good.update_good);

    router.get('/get_good_class_list', Controllers.good.get_good_class);
    router.get('/add_good_class', Controllers.good.add_good_class);
    router.get('/update_good_class', Controllers.good.update_good_class);
    router.get('/delete_good_class', Controllers.good.delete_good_class);
    router.post('/post_mock', Controllers.good.post_mock);
    router.post('/goodDetailPost', multipart(), Controllers.files.goodDetailPost);
    router.post('/image_upload', multipart(), Controllers.files.image_upload);   
    


    router.get('/get_goods_by_order', Controllers.order.get_goods_by_order);


    router.get('/auto_post', Controllers.order.auto_post);
    router.get('/auto_post_all', Controllers.order.auto_post_all);
    router.get('/add_post', Controllers.order.add_post);
    router.get('/importPost', Controllers.order.importPost);
    router.get('/update_post', Controllers.order.update_post);
    router.get('/update_post_info', Controllers.order.update_post_info);
    router.get('/get_post', Controllers.order.get_post);
    // router.get('/getWechatCustomerMsg', Controllers.getWXMsg.getWechatCustomerMsg);
    // router.post('/getWechatCustomerMsg', Controllers.getWXMsg.postWechatCustomerMsg);
    // router.get('/getWechatCustomerMsg2', Controllers.getWXMsg.getWechatCustomerMsg2);
    // router.post('/getWechatCustomerMsg2', Controllers.getWXMsg.postWechatCustomerMsg2);


//system 
    router.get('/get_configs_list', Controllers.system.get_configs_list);
    router.get('/add_configs', Controllers.system.add_configs);
    router.get('/update_configs', Controllers.system.update_configs);

    //子进程事件路由
    // const worker = require('./utils/worker');
    // worker.set('gen_price_list',Controllers.luckyBag.setRedisGoodPriceListData);
    // worker.set('countPro',Controllers.luckyBag.saveCountPro);

    // worker.set('gen_egg_price_list',Controllers.egg.setRedisGoodPriceListData);
    // worker.set('egg_countPro',Controllers.egg.saveCountPro);
    // worker.createWorker();

    http_server.listen(config.DEALDER_API_PORT);
    console.log("http service is listening on " + config.SERVER_CONF.LOCAL_IP + ":" + config.DEALDER_API_PORT);

};
