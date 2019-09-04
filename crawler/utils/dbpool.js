
var MYSQL=require("mysql");
var async=require("async");
// var FIBERS = require('fibers');

var pool = null;

exports.init = function(config){
    pool = MYSQL.createPool({  
        host: config.HOST,
        user: config.USER,
        password: config.PSWD,
        database: config.DB,
        port: config.PORT,
    });
};

// exports.query = function(sql,print){
//     if(print){
//         console.log(sql);
//     }
//     var fc = FIBERS.current;
//     var ret = {
//         err:null,
//         vals:null,
//         rows:null,
//         fields:null,
//     };

//     pool.getConnection(function(err,conn){  
//         console.log('query',err);
//         if(err){
//             ret.err = err;
//             console.log(err);
//             fc.run();
//         }
//         else{
//             conn.query(sql,function(qerr,vals,fields){  
//                 //释放连接
//                 conn.release();
//                 ret.err = qerr;
//                 ret.vals = vals;
//                 ret.rows = vals;
//                 ret.fields = fields;
//                 fc.run();
//                 console.log('query',ret);
//             });
//         }
//     });

//     FIBERS.yield();
//     return ret;
// };

//使用promise
exports.query = function(sql,print){
    if(!print){
        console.log(sql);
    }
    var ret = {
        err:null,
        vals:null,
        rows:null,
        fields:null,
    };
   return new Promise((resolve,reject)=>{
       pool.getConnection(function(err,conn){  
           if(err){
               ret.err = err;
               console.error(err.stack);
               reject(ret);
           }
           else{
               conn.query(sql, function (qerr, vals, fields) {  
                   if(qerr) {
                       console.error("SQL QUERY ERR:" + sql);
                       console.error(qerr.stack);
                   }
                   //释放连接
                   conn.release();
                   ret.err = qerr;
                   ret.vals = vals;
                   ret.rows = vals;
                   ret.fields = fields;
                   resolve(ret);
               });
           }
       });
   })
};

// sql事务
exports.queryTransaction = function (sqls) {
    if (sqls == null || sqls.length == 0) {
        return {
            err:'no sqls'
        };
    }

    console.log(sqls)

    // var fiber = FIBERS.current;
    var ret = {
        err: null,
        rows: null,
        fields: null,
    };
    return new Promise((resolve,reject)=>{
        pool.getConnection(function (err, conn) {
            if (err) {
                console.error('SQL GET CONNECTION ERR [' + err + ']');
                ret.err = err;
                console.error(err)
                // fiber.run();
                reject(ret)
            } else {
                conn.beginTransaction(function (err) {
                    // console.log('成功开始事务!');
                    if (err) {
                        console.error('SQL BEGIN TRANSACTION ERR [' + err + ']');
                        ret.err = err;
                        // fiber.run();
                        reject(ret)
                    } else {
                        var queryFuncs = [];
                        for (var i = 0; i < sqls.length; i++) {
                            let sql = sqls[i];
                            if (sql == null) {
                                continue;
                            }
    
                            var queryFunc = function (callback) {
                                conn.query(sql, function (qerr, vals, fields) {
                                    if (qerr) {
                                        console.error('SQL [' + sql + '] QUERY ERR [' + qerr + ']');
                                        callback(qerr, null, null);
                                        // fiber.run();
                                    } else {
                                        // console.log('SQL [' + sql + '] QUERY SUCC');
                                        callback(null, vals, fields);
                                    }
                                });
                            }
                            queryFuncs.push(queryFunc);
                        } 
    
                        async.series(queryFuncs, function (qerr, vals, fields) {
                            if (qerr) {
                                // 回滚  
                                conn.rollback(function () {
                                    console.error('出现错误，回滚!');
                                    // 释放资源  
                                    conn.release();
                                });
                                ret.err = qerr;
                                reject(ret)
                                return;
                            }
                            
                            // 提交  
                            conn.commit(function (err) {
                                if (err) {
                                    console.error('提交事务出错!', err);
                                    ret.err = err;
                                    reject(ret)
                                    return;
                                }
    
                                // console.log('成功提交事务!');
                                //释放资源  
                                conn.release();
                                ret.rows = vals
                                ret.fields = fields;
                                // fiber.run();
                                resolve(ret)
                            });
                        });
                    }
                });
            }
        });

    })

    // FIBERS.yield();
    // return ret;
};

//从连接池获取连接
function getConnection (pool){
    return new Promise((resolve,reject)=>{
        pool.getConnection(function(err,conn){  
            if(err){
                ret.err = err;
                console.error(err.stack);
                reject(ret);
            }
            else{
                resolve(conn);
            }
        });
    })
}
//执行单条sql语句，连接不释放
function querySql(conn,sql){
    return new Promise((resolve,reject)=>{
        conn.query(sql, function (qerr, vals, fields) {  
            if(qerr) {
                console.error("SQL QUERY ERR:" + sql);
                console.error(qerr.stack);
                reject(qerr);
            }else{
                resolve(vals);
            }
        });
    })
}
//执行单条sql语句，连接不释放
function queryCommit(conn){
    return new Promise((resolve,reject)=>{
        conn.commit(function(err) {
        if (err) {
            reject(err);
        }else{
            resolve(true);
            console.log('beginTransaction success!');
        }
        });
    })
}

//开启事物
function beginTransaction(conn){
    return new Promise((resolve,reject)=>{
        conn.beginTransaction(function(err) {
            if (err) { 
                reject(err);
            }else{
                resolve(true);
            }
        });
    })
}


//sql事物操作
exports.beginTransaction =async function(sqlArr,async){
    if(sqlArr.length<=0){
        console.error("参数不是数组！")
        return false;
    }
    var result =null;
    //从连接池获取连接
    var conn =await getConnection(pool);

    try {
        //开启事物操作
        await beginTransaction(conn);
    }catch (err) {
        //开启事物操作失败，释放连接
        conn.release();
        console.error(err)
        return false;
    }
    try {
        if(async){  //异步执行
            var queryArr = [];
            sqlArr.forEach(e => {
                queryArr.push(querySql(conn,e));
            });
            console.log("queryArr")
            console.log(queryArr)
            result = await Promise.all(queryArr);

        }else{ //同步执行
           for(var i=0;i<sqlArr.length;i++){
               await querySql(conn,sqlArr[i]);
           }
        }
        await queryCommit(conn);
    } catch (err) {
        conn.rollback();
        console.error(err);
        return false;
    }finally{
        conn.release();
    }
    return true;
};

