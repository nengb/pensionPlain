
const db = require('../../../utils/dbsync_account');
const crypto = require('../../../utils/crypto');
const http = require('../../../utils/http');
const configs = require('../../../configs.js');
const path = require('path');
const fs = require('fs');
const ERRCODE = require('../../../utils/errcode.js');
//redis表名
const { RET_OK } = ERRCODE;
//大厅服错误码
const { TOKEN_TIMEOUT, NO_USER, MONEY_NO_ENOUGH, OPERATE_FAILED, STOCK_NO_ENOUGH, ORDER_HAS_HANDLE } = ERRCODE.HALL_ERRS;
//系统错误码
const { INVALID_PARAMETER, INTER_NETWORK_ERROR } = ERRCODE.SYS_ERRS;

/**
 * 
 *  晒单模块
 */

// import db from '../utils/dbsync_hall'
// await db.update_user_info(account, name, headimgurl, sex)
module.exports = app => {
    const controllerUtils = require('../utils')(app)
    class httpController extends controllerUtils {
        constructor() {
            super()
        }
        async get_user_list(req, res) {
            let { username, user_id, start, rows, field, order } = req.query;
            if (start == null) {
                http.send(res, RET_OK);
                return;
            }
            if (rows == null) {
                http.send(res, RET_OK);
                return;
            }
            var suc = await db.get_user_list(start, rows, user_id, field, order);
            if (suc !== null) {
                http.send(res, RET_OK, suc);
            }
            else {
                http.send(res, RET_OK, []);
            }
        }

        async change_user_info(req, res) {
            let { name, userid, headimgurl } = req.query;

            if (!name || !userid || !headimgurl) {
                http.send(res, RET_OK);
                return
            }
            let ret =   await db.update_user_info({
                userid,
                name,
                headimg: headimgurl
            })
            
            http.send(res, RET_OK);


        }




        /////////////////////////////
    }

    return httpController;
};
