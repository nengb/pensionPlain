//  class ConfigBase{

//     constructor(){ 
//         //引入模块配置
//         this.db = require('../../utils/dbsync_game');
//         this.myredis = require('../../utils/redis');
//         this.http = require('../../utils/http');
//         this.jiguangPush = require('../../utils/jiguangPush');
//         this.cf = require('../configs');
//         this.moment = require('moment');
//         this.path = require('path');
//         this.fs = require('fs');
//         this.crypto = require('../../utils/crypto');
//         this.sys = require('../../utils/sys');
//         this.configs = require('../../configs.js');
     
//         //汇率，游戏币 = exRate*人民币
//         this.exRate = 10;
//         this.initDataBaseConnect()
//     }
//     //加载数据库连接
//     async initDataBaseConnect(){
//         //启动mysql连接
//         this.db.init(this.configs.mysql());
//         //启动redis连接
//         await this.myredis.init(this.configs.redis())
//         //服务器重启,清除所有玩家登陆信息（通知玩家需要重新登陆）
//         await this.myredis.del(`userList`);
//     }


// }
 
// module.exports=ConfigBase