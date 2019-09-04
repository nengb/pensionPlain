var dbpool = require('./dbpool');
var crypto = require('./crypto');
var MYSQL = require("mysql");
const PROJECT = require("../configs").SERVER_CONF.name;
var la = 'CN'
let account_userid = '88888888'

function query(sql, callback) {
    dbpool.query2(sql, callback);
};
function dealUserName(resultData) {
    if (!resultData || resultData.length <= 0) {
        return resultData;
    }

    resultData.map(e => {
        try {
            e.name = crypto.fromBase64(e.name)
        } catch (error) {

        }
        return e;
    })

    return resultData
}

exports.init = function (config) {
    dbpool.init(config);
};
exports.get_user_data_by_userid = async function (userid) {

    if (userid == null) {
        return null;
    }

    let sql = `SELECT * FROM t_users WHERE userid = '${userid}'`;
    let ret = await dbpool.query(sql, true);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    dealUserName(ret.rows)


    return ret.rows[0];

};

exports.update_user_info = async function ({ userid, account, name, headimg, openid, unionid, wx_openid, latitude, longitude }) {
    if (userid == null) {
        return null;
    }
    try {
        name = crypto.toBase64(name);
    } catch (error) {
    }

    let updateQuerys = [
        { key: `account`, value: account },
        { key: `name`, value: name },
        { key: `headimg`, value: headimg },
        { key: `openid`, value: openid },
        { key: `wx_openid`, value: wx_openid },
        { key: `unionid`, value: unionid },
        { key: `latitude`, value: latitude },
        { key: `longitude`, value: longitude },
    ]
    updateQuerys = updateQuerys.filter(e => {
        return e.value != null
    })

    if (updateQuerys && updateQuerys.length == 0) {
        return;
    }
    let { query, queryArr } = dealUpdateQuery(updateQuerys);

    // name = crypto.toBase64(name);
    let sql = `UPDATE t_users SET ${query} WHERE userid= ?`;
    // sql = sql.format(name, headimg, account,openid);
    sql = MYSQL.format(sql, [...queryArr, userid]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    return ret.rows.affectedRows > 0;

};
// 玩家
exports.get_user_list = async function (start, row, user_id, field, order) {

    var userid = "";
    var rank = "";
    var time = "";
    var orderBy = "";
    var agentStr = "";
    var invitorStr = "";
    if (user_id) {
        userid = `and userid = '${user_id}'`;
    }

    if (field && order) {
        if (order == "descend") {
            orderBy = ` order by ${field} desc`
        }
        if (order == "ascend") {
            orderBy = ` order by ${field} asc`
        }

    }
    var sql1 = `SELECT count(*) as cnt FROM t_users WHERE sex !=5 ${userid} ${agentStr}${invitorStr}  ${time}`;

    var ret1 = await dbpool.query(sql1);

    if (ret1.err || ret1.rows.length == 0) {
        return null
    }
    var sql = `SELECT t_users.* FROM t_users  WHERE t_users.sex !=9 ${userid} ${agentStr}${invitorStr} ${time} GROUP by t_users.userid ${orderBy} limit ${start},${row}`
    var ret2 = await dbpool.query(sql);
    if (ret2.err || ret2.rows.length == 0) {
        return null
    }
    ret2.rows[0].cnt = ret1.rows[0].cnt

    for (var i = 0; i < ret2.rows.length; i++) {
        try {
            ret2.rows[i].name = crypto.fromBase64(ret2.rows[i].name)

        } catch (err) {
            ret2.rows[i].name = ''
        }
    }

    return ret2.rows;

};

exports.get_pay_list = async function (start, rows, user_id, start_time, end_time, type, mch_id) {
    var limit = '';
    var id = '';
    var pay_typestr = '';
    var typestr = '';
    var mch_idstr = '';
    if (mch_id) {
        mch_idstr = `AND t_pay_records.mch_id = "${mch_id}"`;
    }
    limit = `limit ${start},${rows}`;
    if (user_id) {
        id = `AND t_pay_records.userid = "${user_id}"`;
    }

    if (type && type != '全部') {
        typestr = `and t_pay_records.type = ${type}`
    }

    var time = '';
    if (start_time && end_time) {
        time = `and t_pay_records.time >= "${start_time}" and t_pay_records.time <="${end_time}"`
    }
    var sqlCnt = `select count(*) as cnt,sum(t_pay_records.cost) as sum from t_pay_records 
    left join t_users on t_pay_records.userid = t_users.userid where t_pay_records.state = 3 ${mch_idstr} ${id} ${pay_typestr} ${typestr} ${time}`;

    var sql = `select t_pay_records.*,t_users.name from t_pay_records
     left join t_users on t_pay_records.userid = t_users.userid  where t_pay_records.state = 3 
       ${id}  ${pay_typestr} ${typestr} ${time} ${mch_idstr} order by t_pay_records.time desc ${limit}`;
    var ret = await dbpool.query(sql);
    var ret1 = await dbpool.query(sqlCnt);

    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    for (var i = 0; i < ret.rows.length; i++) {
        try {
            ret.rows[i].name = crypto.fromBase64(ret.rows[i].name)

        } catch (err) {
            ret.rows[i].name = ''
        }
    }
    ret.rows[0].cnt = ret1.rows[0].cnt;
    ret.rows[0].sum = ret1.rows[0].sum;

    return ret.rows;
};
exports.get_bills_list = async function (start, rows, userid, note, type, start_time, end_time) {
    var limitsql = '';
    var id = '';
    var noteStr = '';
    var typeStr = '';
    var timeStr = '';

    if (start != null && rows != null) {
        limitsql = ' LIMIT ' + start + ',' + rows;
    }

    if (userid) {
        var id = ` and user_id =${userid}`
    }
    if (note) {
        var noteStr = ` and note ='${note}'`
    }
    if (type) {
        var typeStr = ` and type ='${type}'`
    }
    if (start_time && end_time) {
        var timeStr = ` and time>${start_time} and time <${end_time}`
    }

    var sql1 = `SELECT count(*) as cnt ,sum(case when type='add' then num else 0 end ) as addsum,sum(case when type='dec' then num else 0 end ) as decsum FROM t_bills WHERE num >0  ${id} ${noteStr} ${typeStr} ${timeStr}`
    var ret1 = await dbpool.query(sql1);

    var sql = `SELECT * FROM t_bills WHERE num >0  ${id} ${noteStr}  ${typeStr} ${timeStr} ORDER BY time DESC` + limitsql;
    var ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    ret.rows[0].cnt = ret1.rows[0].cnt
    ret.rows[0].addsum = ret1.rows[0].addsum
    ret.rows[0].decsum = ret1.rows[0].decsum
    ret.rows[0].allpage = parseInt(ret1.rows[0].cnt / 10) + 1;

    return ret.rows;
};

exports.get_user_active = async function (start, rows, userid, note, type, start_time, end_time) {
    var limitsql = '';
    var id = '';
    var noteStr = '';
    var typeStr = '';
    var timeStr = '';

    if (start != null && rows != null) {
        limitsql = ' LIMIT ' + start + ',' + rows;
    }

    if (userid) {
        var id = ` and originator_id =${userid}`
    }
    if (note) {
        var noteStr = ` and note ='${note}'`
    }
    if (type) {
        var typeStr = ` and type ='${type}'`
    }
    if (start_time && end_time) {
        var timeStr = ` and time>${start_time} and time <${end_time}`
    }

    var sql1 = `SELECT count(*) as cnt  FROM t_user_active WHERE originator_id >0  ${id} ${noteStr} ${typeStr} ${timeStr}`
    var ret1 = await dbpool.query(sql1);

    var sql = `SELECT t_user_active.*,t_users.name,t_users.sex  FROM t_user_active left join t_users on t_user_active.originator_id=t_users.userid WHERE t_user_active.originator_id >0  ORDER BY alter_time DESC` + limitsql;
    var ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    for (let i = 0; i < ret.rows.length; i++) {
        try {
            ret.rows[i].name = crypto.fromBase64(ret.rows[i].name);
            ret.rows[i].list_info = JSON.parse(crypto.fromBase64(ret.rows[i].list_info));
            ret.rows[i].logistics = JSON.parse(ret.rows[i].logistics);
        } catch (error) {
        }
    }
    ret.rows[0].cnt = ret1.rows[0].cnt
    ret.rows[0].allpage = parseInt(ret1.rows[0].cnt / 10) + 1;

    return ret.rows;
};


exports.get_group_way_by_active_id = async function (id) {

    if (id == null) {
        return null;
    }

    let sql = 'SELECT * FROM t_active_group_way WHERE active_id = ?';
    sql = MYSQL.format(sql, [id]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {

        return null;
    }
    let data = ret.rows;
    return data;
};

exports.update_user_active_enable = async function (id, enable) {

    if (id == null || enable == null) {
        return null;
    }

    let sql = 'update t_user_active set enable = ? WHERE active_id = ?';
    sql = MYSQL.format(sql, [enable, id]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {

        return null;
    }
    return ret.rows.affectedRows > 0;
};

exports.get_good_list = async function (start, rows, name, start_time, end_time, order_start, order_end, history, good_id, agent, field, order, state, good_no, isOnline, jd_no, low_price, high_price) {
    var str = '';
    var timestr = '';
    var orderstr = '';
    var id = '';
    var agentStr = '';
    var orderBy = 'order by t_goods.time desc,t_goods.good_id desc';
    var stateStr = '';
    var good_noStr = '';
    var limitStr = ''
    if (start && rows) {
        limitStr = `LIMIT ${start},${rows}`
    }
    var jd_no_str = ``
    if (jd_no) {
        jd_no_str = `AND t_goods.jd_no='${jd_no}'`
    }

    var onlineStr = '';
    if (isOnline && isOnline != '全部') {
        onlineStr = ` AND t_goods.isOnline = '${isOnline}' `
    }
    if (!history) {
        var history = 0;
    }
    if (good_no) {
        good_noStr = `AND t_goods.good_no like '%${good_no}%'`;
    }
    if (state) {
        stateStr = `AND t_goods.state = '${state}'`;
    }
    if (agent) {
        agentStr = `AND t_goods.agent = '${agent}'`;
    }
    if (name) {
        str = 'AND t_goods.`name` like  ' + `"%${name}%" `
    }
    if (start_time) {
        timestr = `AND t_goods.time> ${start_time} AND t_goods.time <${end_time}`
    }
    if (order_start) {
        orderstr = ` AND t_orders.time > ${order_start} AND t_orders.time < ${order_end}`
    }
    if (good_id) {
        id = `AND t_goods.good_id = ${good_id}`
    }
    if (field && order) {
        if (order == "descend") {
            orderBy = ` order by ${field} desc`
        }
        if (order == "ascend") {
            orderBy = ` order by ${field} asc`
        }
    }

    var lowStr = ``
    var highStr = ``
    if (low_price) {
        lowStr = ` and t_goods.price>=${low_price}`
    }
    if (high_price) {
        highStr = ` and t_goods.price<=${high_price} `
    }

    var sql1 = `SELECT COUNT(*) as cnt FROM t_goods WHERE userid =${account_userid}  `

    var sql = `SELECT * FROM t_goods WHERE userid =${account_userid} group by t_goods.good_id    ${limitStr} `

    var ret = await dbpool.query(sql);
    var ret1 = await dbpool.query(sql1);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    ret.rows[0].cnt = ret1.rows[0].cnt
    var data = ret.rows;
    data.forEach(e => {
        e.img_list = e.picture_details.split(',')

    })
    return data;

};

exports.get_all_pictures = async function (start, rows, start_time, end_time) {
    var limitsql = '';
    var id = '';
    var noteStr = '';
    var typeStr = '';
    var timeStr = '';

    if (start != null && rows != null) {
        limitsql = ' LIMIT ' + start + ',' + rows;
    }

    if (start_time && end_time) {
        var timeStr = ` and time>${start_time} and time <${end_time}`
    }

    var sql1 = `SELECT count(*) as cnt  FROM t_user_active WHERE enable=0 and originator_id >0  ${id} ${timeStr}`
    var ret1 = await dbpool.query(sql1);

    var sql = `SELECT t_user_active.*,t_users.name,t_users.sex  FROM t_user_active left join t_users on t_user_active.originator_id=t_users.userid WHERE t_user_active.originator_id >0 and t_user_active.enable =0 ORDER BY alter_time DESC`;//+ limitsql
    var ret = await dbpool.query(sql);

    let retData = [];
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    for (let i = 0; i < ret.rows.length; i++) {
        try {
            ret.rows[i].name = crypto.fromBase64(ret.rows[i].name);
            ret.rows[i].list_info = JSON.parse(crypto.fromBase64(ret.rows[i].list_info));
            for (let j = 0; j < ret.rows[i].list_info.length; j++) {
                if (ret.rows[i].list_info[j].type == '单图' || ret.rows[i].list_info[j].type == '多图') {
                    for (let k = 0; k < ret.rows[i].list_info[j].value.length; k++) {
                        retData.push({ index: retData.length, active_id: ret.rows[i].active_id, url: ret.rows[i].list_info[j].value[k], checked: false })
                    }
                }
            }

        } catch (error) {
        }
    }
    start = parseInt(start)
    rows = parseInt(rows)
    let retPictures = []
    console.log(parseInt(retData.length / rows) + 1)
    console.log(start + 1)
    if (parseInt(retData.length / rows) + 1 == start + 1) {
        retPictures = retData.slice(start * rows, retData.length)
    } else {

        retPictures = retData.slice(start * rows, (start + 1) * rows)
    }

    retPictures[0].cnt = retData.length;
    retPictures[0].allpage = parseInt(retData.length / rows) + 1;
    // ret.rows[0].cnt = ret1.rows[0].cnt
    // ret.rows[0].allpage = parseInt(ret1.rows[0].cnt / 10) + 1;
    console.log(retPictures.length)
    return retPictures;
};

exports.get_all_videos = async function (start, rows, start_time, end_time) {
    var limitsql = '';
    var id = '';
    var noteStr = '';
    var typeStr = '';
    var timeStr = '';

    if (start != null && rows != null) {
        limitsql = ' LIMIT ' + start + ',' + rows;
    }

    if (start_time && end_time) {
        var timeStr = ` and time>${start_time} and time <${end_time}`
    }

    var sql1 = `SELECT count(*) as cnt  FROM t_user_active WHERE enable=0 and originator_id >0  ${id} ${timeStr}`
    var ret1 = await dbpool.query(sql1);

    var sql = `SELECT t_user_active.*,t_users.name,t_users.sex  FROM t_user_active left join t_users on t_user_active.originator_id=t_users.userid WHERE t_user_active.originator_id >0 and t_user_active.enable =0 ORDER BY alter_time DESC`;//+ limitsql
    var ret = await dbpool.query(sql);

    let retData = [];
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    for (let i = 0; i < ret.rows.length; i++) {
        try {
            ret.rows[i].name = crypto.fromBase64(ret.rows[i].name);
            ret.rows[i].list_info = JSON.parse(crypto.fromBase64(ret.rows[i].list_info));
            for (let j = 0; j < ret.rows[i].list_info.length; j++) {
                if (ret.rows[i].list_info[j].type == '视频') {
                    for (let k = 0; k < ret.rows[i].list_info[j].value.length; k++) {
                        retData.push({ index: retData.length, active_id: ret.rows[i].active_id, url: ret.rows[i].list_info[j].value[k], checked: false })
                    }
                }
            }

        } catch (error) {
        }
    }
    start = parseInt(start)
    rows = parseInt(rows)
    let retPictures = []
    console.log(parseInt(retData.length / rows) + 1)
    console.log(start + 1)
    if (parseInt(retData.length / rows) + 1 == start + 1) {
        retPictures = retData.slice(start * rows, retData.length)
    } else {

        retPictures = retData.slice(start * rows, (start + 1) * rows)
    }

    retPictures[0].cnt = retData.length;
    retPictures[0].allpage = parseInt(retData.length / rows) + 1;
    // ret.rows[0].cnt = ret1.rows[0].cnt
    // ret.rows[0].allpage = parseInt(ret1.rows[0].cnt / 10) + 1;
    console.log(retPictures.length)
    return retPictures;
};

exports.get_withdraw_records = async function (start, rows, user_id, state, start_time, end_time) {
    var limitsql = '';
    var id = '';

    var stateStr = '';
    var timeStr = '';

    if (start != null && rows != null) {
        limitsql = ' LIMIT ' + start + ',' + rows;
    }

    if (user_id) {
        var id = ` and userid =${user_id}`
    }

    if (state) {
        var stateStr = ` and state ='${state}'`
    }
    if (start_time && end_time) {
        var timeStr = ` and time>${start_time} and time <${end_time}`
    }

    var sql1 = `SELECT count(*) as cnt  FROM t_withdraw_records WHERE money>0  ${id} ${stateStr} ${timeStr}`
    var ret1 = await dbpool.query(sql1);

    var sql = `SELECT * from t_withdraw_records WHERE money>0  ORDER BY create_time DESC` + limitsql;
    var ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    ret.rows[0].cnt = ret1.rows[0].cnt
    ret.rows[0].allpage = parseInt(ret1.rows[0].cnt / 10) + 1;

    return ret.rows;
};

exports.update_active_list_enable = async function (list, enable) {

    if (list == null || enable == null) {
        return null;
    }
    let listArr = [];
    for (let i = 0; i < list.length; i++) {
        if (list[i].checked && listArr.indexOf(list[i].active_id) == -1) {
            listArr.push(list[i].active_id)
        }
    }


    let sql = 'update t_user_active set enable = 1 WHERE active_id in ( ' + listArr + ' )';

    console.log(listArr)
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {

        return null;
    }
    return ret.rows.affectedRows > 0;
};
//添加商品
exports.add_good = async function ({ userid, good_name, introduction, picture_details, spec, price, inventory, class_id, after_sale_commitment }) {
    if (userid == null) {
        return;
    }

    let sql = `insert into t_goods(userid,class_id, name, price, inventory, spec, introduction, after_sale_commitment, picture_details,create_time) value(?,?,?,?,?,?,?,?,?,?)`
    sql = MYSQL.format(sql, [userid, class_id, good_name, price, inventory, spec, introduction, after_sale_commitment, picture_details, Date.now()]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return null;
    }

    return ret.rows.affectedRows > 0;
}


//修改商品
exports.update_good = async function ({ userid, good_id, good_name, introduction, picture_details, spec, price, inventory, class_id, after_sale_commitment }) {
    if (userid == null) {
        return;
    }

    let sql = `update  t_goods set class_id=?, name=?, price=?, inventory=?, spec=?, introduction=?, after_sale_commitment=?, picture_details=? where userid=? and good_id=?`
    sql = MYSQL.format(sql, [class_id, good_name, price, inventory, spec, introduction, after_sale_commitment, picture_details, userid, good_id]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return null;
    }

    return ret.rows.affectedRows > 0;
}

//删除商品
exports.delete_good = async function ({ userid, good_id }) {
    if (userid == null || good_id == null) {
        return;
    }

    let sql = `delete from t_goods where userid =? and good_id=?`
    sql = MYSQL.format(sql, [userid, good_id]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return null;
    }

    return true;
}
exports.get_good_class = async function (start, rows) {

    let limit = ''
    if (start & rows) {
        limit = `  limit ${start},${rows}  `
    }
    let sql = `select * from t_user_good_class where userid =${account_userid} ${limit}`

    var ret = await dbpool.query(sql);

    if (ret.err) {
        return false;
    }
    return ret.rows;
};

exports.add_good_class = async function (name, level) {

    let sql = `insert into t_user_good_class(userid,class_name,level) values(?,?,?) `
    sql = MYSQL.format(sql, [account_userid, name, level]);
    var ret = await dbpool.query(sql);

    if (ret.err) {
        return false;
    }
    return ret.rows;
};

exports.update_good_class = async function (id, name, level) {

    let sql = `update t_user_good_class set class_name=?,level = ? where good_class_id=? `
    sql = MYSQL.format(sql, [name, level, id]);
    var ret = await dbpool.query(sql);

    if (ret.err) {
        return false;
    }
    return ret.rows.affectedRows > 0;
};
exports.delete_good_class = async function (id) {

    let sql = `delete from t_user_good_class  where good_class_id=? and userid = ? `
    sql = MYSQL.format(sql, [id, account_userid]);
    var ret = await dbpool.query(sql);

    if (ret.err) {
        return false;
    }
    return ret.rows.affectedRows > 0;
};

exports.get_orders = async function (start, rows) {

    let limit = ''
    if (start & rows) {
        limit = `  limit ${start},${rows}  `
    }
    let sql1 = `SELECT count(*) as cnt  FROM qunjielong.t_user_active_records where  active_id in (SELECT active_id FROM t_user_active where originator_id ='${account_userid}' ) and payment_state = 3 ${limit}`

    let sql = `SELECT * FROM qunjielong.t_user_active_records where  active_id in (SELECT active_id FROM t_user_active where originator_id ='${account_userid}' ) and payment_state = 3 ${limit}`

    var ret1 = await dbpool.query(sql1);
    var ret = await dbpool.query(sql);

    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    ret.rows[0].cnt = ret1.rows[0].cnt
    return ret.rows;
};


exports.get_orders = async function (start, rows) {

    let limit = ''
    if (start & rows) {
        limit = `  limit ${start},${rows}  `
    }

    let sql = `SELECT * FROM qunjielong.t_user_active_records where  active_id in (SELECT active_id FROM t_user_active where originator_id ='${account_userid}' ) and payment_state = 3 ${limit}`

    var ret = await dbpool.query(sql);

    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows;
};

exports.get_order = async function (start, rows, userid, ord_id, start_time, end_time, state, good_id, post_no, agent, admin) {
    var limit = '';
    var id = '';
    var hasWhere = '';
    var time = '';
    var statestr = '';
    var goodstr = '';
    var agentstr = '';
    if (start != null && rows != null) {
        limit = ` LIMIT ${start},${rows}`;
    }

    if (userid || start_time || ord_id || state || good_id) {
        hasWhere = 'where'
    }

    if (userid) {
        id = `AND  t_orders.user_id = ${userid}`
    }
    if (good_id) {
        goodstr = ` AND t_ord_good_rel.good_id =   ${good_id}`
    }

    if (state) {

        statestr = ` AND t_orders.state = ${state}`
    }
    if (agent) {
        agentstr = ` AND t_orders.agent ='${agent}'`
    }
    if (start_time && end_time) {
        time = `AND  t_orders.time >= ${start_time} AND t_orders.time <= ${end_time}`
    }
    if (ord_id) {
        id = `AND  t_orders.ord_id = '${ord_id}'`
        time = '';
        statestr = '';
        goodstr = '';

    }
    var sql1 = `SELECT count(*) as cnt FROM  t_orders LEFT JOIN t_users on t_orders.user_id = t_users.userid where t_users.sex !=5 ${agentstr}   ${id} ${goodstr} ${statestr} ${time} `
    var sql = `SELECT t_orders.*, t_users.name as wxname FROM  t_orders LEFT JOIN t_users on t_orders.user_id = t_users.userid where t_users.sex !=5 ${agentstr}   ${id} ${goodstr} ${statestr} ${time} ORDER BY t_orders.time DESC  ${limit}`
    if (good_id) {

        var sql1 = `SELECT count(*) as cnt FROM  t_orders left join  t_ord_good_rel on t_orders.ord_id= t_ord_good_rel.ord_id  LEFT JOIN t_users on t_orders.user_id = t_users.userid where t_users.sex !=5 ${agentstr} ${id} ${goodstr}  ${statestr} ${time} `
        var sql = `SELECT t_orders.*, t_users.name as wxname FROM  t_orders LEFT JOIN t_users on t_orders.user_id = t_users.userid 
        left join  t_ord_good_rel on t_orders.ord_id= t_ord_good_rel.ord_id where t_users.sex !=5 ${agentstr}   ${id} ${goodstr} ${statestr} ${time} ORDER BY t_orders.time DESC  ${limit}`
    }
    if (post_no) {
        var sql = `select  count(*) as cnt from t_post left join t_orders on t_orders.ord_id = t_post.ord_id  where   t_post.post_no = '${post_no}' ${agentstr}`
        var sql = `select  t_orders.*, t_users.name as wxname from t_post left join t_orders on t_orders.ord_id = t_post.ord_id  LEFT JOIN t_users on t_orders.user_id = t_users.userid   where t_post.post_no = '${post_no}' ${agentstr}`
    }

    var ret = await dbpool.query(sql);
    var ret1 = await dbpool.query(sql1);

    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    ret.rows[0].cnt = ret1.rows[0].cnt
    ret.rows[0].allpage = parseInt(ret1.rows[0].cnt / 10) + 1;
    return ret.rows;
}
exports.delete_order = async function (order_id) {


    var sql = `select * from t_ord_good_rel where ord_id = '${order_id}'`;
    var ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return false;
    }
    var data = ret.rows
    var sql1 = `select * from t_orders where ord_id = '${order_id}'`;
    var ret1 = await dbpool.query(sql1);
    if (ret1.err || ret1.rows.length == 0) {
        return false;
    }

    var data1 = ret1.rows
    // if (data1[0].a_coins && data1[0].a_coins > 0) {
    //     var back_coins = data1[0].a_coins
    // } else {
    //     var check_id = order_id.substring(5);
    //     var checksql = `select count(num) as  cnt,count(distinct ord_id) as ordCnt from t_ord_good_rel where ord_id like '%${check_id}%'`;
    //     var checkret = await dbpool.query(checksql);
    //     if (checkret.err || checkret.rows.length == 0) {
    //         return false;
    //     }
    //     var allNum = checkret.rows[0].cnt
    //     var tag = Math.ceil(allNum / 2) - 1;
    //     var need_coins = 40 + tag * 10
    //     var back_coins = Math.ceil(need_coins / checkret.rows[0].ordCnt)
    //     var updateOrder = `update t_orders set a_coins=${back_coins} where ord_id like '%${check_id}%'`;
    //         var updateOrder = await dbpool.query(updateOrder);
    //     if (updateOrder.err ) {
    //         return false;
    //     }
    // }
    for (let key in data) {
        var sql2 = `update t_user_gift_record  set state = 0 where  user_id = ${data1[0].user_id} and gift_record_id = ${data[key].gift_record_id} `;

        // var sql2 = `update t_success SET change_num = change_num - ${data[key].num} where user_id = ${data1[0].user_id} and good_id =${data[key].good_id} `
        var ret2 = await dbpool.query(sql2);
        if (ret2.rows.affectedRows > 0) {
            var del = `delete from  t_ord_good_rel where ord_id = '${order_id}' and  gift_record_id = ${data[key].gift_record_id}`
            var del = await dbpool.query(del);
        }
    }
    var del_ord = `delete from  t_orders where ord_id = '${order_id}'`
    var del_ord = await dbpool.query(del_ord);
    if (del_ord.err) {
        return false
    }
    // var suc = await exports.add_user_coins(data1[0].user_id, back_coins, 'err')
    return {
        change: del_ord.rows.affectedRows > 0,
        user_id: data1[0].user_id
    }
}
exports.get_goods_by_order = async function (orderid) {
    var sql1 = `SELECT * FROM t_user_active_records where t_user_active_records.order_id = '${orderid}'`

    var ret1 = await dbpool.query(sql1);



    var sql = `SELECT t_goods.good_id,t_goods.name,t_goods.picture_details,t_goods.price ,t_active_records_good.num ,t_active_records_good.sign_in FROM t_active_records_good LEFT JOIN t_goods on t_active_records_good.group_way_id=t_goods.good_id WHERE t_active_records_good.attend_id = '${ret1.rows[0].attend_id}'`

    var ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0 || ret1.err || ret1.rows.length == 0) {
        return null;
    }
    for (var i = 0; i < ret.rows.length; i++) {
        // ret.rows[i].img = encodeURI(ret.rows[i].img);

        try {
            ret.rows[i].picture_details = JSON.parse(ret.rows[i].picture_details)
        }
        catch (e) {
            ret.rows[i].picture_details = ret.rows[i].picture_details.split(',')
        }

    }
    var data = {
        goods: ret.rows,
        addr: ret1.rows[0],
    }
    return data;
}

exports.get_order_by_id = async function (orderid) {
    var sql2 = `SELECT * FROM t_user_active_records where t_user_active_records.order_id = '${orderid}'`
    var sql = `SELECT t_goods.good_id,t_goods.name,t_goods.picture_details,t_goods.price ,t_active_records_good.num ,t_active_records_good.sign_in FROM t_active_records_good LEFT JOIN t_goods on t_active_records_good.group_way_id=t_goods.good_id WHERE t_active_records_good.attend_id = '${ret1.rows[0].attend_id}'`
    var ret = await dbpool.query(sql);
    var ret2 = await dbpool.query(sql2);

    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    for (var i = 0; i < ret.rows.length; i++) {
        try {
            ret.rows[i].picture_details = JSON.parse(ret.rows[i].picture_details)
        }
        catch (e) {
            ret.rows[i].picture_details = ret.rows[i].picture_details.split(',')
        }

        ret.rows[i].name = ret.rows[i].name + ' ' + ret.rows[i].spec
    }
    var data = {
        goods: ret.rows,
        info: ret2.rows[0]
    }
    return data;
}

exports.add_post_all = async function (orderid, postType, postNo, mark) {
    if (!mark) {
        mark = "无"
    }

    var sql0 = `SELECT * FROM t_user_active_records where t_user_active_records.order_id = '${orderid}'`
    var ret0 = await dbpool.query(sql0);

    var check_post = `select * from  t_post where ord_id ='${orderid}'`
    var check_post_ret = await dbpool.query(check_post);
    if (check_post_ret.rows.length > 0) {
        console.error('已经发货了')
        console.log('已经发货了')
        return false
    }

    var sql = ` INSERT INTO t_post(ord_id,post_type,post_no,time,mark) VALUES('${orderid}','${postType}','${postNo}','${Date.now()}','${mark}')`
    var ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    var sql = `update t_active_records_good  SET state = 1,post_no='${postNo}' where attend_id = '${ret0.rows[0].attend_id}' `
    var ret = await dbpool.query(sql);
    var sql1 = `UPDATE t_user_active_records SET state = 5 WHERE order_id = '${orderid}'`
    var ret1 = await dbpool.query(sql1);
    if (ret1.err) {
        return false;
    }
    return true
}

exports.recover = async function (userid, type, msg, froms, title, orderid, suggest_id, appeal_id) {
    var froms = ''
    if (PROJECT == 'aiqu') {
        froms = '爱趣抓娃娃'
    }
    else if (PROJECT == 'aoqu') {
        froms = '奥趣抓娃娃'
    }
    else if (PROJECT == 'mile') {
        froms = '咪乐抓娃娃'
    }
    else if (PROJECT == 'fzbk') {
        froms = '飞抓不可'
    }
    else if (PROJECT == 'taiguo') {
        froms = 'ทีมงานคีบจัง'
    } else {
        froms = '官方'
    }
    if (!orderid) {
        var orderid = '无'
    }
    if (!suggest_id) {
        var suggest_id = '无'
    }
    if (!appeal_id) {
        var appeal_id = '无'
    }
    var time = Date.now()
    var sql = `INSERT INTO t_message(user_id,type,content,msg_from ,time,title,ord_id,suggest_id,appeal_id) values(${userid},${type},'${msg}','${froms}',${time},'${title}','${orderid}','${suggest_id}','${appeal_id}') `
    var ret = await dbpool.query(sql);
    if (ret.err) {
        return false
    }
    return ret.rows.affectedRows > 0
}

exports.check_post_no = async function (post_no) {

    var sql = `select * from t_post where post_no = '${post_no}'`
    var ret = await dbpool.query(sql);

    return ret.rows.length < 2;
}

exports.add_post = async function (orderid, postType, postNo, mark, good) {
    if (!mark) {
        mark = "无"
    }

    var sql0 = `SELECT * FROM t_user_active_records where t_user_active_records.order_id = '${orderid}'`
    var ret0 = await dbpool.query(sql0);

    good = good.split(",")
    let post_good_list = [];
    for (let i = 0; i < good.length; i++) {
        var good_data = await exports.get_good_data(good[i])
        if (!good_data) {
            http.send(res, -1, word.系统出错);
            return;
        }
        post_good_list.push(good_data.name)
    }
    var check_post = `select * from  t_post where ord_id ='${orderid}'`
    var check_post_ret = await dbpool.query(check_post);
    if (check_post_ret.rows.length > 0) {
        console.error('又来了')
        console.log('又来了')
        return false
    }
    var sql = ` INSErT INTO t_post(ord_id,post_type,post_no,time,mark) VALUES('${orderid}','${postType}','${postNo}','${Date.now()}','${mark}')`
    var ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    for (var index in good) {
        var sql = `update t_active_records_good  SET state = 1,post_no='${postNo}' where attend_id = '${ret0.rows[0].attend_id}' AND good_id = ${good[index]} `
        var ret = await dbpool.query(sql);

    }
    var check = `select count(*) as cnt from t_active_records_good where attend_id = '${ret0.rows[0].attend_id}' AND state = 0`
    var check = await dbpool.query(check);
    if (check.rows[0].cnt == 0) {
        var sql1 = `UPDATE t_user_active_records SET state = 1 WHERE attend_id = '${ret0.rows[0].attend_id}'`
        var ret1 = await dbpool.query(sql1);
        if (ret1.err) {
            return false;
        }
    } else {
        var sql1 = `UPDATE t_user_active_records SET state = 1 WHERE attend_id = '${ret0.rows[0].attend_id}'`
        var ret1 = await dbpool.query(sql1);
        if (ret1.err) {
            return false;
        }
        var sql1 = `select * from t_user_active_records WHERE attend_id = '${ret0.rows[0].attend_id}'`
        var ret1 = await dbpool.query(sql1);
        if (ret1.err) {
            return false;
        }
        var data = ret1.rows[0]
        if (data.game_type == 14) {
            var ord_id = 'ND' + Date.now() + data.user_id
        } else if (data.game_type == 15) {
            var ord_id = 'LK' + Date.now() + data.user_id
        } else if (data.game_type == 17) {
            var ord_id = 'MK' + Date.now() + data.user_id
        } else {
            var ord_id = 'LP' + Date.now() + data.user_id
        }
        var suc = await exports.add_order(ord_id, data.user_id, data.name, data.tel, data.addr, data.com_id, data.time, data.game_type)
        if (suc) {
            var sql2 = `UPDATE t_active_records_good SET attend_id = '${ord_id}' where ord_id = '${orderid}' AND state = 0`
            var ret2 = await dbpool.query(sql2);
        }
    }
    return true
}

exports.add_post_url = async function (orderid, url) {

    var sql = `INSErT INTO t_post_url(ord_id,url) VALUES('${orderid}','${url}')`
    var ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }

    return true
}

exports.update_post_info = async function (orderid, name, tel, addr) {
    var sql = `UPDATE t_user_active_records SET real_name = '${name}', phone = '${tel}', addr = '${addr}' WHERE order_id = '${orderid}'`
    var ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }

    return ret.rows.affectedRows > 0;
}

exports.update_post = async function (orderid, postNo, post_type) {


    var sql0 = `SELECT * FROM t_user_active_records where t_user_active_records.order_id = '${orderid}'`
    var ret0 = await dbpool.query(sql0);

    var sql = `UPDATE t_post SET post_no = '${postNo}', post_type = '${post_type}' WHERE ord_id = '${orderid}'`
    var ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    if (ret.rows.affectedRows > 0) {
        var sql = `UPDATE t_active_records_good SET post_no = '${postNo}' WHERE attend_id = '${ret0.rows[0].attend_id}'`
        var ret = await dbpool.query(sql);
    }
    return ret.rows.affectedRows > 0;
}

exports.get_post = async function (orderid) {
    var sql = `SELECT * FROM t_post WHERE ord_id = '${orderid}'`
    var ret = await dbpool.query(sql);
    if (ret.err) {
        return null;
    }
    return ret.rows[0];
}

exports.get_good_data = async function (goodId) {

    var sql = 'SELECT * FROM t_goods WHERE good_id = ' + goodId;
    var ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    try {
        ret.rows[0].picture_details = JSON.parse(ret.rows[0].picture_details)
    }
    catch (e) {
        ret.rows[0].picture_details = ret.rows[0].picture_details.split(',')
    }


    return ret.rows[0];
};



exports.get_configs = async function (key) {
    var sql = `SELECT cvalue FROM t_configs where` + ' `ckey`' + `= '${key}'`;
    var ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return 0;
    }

    var data = ret.rows[0].cvalue;
    return data;
}
exports.get_configs_list = async function (start, rows, type) {
    var limitStr = ''
    var str = ''
    if (rows) {
        limitStr = `limit ${start},${rows}`
    }
    if (type) {
        str = `where type = '${type}'`
    } else {
        str = `where type = 0`
    }
    var sql1 = `SELECT count(*) as cnt FROM t_configs ${str} `;
    var sql = `SELECT * FROM t_configs ${str}  ${limitStr}`;
    var ret = await dbpool.query(sql);
    var ret1 = await dbpool.query(sql1);

    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    ret.rows[0].cnt = ret1.rows[0].cnt

    return ret.rows;
}
exports.add_configs = async function (name, key, value) {



    var sql = `INSERT INTO t_configs(name,` + '`ckey`' + `,cvalue) value('${name}','${key}','${value}')`;
    var ret = await dbpool.query(sql);

    if (ret.err) {
        return false;
    }

    return ret.rows.affectedRows > 0;
}
exports.update_configs = async function (id, name, key, value) {

    var sql = `UPDATE t_configs SET name = '${name}', ckey ='${key}', cvalue = '${value}'  where id =${id}`;
    var ret = await dbpool.query(sql);

    if (ret.err) {
        return false;
    }
    return ret.rows.affectedRows > 0;
}

exports.query = query;
