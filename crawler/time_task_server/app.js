/**
 * 
 *  定时任务模块
 */


//添加服务器配置
const configs = require('../configs.js');
const db = require('../utils/dbsync_hall');
const myredis = require('../utils/redis');
const dbRedis = require('../utils/db_redis_hall');
const sys = require('../utils/sys');
const withdraw = require('./withdraw');
const { API_LOG } = dbRedis;

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
        
        //启动mysql连接
        db.init(configs.mysql());
        //启动redis连接
        await myredis.init(configs.redis())

        
        sys.dealTask(1000 ,async ()=>{ 
            withdraw.deal_withdraw_record()
            withdraw.deal_finish_reward_active()
            let log_data = await myredis.lpop(API_LOG)
            if(log_data){
                console.log(`处理任务`,log_data)
                try {
                    log_data = JSON.parse(log_data);
                    let { method, query, body, start_time, end_time, delay_time, userid, pathname, user_agent,ip,sendData} = log_data;
                    db.add_request_log({ method, query, body, start_time, end_time, delay_time, userid, pathname, user_agent,ip,sendData});
                } catch (error) {
                }
            }

         })
        

        
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