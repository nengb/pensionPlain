
const db = require('../../../utils/dbsync_hall');
const dbRedis = require('../../../utils/db_redis_hall');
const crypto = require('../../../utils/crypto');
const http = require('../../../utils/http');
const configs = require('../../../configs.js');
const config = configs.hall_server();

const path = require('path');
const fs = require('fs');
const TOKEN = require('../utils/token');

const ERRCODE = require('../../../utils/errcode.js');
//redis表名
const { TOKENS_USER, USERS_TOKEN } = dbRedis;
const { RET_OK } = ERRCODE;
//大厅服错误码
const { TOKEN_TIMEOUT, NO_USER, FILE_TOO_BIG, NO_FILE_TYPE } = ERRCODE.HALL_ERRS;
//系统错误码
const { INVALID_PARAMETER } = ERRCODE.SYS_ERRS;



/**
 * 
 *  文件管理模块
 */

// import db from '../utils/dbsync_hall'
// await db.update_user_info(account, name, headimgurl, sex)
module.exports = app => {
    const controllerUtils = require('../utils')(app)
    class httpController extends controllerUtils {
        constructor() {
            super()


        
        }

        async ali_oss_callback(req,res){
            console.log(`ali_oss_callback`)
            console.log(req)
            http.send(res, RET_OK);

        }










    }

    return httpController;
};
