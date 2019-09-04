var dbpool = require('./dbpool');
var crypto = require('./crypto');
var MYSQL = require("mysql");

const PROJECT  = require("../configs").SERVER_CONF.name;



function query(sql, callback) {
    dbpool.query2(sql, callback);
};
function hasProject(regexp){
	return regexp.test(PROJECT)
}

exports.init = function (config) {
    dbpool.init(config);
};

//处理用户名称

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

//////////////////////////////////////
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

exports.get_wx_group_room_by_name = async function (group_name) {

    if (group_name == null) {
        return null;
    }

    group_name = crypto.toBase64(group_name);

    let sql = `SELECT * FROM t_wx_group_robot WHERE group_name = ?`;
    sql = MYSQL.format(sql, [group_name]);

    let ret = await dbpool.query(sql, true);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    ret.rows.map(e=>{
        e.group_name = crypto.fromBase64(e.group_name)
        return e
    })

    return ret.rows;

};

exports.get_wx_group_room_by_active_id = async function (active_id) {

    if (active_id == null) {
        return null;
    }

    let sql = `SELECT * FROM t_wx_group_robot WHERE active_id = ?`;
    sql = MYSQL.format(sql, [active_id]);
    let ret = await dbpool.query(sql, true);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    ret.rows.map(e=>{
        e.group_name = crypto.fromBase64(e.group_name)
        return e
    })

    return ret.rows;

};

exports.set_wx_group_room = async function (group_name,active_id) {

    if (group_name == null || active_id == null) {
        return null;
    }
    group_name = crypto.toBase64(group_name);

    let time = Date.now();

    let sql = `INSERT INTO t_wx_group_robot(group_name,active_id,create_time,alter_time) VALUES(?,?,?,?) on DUPLICATE key update active_id=?,alter_time=?`;

    sql = MYSQL.format(sql, [group_name,active_id,time,time,active_id,time]);
    let ret = await dbpool.query(sql, true);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows.affectedRows > 0;

};


exports.get_active_record_by_id = async function (id) {

    if (id == null) {
        return null;
    }

    let sql = 'SELECT t_users.name,t_users.headimg,t_user_active_records.* FROM t_user_active_records,t_users WHERE t_users.userid=t_user_active_records.userid and attend_id = ?';
    sql = MYSQL.format(sql, [id]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    let data = ret.rows[0];
  
    return data;
};

exports.get_active_by_id = async function (active_id) {
    if (active_id == null) {
        return;
    }

    let sql = 'select t_user_active.*,t_users.name,t_users.headimg from t_user_active,t_users where t_users.userid=t_user_active.originator_id and t_user_active.active_id = ?';
    sql = MYSQL.format(sql, [active_id]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length <= 0) {
        return false;
    }

    try {
        ret.rows[0].logistics = crypto.fromBase64(ret.rows[0].logistics)
    } catch (error) {

    }
    dealUserName(ret.rows)

    return ret.rows[0];

}

//查询凭证的商品信息
exports.getActiveRecordGoodInfo = async function ({ activeRecordData }) {

    let getActiveRecordsGoods_arr = {};
    let filedData = exports.retFiledData_to_arr(activeRecordData, 'attend_id');
    if (filedData) {
        getActiveRecordsGoods_arr = await exports.getActiveRecordsGoods_arr({ attend_ids: filedData.queryString })
    }

    for (let i = 0; i < activeRecordData.length; i++) {
        let { attend_id } = activeRecordData[i];
        let activeRecordsGoods = getActiveRecordsGoods_arr[attend_id];
        activeRecordData[i].activeRecordsGoods = activeRecordsGoods == null ? [] : activeRecordsGoods;
        try {
            activeRecordData[i].name = crypto.fromBase64(activeRecordData[i].name)
        } catch (error) {
        }
        try {
            activeRecordData[i].logistics = crypto.fromBase64(activeRecordData[i].logistics)
            activeRecordData[i].logistics = JSON.parse(activeRecordData[i].logistics)
        } catch (error) {

        }
    }

    return activeRecordData;
}

//mysql结果字段提取成数组和字符串
exports.retFiledData_to_arr = function (retRows, filedName) {
    if (retRows == null || filedName == null || retRows.length <= 0) {
        return null
    }

    let id_arr = [];
    retRows.forEach(e => {
        let filedData = e[filedName];
        if (filedData) {
            id_arr.push(filedData);
        }
    })
    if (id_arr.length == 0) {
        return null
    }
    return { arr: id_arr, queryString: `(${id_arr.join(',')})` };
}
exports.query = query;