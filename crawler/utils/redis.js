

var Redis = require('ioredis');
// var FIBERS = require('fibers');
// //从配置文件获取服务器信息
// var configs = require(process.argv[2]);
// config = configs.redis();
var myredis = null;
// module.exports = new Redis({  
//     port: config.PORT,
//     host: config.HOST,
//     password: config.PSWD,
//     db: config.DB,
// });


exports.init =async function(config){
    myredis =await new Redis({  
        port: config.PORT,
        host: config.HOST,
        password: config.PSWD,
        db: config.DB,
    });
    
};

exports.get = function(key,print,type){
    return new Promise((resolve,reject)=>{
        myredis.get(key, function (err, result) {
            if(err){
                console.error(err);
                reject(null)
            }
            else{

                if(type == Object){
                    try {
                        result = JSON.parse(result);
                    } catch (err) {
                        console.error(err)
                    }
                }

                if(!print){
                    console.log("result")
                    console.log(result)
                }
                
                resolve(result)
            }
        });

    })
};

exports.set = function(key,value){
    return new Promise((resolve,reject)=>{
        if( value.constructor == Object ){
            try {
                value = JSON.stringify(value);
            } catch (err) {
                console.error(`redis set 出错`)
                console.error(err)
                reject(null);
                return;
            }
        }
        myredis.set(key, value, function (err, result) {
            if(err){
                console.error(err);
                reject(null)
            }
            else{
                console.log("result")
                console.log(result)
                resolve(result)
            }
        });
    })
    
};

exports.incr = function(key){
    return new Promise((resolve,reject)=>{
        myredis.incr(key, function (err, result) {
            if(err){
                console.error(err);
                reject(null)
            }
            else{
                console.log("result")
                console.log(result)
                resolve(result)
            }
        });
    })

};


exports.del = function(key,print){
    return new Promise((resolve,reject)=>{
        myredis.del(key, function (err, result) {
            if(err){
                console.error(err);
                reject(null)
            }
            else{
                if(!print){
                    console.log("result")
                    console.log(result)
                }
                resolve(result)
            }
        });
    })
};

/*  例子：
    (async()=>{
        await myredis.hmset('neng',{a:22,b:2342,c:{sd:1,g:{p:1,l:{o:1}}}})
        let a = await myredis.hget('neng','c',Object)
        let b = await myredis.hget('neng','c')
        console.error(a)                    //{"sd":1,"g":{"p":1,"l":{"o":1}}}
        console.error(typeof(a))            //string
        console.error(b)                    //{ sd: 1, g: { p: 1, l: { o: 1 } } }
        console.error(typeof(b))            //object
    })()
 */

exports.hmset = async function(key,value,print){

    let hmsetData = null;
    try {
        if(Object.prototype.toString.call(value) === '[object Object]'){
            for(let vk in value){
                if(Object.prototype.toString.call(value[vk]) === '[object Object]' || Object.prototype.toString.call(value[vk]) === '[object Array]'){
                    value[vk] = JSON.stringify(value[vk])
                }
            }
        }
        hmsetData = await myredis.hmset(key,value)
        if(print){
            console.log("result")
            console.log(`hmset 操作 结果${hmsetData}`)
        }
    } catch (error) {
        console.error(`hmset 出错`)
        console.error(error)
    }
    return hmsetData
};


//type 为Object 时 ，将读取出的数据反序列化为对象，反序列化失败时恢复成读取的值和类型
exports.hget = async function(key,hkey,print){
    let hgetData = null;
    try {
        if(hkey){
            hgetData = await myredis.hget(key,hkey)
            // if(type == Object){
                var a;
                try {
                    a = JSON.parse(hgetData)
                } catch (error) {
                    a = hgetData
                }
                hgetData = a
            // }
        }else{
            hgetData = await myredis.hgetall(key)
            for(let key in hgetData){
                try {
                    hgetData[key] = JSON.parse(hgetData[key])
                } catch (error) {
                }
            }
        }
        // if(!print){
        //     console.log("result")
        //     console.log(`hget 操作 结果${hgetData}`)
        // }
    } catch (error) {
        console.error(`hget 出错`)
        console.error(error)
    }
    return hgetData
};

exports.hdel = async function(key,delkey,print){
    let hdelData = null;
    try {
        hdelData = await myredis.hdel(key,delkey)
        if(!print){ 
            console.log("result")
            console.log(`hdel 操作 结果${hdelData}`)
        }
    } catch (error) {
        console.error(`hdel 出错`)
        console.error(error)
    }
    return hdelData
};

exports.hlen = async function(key,print){
    let hlenData = 0;
    try {
        hlenData = await myredis.hlen(key)
        if(!print){ 
            console.log("result")
            console.log(`hlen 操作 结果${hlenData}`)
        }
    } catch (error) {
        console.error(`hlen 出错`)
        console.error(error)
    }
    return hlenData
};

exports.hexists = async function(key,value, print){
    let hexistsData = 0;
    try {
        hexistsData = await myredis.hexists(key,value)
        if(!print){ 
            console.log("result")
            console.log(`hexists 操作 结果${hexistsData}`)
        }
    } catch (error) {
        console.error(`hexists 出错`)
        console.error(error)
    }
    return hexistsData
};



exports.lrange = async function (key, start, end,print) {
    let lrangeData = [];
    try {
        lrangeData = await myredis.lrange(key,start,end)
        if(!print){ 
            console.log("result")
            console.log(`lrange 操作 结果${lrangeData}`)
        }
    } catch (error) {
        console.error(`lrange 出错`)
        console.error(error)
    }
    for (let i = 0; i < lrangeData.length; i++) {
        try {
            lrangeData[i] = JSON.parse(lrangeData[i]);
        } catch (e) {
            console.error('get_worldchat_record : ', e);
            lrangeData[i] = {}; // 发生错误也插入占位.
        }
    }
    return lrangeData
};

exports.lpush = async function(key,value,print){
    let lpushData = 0;
   
    if(Object.prototype.toString.call(value) === '[object Object]' || Object.prototype.toString.call(value) === '[object Array]'){
        try {
            value = JSON.stringify(value);
        } catch (error) {
            
        }
    }
    try {
        lpushData = await myredis.lpush(key,value)
        if(!print){ 
            // console.log("result")
            // console.log(`lpush 操作 结果${lpushData}`)
        }
    } catch (error) {
        console.error(`lpush 出错`)
        console.error(error)
    }
    return lpushData
};

exports.rpush = async function(key,value,print){
    let lpushData = 0;
   
    if(Object.prototype.toString.call(value) === '[object Object]' || Object.prototype.toString.call(value) === '[object Array]'){
        try {
            value = JSON.stringify(value);
        } catch (error) {
            
        }
    }
    try {
        lpushData = await myredis.rpush(key,value)
        if(!print){ 
            // console.log("result")
            // console.log(`rpush 操作 结果${lpushData}`)
        }
    } catch (error) {
        console.error(`rpush 出错`)
        console.error(error)
    }
    return lpushData
};

exports.rpop = async function (key,print) {
    let rpopData ;
    try {
        rpopData = await myredis.rpop(key)
        if(!print){ 
            // console.log("result")
            // console.log(`rpop 操作 结果${rpopData}`)
        }
    } catch (error) {
        console.error(`rpop 出错`)
        console.error(error)
    }
    return rpopData 
};

exports.lpop = async function (key,print) {
    let lpopData ;
    try {
        lpopData = await myredis.lpop(key)
        if(!print){ 
            // console.log("result")
            // console.log(`lpop 操作 结果${lpopData}`)
        }
    } catch (error) {
        console.error(`lpop 出错`)
        console.error(error)
    }
    return lpopData 
};

exports.llen = async function(key,print){
    let llenData = 0;
    try {
        llenData = await myredis.llen(key)
        if(!print){ 
            console.log("result")
            console.log(`llen 操作 结果${llenData}`)
        }
    } catch (error) {
        console.error(`llen 出错`)
        console.error(error)
    }
    return llenData
};


exports.lrem = async function(key,count,value,print){
    let lremData = 0;
    try {
        lremData = await myredis.lrem(key,count,value)
        if(!print){ 
            console.log("result")
            console.log(`lrem 操作 结果${lremData}`)
        }
    } catch (error) {
        console.error(`lrem 出错`)
        console.error(error)
    }
    return lremData
};



exports.getMyredis = function(){
    return myredis;
};


