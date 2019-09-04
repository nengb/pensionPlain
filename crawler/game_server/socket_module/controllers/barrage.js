
const db = require('../../../utils/dbsync_game');
const myredis = require('../../../utils/redis');
const http = require('../../../utils/http');
const jiguangPush = require('../../../utils/jiguangPush');
const cf = require('../../configs');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const crypto = require('../../../utils/crypto');
const sys = require('../../../utils/sys');
const configs = require('../../../configs.js');
const { FILTERWORDS, NOFILTERWORDS, PROJECT, findClassify, hasClassify, hasProject, FAILEDGIFT, TIME_OUT ,translateText} = cf;

module.exports = app => {
    const {
        userMgr
    } = app;
    class Controller{
         //首页直播窗口弹幕
         async hallBarrage (socket,data){ 
            let userid = data.userid;
            let barrage  = data.barrage;
            let type  = data.type;
            let { account, name, headimg, first_login } = await db.get_user_data_by_userid(userid)
            let userInfo = { userid, account, name, headimg, first_login };
            app.io.sockets.emit("hallBarrage",{userInfo,barrage,type});
            
        }




    }

    return Controller;
}

