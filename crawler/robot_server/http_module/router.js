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

   

      //获取微信jssdk配置
      router.get('/buy_success_to_robot', Controllers.buy_success.buy_success_to_robot);

    







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
