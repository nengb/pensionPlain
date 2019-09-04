/*
 *  路由控制器分文件架构
 *  
 */

// require('../externals/utils/errcode')

// const configsBase = require('./configsBase')
//开启的服务类型 , true为开启服务，false为关闭服务
const serverType = {
    http: true,
};
class myApp {
    //处理控制器
    dealControllers(path) {
        return require('require-all')({
            dirname: path,
            // filter      :  /(.+Controller)\.js$/,
            excludeDirs: /^\.(git|svn)$/,
            recursive: true,
            resolve: func => {
                let Controller = func(this);
                return this.selfish(new Controller());
            }
        });
    }
    //对象中间件，绑定this
    selfish(target) {
        const cache = new WeakMap();
        const handler = {
            get(target, key) {
                const value = Reflect.get(target, key);
                if (typeof value !== 'function') {
                    return value;
                }
                if (!cache.has(value)) {
                    cache.set(value, value.bind(target));
                }
                return cache.get(value);
            }
        };
        const proxy = new Proxy(target, handler);
        return proxy;
    }
    //---未处理的异常----
    uncaughtException(err){
        console.log(err)
    }
    //---未处理的Rejection----
    unhandledRejection(reason, p){
        console.log(reason)
    }
    //---程序警告----
    warning(warning){
        let { name,message,stack } = warning
        console.log(warning)

    }
    async start(http_server) {
        //添加服务器配置
        const configs = require('../configs.js');
        const db = require('../utils/dbsync_hall');
        const myredis = require('../utils/redis');
        //启动mysql连接
        db.init(configs.mysql());
        //启动redis连接
        await myredis.init(configs.redis())
        this.config = configs.hall_server()
        this.http = require('../utils/http');

        //文件上传大小限制
        this.uploadFileSizeLimit = {
            'video':25*1024*1024,  //单位：B，视频大小限制20M
            'audio':20*1024*1024,  //单位：B，音频大小限制20M
            'image':10*1024*1024,  //单位：B，图片大小限制10M
        }

        /* 路由加密密钥，不加密就注释掉 */
        // //设置http加密密钥
        // this.HTTP_AES_KEY = "hTtp^@AES&*kEy"
        // //设置socket加密密钥
        // this.SOCKET_AES_KEY = "GaMe;$AES#!KeY"
        this.HTTP_SERVER = http_server
        //配置所有服务的路由和控制器
        for (let serverName in serverType) {
            if (serverType[serverName]) {
                //模块名称
                let moduleName = `${serverName}_module`;
                //挂载控制器类模块
                let controllerName = `${serverName}_controllers`;
                this[controllerName] = this.dealControllers(__dirname + `/${moduleName}/controllers`);
                //设置路由
                let router = require(`./${moduleName}/router`);
                router(this);
            }
        }
    }
}

const app = new myApp();
/* 捕获进程错误 */
process.on('uncaughtException', (err) => {
    app.uncaughtException(err)
});
process.on('warning', (warning) => {
    app.warning(warning);
});

app.start();

module.exports = app;
