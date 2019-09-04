
const  db = require('../../../utils/dbsync_account');
const  crypto = require('../../../utils/crypto');
const  http = require('../../../utils/http');
const  configs = require('../../../configs.js');
const path = require('path');
const fs = require('fs');
const ERRCODE = require('../../../utils/errcode.js');
//redis表名
const { RET_OK } = ERRCODE;
//大厅服错误码
const { TOKEN_TIMEOUT, NO_USER,MONEY_NO_ENOUGH, OPERATE_FAILED ,STOCK_NO_ENOUGH,ORDER_HAS_HANDLE} = ERRCODE.HALL_ERRS;
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
    class httpController extends controllerUtils{
        constructor(){
            super()
        }
        async get_pay_list(req, res) {
            let { username, user_id, start, rows,start_time,end_time, type,mch_id} = req.query;
            if (start == null) {
                http.send(res, -1, "failed");
                return;
            }
            if (rows == null) {
                http.send(res, -1, "failed");
                return;
            }

	var suc = await db.get_pay_list(start, rows, user_id, start_time, end_time, type,mch_id);
	// db.get_user_ranking(start,rows,function(suc){

	if (suc !== null) {
		http.send(res, RET_OK, suc);
	}
	else {
		http.send(res, INTER_NETWORK_ERROR,[]);
	}

        }


async  get_bills_list(req, res) {
            let { username, userid, start,note, rows,start_time,end_time, type} = req.query;
    

	if (start == null) {
		http.send(res, INTER_NETWORK_ERROR,[]);
		return;
	}
	if (rows == null) {
		http.send(res,INTER_NETWORK_ERROR,[]);
		return;
	}
	var suc = await db.get_bills_list(start, rows,userid,note,type,start_time,end_time);
	if (suc !== null) {
		http.send(res, RET_OK, suc);
	}
	else {
		http.send(res, INTER_NETWORK_ERROR,[]);
	}
}



 
/////////////////////////////
    }

    return httpController;
};
