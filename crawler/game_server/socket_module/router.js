const db = require('../../utils/dbsync_game');
const myredis = require('../../utils/redis');
const http = require('../../utils/http');
const jiguangPush = require('../../utils/jiguangPush');
const cf = require('../configs');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const crypto = require('../../utils/crypto');
const sys = require('../../utils/sys');
const configs = require('../../configs.js');
// const utils = require('./utils');
config = configs.game_server()

const SocketRouter = require('./module/SocketRouter');
const usermgr = require('./module/usermgr');

module.exports = app => {
    const  {
        socket_controllers,       //http控制器
        SOCKET_AES_KEY,           //http加密密钥
    } = app;

    const Controllers = socket_controllers;
    
    console.log("socket模块测试")
    console.log(Controllers.user.disconnect)
  

    app.io = require('socket.io')(config.CLIENT_PORT,{
		'transports':['websocket', 'polling'],
		'pingTimeout':30000,
		'pingInterval':5000, 
    });
    //创建socket路由对象
    const router = new SocketRouter(app.io)
    //挂载用户socket到容器
    app.userMgr = new usermgr(app.io,myredis);



    /* 设置路由 */
     /* ------------------ index --------------------------*/
    //登陆
    // router.set('error',Controllers.index.error)
    /* ------------------ user --------------------------*/
    //登陆
    router.set('login',Controllers.user.login)
    //断开连接
    router.set('disconnect',Controllers.user.disconnect)


    //app弹幕
    router.set('appBarrage',Controllers.barrage.hallBarrage)

    //处理新socket连接
    router.connection();

    
	console.log("socket service is listening on "+ config.SERVER_CONF.LOCAL_IP + ":" + config.CLIENT_PORT);
}