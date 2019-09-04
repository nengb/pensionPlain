const http = require('../../utils/http');
const {
    Wechaty,
    log,
} = require('wechaty')
const bot = require('./bot')
/**
 * 
 *  路由模块
 */
module.exports = app => {
    const { 
        config,                 //配置文件
        robot_controllers,       //http控制器
        HTTP_AES_KEY,           //http加密密钥
        // http,                   //http模块
        crypto,                 
        HTTP_SERVER,            //外部http服务
    } = app;
    const Controllers = robot_controllers;
   

    bot.on('scan',    Controllers.login.onScan)
    bot.on('login',   Controllers.login.onLogin)
    bot.on('logout',  Controllers.login.onLogout)
    bot.on('message', Controllers.login.onMessage)
    bot.on('room-invite', Controllers.login.roomInvite)
    
    bot.start()
        .then(() => log.info('StarterBot', 'Starter Bot Started.'))
        .catch(e => log.error('StarterBot', e))




    

    






    

};
