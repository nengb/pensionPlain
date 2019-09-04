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



exports.query = query;