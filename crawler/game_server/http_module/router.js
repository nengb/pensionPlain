const http = require('../../utils/http');
const crypto = require('../../utils/crypto');
const configs = require('../../configs.js');

// const utils = require('./utils');
config = configs.game_server()
/**
 * 
 *  路由模块
 */
module.exports = app => {
    const { 
        http_controllers, //http控制器
        HTTP_AES_KEY, //http加密密钥
    } = app;

    const Controllers = http_controllers;
    //express 做http服务
    const http_server = require('express')();
    var bodyParser = require("body-parser");
    var multipart = require('connect-multiparty');
    http_server.use(bodyParser.urlencoded({ extended: true }));
    //加密路由
    var router = ((HTTP_AES_KEY != null) ? new http.HttpRoutMgr() : http_server);
    http_server.all('*', function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
        res.header("X-Powered-By", ' 3.2.1');
        res.header("Content-Type", "application/json;charset=utf-8");
        next();
    });
    //加密路由统一的接口
    if (HTTP_AES_KEY != null) {
        http_server.get('/sec', function (req, res) {
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
   
    router.get('/paySuccess', Controllers.netWork.paySuccess);
    router.get('/send_msg_to_hall', Controllers.netWork.send_msg_to_hall);

    http_server.listen(config.HTTP_PORT);
    console.log("http service is listening on " + config.SERVER_CONF.LOCAL_IP + ":" + config.HTTP_PORT);

};
