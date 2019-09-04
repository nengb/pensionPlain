
/* 
 *  开启的服务类型 
 *  true为开启服务，false为关闭服务
 */
const serverType = {
   http:    true,           //http服务 ，跟其他后端程序通信               
   socket:  true,           //socket服务，跟客户端通信
//    net:     true,           //tcp服务，跟机器通信
}

class myApp {
    constructor(){
    }
    dealControllers(path){
        return require('require-all')({
                dirname     : path,
                // filter      :  /(.+Controller)\.js$/,
                excludeDirs :  /^\.(git|svn)$/,              //排除
                recursive   : true ,                         //递归
                resolve     : func => {
                    let Controller = func(this);
                    return this.selfish(new Controller());
                }
        })
    }
    //对象中间件，绑定this
    selfish(target) {
            const cache = new WeakMap();
            const handler = {
                get (target, key) {
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
        console.log('---未处理的异常----')
        console.log(err)
    }
  
    //---程序警告----
    warning(warning){
        let { name,message,stack } = warning
        console.log({errInfo:'---------------------------------程序警告---------------------',name,message})
        console.log(stack)
    }
    async start(){

        const configs = require('../configs.js');
        const db = require('../utils/dbsync_game');
        const myredis = require('../utils/redis');
        //启动mysql连接
        db.init(configs.mysql());
        //启动redis连接
        await myredis.init(configs.redis())
        this.http = require('../utils/http');
    
        
        /* 路由加密密钥，不加密就注释掉 */
        // //设置http加密密钥
        // this.HTTP_AES_KEY = "hTtp^@AES&*kEy"
        // //设置socket加密密钥
        // this.SOCKET_AES_KEY = "GaMe;$AES#!KeY"

        //配置所有路由和控制器
        for(let serverName in serverType){
            if(serverType[serverName]){
                let controllerName = `${serverName}_controllers`;
                let moduleName = `${serverName}_module`;
                this[controllerName] = this.dealControllers(__dirname + `/${moduleName}/controllers`);
                let router = require(`./${moduleName}/router`)
                router(this)
            }
        }


      
    }
}


const app = new myApp()

/* 捕获进程错误 */
process.on('uncaughtException', (err) => {
    app.uncaughtException(err)
});

process.on('warning', (warning) => {
    app.warning(warning);
});



//启动应用
app.start();


