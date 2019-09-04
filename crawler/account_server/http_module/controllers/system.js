
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
async  get_configs_list(req, res) {
	var start = req.query.start;
	var rows = req.query.rows;
	var type = req.query.type;
	var suc = await db.get_configs_list(start, rows,type);

	if (suc !== null) {
		http.send(res, RET_OK, suc);
	}
	else {
		http.send(res, RET_OK);
	}
}
async  add_configs(req, res) {
	var name = req.query.name;
	var key = req.query.key;
	var value = req.query.value;
	var suc = await db.add_configs(name, key, value);

	if (suc !== null) {
		http.send(res, RET_OK);
	}
	else {
		http.send(res, RET_OK);
	}
}

async  update_configs(req, res) {
	var id = req.query.id;
	var name = req.query.name;
	var key = req.query.key;
	var value = req.query.value;
	var suc = await db.update_configs(id, name, key, value);

	if (suc !== null) {
		http.send(res, RET_OK);
	}
	else {
		http.send(res, RET_OK);
	}
}


        /////////////////////////////
    }

    return httpController;
};
