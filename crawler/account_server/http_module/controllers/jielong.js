
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
        async get_jielong_list(req, res) {

            console.log('the sever get the request jielong list')
            let { username, user_id, start, rows, field, order } = req.query;
            if (start == null) {
                http.send(res, -1, "failed");
                return;
            }
            if (rows == null) {
                http.send(res, -1, "failed");
                return;
            }
            var suc = await db.get_user_active(start, rows, user_id, field, order);
            if (suc !== null) {
                http.send(res, RET_OK, suc);
            }
            else {
                http.send(res, RET_OK, []);
            }
        }

        async get_group_way(req, res) {
            let { username, active_id } = req.query;
            var suc = await db.get_group_way_by_active_id(active_id);
            if (suc !== null) {
                http.send(res, RET_OK, suc);
            }
            else {
                http.send(res, RET_OK, []);
            }
        }
        async update_user_active_enable(req, res) {
            let { username, active_id, enable } = req.query;
            var suc = await db.update_user_active_enable(active_id, enable);
            if (suc !== null) {
                http.send(res, RET_OK, suc);
            }
            else {
                http.send(res, RET_OK, []);
            }
        }

        async get_orders(req, res) {
            let { username, start, rows, } = req.query;
            var suc = await db.get_orders(start, rows);
            if (suc !== null) {
                http.send(res, RET_OK, suc);
            }
            else {
                http.send(res, RET_OK, []);
            } 
        }

        async get_all_pictures(req, res) {

            console.log('the sever get the request')
            console.log(req.query)
            let { username, user_id, start, rows, field, order } = req.query;
            if (start == null) {
                http.send(res, -1, "failed");
                return;
            }
            if (rows == null) {
                http.send(res, -1, "failed");
                return;
            }
            var suc = await db.get_all_pictures(start, rows, user_id, field, order);
            if (suc !== null) {
                http.send(res, RET_OK, suc);
            }
            else {
                http.send(res, RET_OK, []);
            }
        }

        async get_all_videos(req, res) {
            let { username, user_id, start, rows, field, order } = req.query;
            if (start == null) {
                http.send(res, -1, "failed");
                return;
            }
            if (rows == null) {
                http.send(res, -1, "failed");
                return;
            }
            var suc = await db.get_all_videos(start, rows, user_id, field, order);
            if (suc !== null) {
                http.send(res, RET_OK, suc);
            }
            else {
                http.send(res, RET_OK, []);
            }
        }

        async update_active_list_enable(req, res) {
            let { username, active_list, enable } = req.query;
            active_list = JSON.parse(active_list)
            var suc = await db.update_active_list_enable(active_list, enable);
            if (suc !== null) {
                http.send(res, RET_OK, suc);
            }
            else {
                http.send(res, RET_OK, []);
            }
        }

        async get_withdraw_records(req,res){
            let {start,rows,user_id,state,start_time,end_time} = req.query
            var suc = await db.get_withdraw_records(start,rows,user_id,state,start_time,end_time);
            if (suc !== null) {
                http.send(res, RET_OK, suc);
            }
            else {
                http.send(res, RET_OK, []);
            }
        }


        


        /////////////////////////////
    }

    return httpController;
};


