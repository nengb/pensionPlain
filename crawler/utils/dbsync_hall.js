let dbpool = require('./dbpool');
let crypto = require('./crypto');
let MYSQL = require("mysql");
let moment = require("moment");

//待支付有效时间  20分钟
let pay_fail_time = 20 * 60 * 1000

async function generateUserId() {
    let Id = "";
    for (let i = 0; i < 8; ++i) {
        if (i > 0) {
            Id += Math.floor(Math.random() * 10);
        }
        else {
            Id += Math.floor(Math.random() * 9) + 1;
        }
    }
    let ret = await exports.get_user_data_by_userid(Id)
    if (ret) {
        return await generateUserId();
    } else {
        return Id;
    }
}


function query(sql, callback) {
    dbpool.query2(sql, callback);
};

//处理多条件
function dealUpdateQuery(querys) {
    let query = ''
    let queryArr = [];
    if (querys && querys.length > 0) {
        querys.forEach((e, i) => {
            if (e.type == 'add') {
                query += `${e.key}=${e.key}+?`
            } else {
                query += `${e.key}=?`
            }

            queryArr.push(e.value)
            if (i != querys.length - 1) {
                query += ','
            }
        });

    }
    return { query, queryArr }
}

//处理多条件 or
function dealOrQuery(querys) {
    let query = ''
    let queryArr = [];
    if (querys && querys.length > 0) {
        querys.forEach((e, i) => {
            query += `${e.key}=?`
            queryArr.push(e.value)
            if (i != querys.length - 1) {
                query += ' or '
            }
        });

    }
    return { query, queryArr }
}

//处理sql多条件
function dealQuery(querys) {
    let query = ''
    if (querys && querys.length > 0) {
        query = 'where '
        querys.forEach((e, i) => {
            query += e
            if (i != querys.length - 1) {
                query += ' and '
            }
        });

    }
    return query
}




//处理用户名称

function dealUserName(resultData) {
    if (!resultData || resultData.length <= 0) {
        return resultData;
    }

    resultData.map(e => {
        try {
            e.name = crypto.fromBase64(e.name)
            e.headimg = dealImg(e.headimg)

        } catch (error) {

        }
        return e;
    })

    return resultData
}
function dealImg(url){
    if(!url){
        return;
    }
    let miniDomain = {
        "thirdwx.qlogo.cn":true,
        "www.csxtech.com.cn":true,
        "wx.qlogo.cn":true,
    }
    try {
        
        url = url.replace("http://",'https://');
        let a = url;
        let domainUrl = a.replace(/^https?:\/\/(.*?)(:\d+)?\/.*$/,'$1');
        if(!miniDomain[domainUrl]){
            url = `https://www.csxtech.com.cn/web_req/get_img?url=`+encodeURIComponent(url)
        }
    } catch (error) {
     
    }
 
    return url;

}
function dealActiveInfoImg(resultData,key) {
    console.log("e.dealActiveInfoImg")
    if (!resultData || resultData.length <= 0) {
        return resultData;
    }
    let firstImg = false;
    resultData.map(e => {
        e.headimg = dealImg(e.headimg)
        if(e.list_info && e.list_info.length>0){
            e.list_info.map(item=>{
                if(item.type == '单图' || item.type == '多图'){
                        if(!firstImg){
                            item.value[0] = dealImg(item.value[0])
                            firstImg = true;
                        }

                }
                return item;
            })
        }
   
        return e;
    })

    return resultData
}

function dealListInfo(resultData) {
    if (!resultData || resultData.length <= 0) {
        return resultData;
    }

    resultData.map(e => {
        try {
            e.list_info = crypto.fromBase64(e.list_info)
            e.list_info = JSON.parse(e.list_info)
        } catch (error) {
        }

        return e;
    })

    return resultData
}



exports.init = function (config) {
    dbpool.init(config);
};



///////////////////////////////////////////////////

//添加请求日志
exports.add_request_log = async function ({ method, query, body, start_time, end_time, delay_time, userid, pathname, user_agent, ip, sendData }) {
    let sql = 'INSERT INTO t_http_request_log(method, query, body, start_time, end_time, delay_time, userid, pathname, user_agent,create_time,ip,sendData) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)';
    sql = MYSQL.format(sql, [method, query, body, start_time, end_time, delay_time, userid, pathname, user_agent, Date.now(), ip, sendData]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    return ret.rows.affectedRows > 0
}

exports.get_user_data = async function (account) {

    if (account == null) {
        return null;
    }

    let sql = 'SELECT * FROM t_users WHERE account = "' + account + '"';
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {

        return null;
    }

    let data = ret.rows[0];
    try {
        data.name = crypto.fromBase64(data.name);
    } catch (error) {

    }

    return data;
};



exports.get_user_data_by_u_o_wxo_a = async function ({ unionid, openid, wx_openid, account }) {

    let orQuerys = [
        { key: `unionid`, value: unionid },
        { key: `openid`, value: openid },
        { key: `wx_openid`, value: wx_openid },
        { key: `account`, value: account },

    ]
    orQuerys = orQuerys.filter(e => {
        return e.value != null
    })

    if (orQuerys && orQuerys.length == 0) {
        return;
    }

    let { query, queryArr } = dealOrQuery(orQuerys);

    let sql = `SELECT * FROM t_users WHERE ${query}`;
    sql = MYSQL.format(sql, queryArr);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    dealUserName(ret.rows)
    return ret.rows[0];

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


exports.get_user_data_by_token = async function (token) {

    if (token == null) {
        return null;
    }

    let sql = `SELECT * FROM t_users WHERE token = ?`;
    sql = MYSQL.format(sql, [token]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    dealUserName(ret.rows)

    return ret.rows[0];

};


exports.update_user_token = async function (userid, token, time) {
    if (userid == null || token == null || time == null) {
        return;
    }
    let sql = `update t_users set token=?,token_time=? where userid=? `
    sql = MYSQL.format(sql, [token, time, userid]);
    let ret = await dbpool.query(sql);

    if (ret.err) {
        return false;
    }
    return ret.rows.affectedRows > 0;
}

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

exports.create_user = async function ({ account, name, sex, headimg, invitor, openid, unionid, wx_openid }) {
    if (account == null || name == null || (openid == null && wx_openid == null)) {
        return false;
    }

    let time = Date.now();
    try {

        name = crypto.toBase64(name);
    } catch (error) {
    }
    // while (true) {
    let userid = await generateUserId();


    //创建用户
    let sql = 'INSERT INTO t_users(userid,account,name,sex,headimg,create_time,invitor_id,openid, unionid, wx_openid) VALUES(?,?,?,?,?,?,?,?,?,?)';
    sql = MYSQL.format(sql, [userid, account, name, sex, headimg, time, invitor, openid, unionid, wx_openid]);


    //添加订阅
    let sqlSubscribe = `INSERT INTO t_user_subscribe(userid,subscribe_id,create_time) VALUES(?,?,?)`
    sqlSubscribe = MYSQL.format(sqlSubscribe, [userid, userid, Date.now()]);
    //添加粉丝
    let sqlFans = `INSERT INTO t_user_fans(userid,fansid,fans_state,create_time) VALUES(?,?,?,?)`
    sqlFans = MYSQL.format(sqlFans, [userid, userid, 0, Date.now()]);


    let sqls = [
        sql,
        sqlSubscribe,
        sqlFans,
    ]

    //关注官方
    let officalUser = await exports.get_user_data_by_userid(88888888);
    if (officalUser && officalUser.userid) {
        let officalUserSubscribe = `INSERT INTO t_user_subscribe(userid,subscribe_id,create_time) VALUES(?,?,?)`
        officalUserSubscribe = MYSQL.format(officalUserSubscribe, [userid, officalUser.userid, Date.now()]);
        let officalUserFans = `INSERT INTO t_user_fans(userid,fansid,fans_state,create_time) VALUES(?,?,?,?)`
        officalUserFans = MYSQL.format(officalUserFans, [officalUser.userid, userid, 0, Date.now()]);
        sqls.push(officalUserSubscribe)
        sqls.push(officalUserFans)
    }

    let ret = await dbpool.queryTransaction(sqls);
    // let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }

    return ret.rows[0][0].affectedRows > 0;

};
//订阅用户
exports.subscribe_user = async function ({ userid, subscribe_id }) {

    let sqlSubscribe = `select * from t_user_subscribe where userid=? and subscribe_id = ?`
    sqlSubscribe = MYSQL.format(sqlSubscribe, [userid, subscribe_id]);

    let retSubscribe = await dbpool.query(sqlSubscribe);
    if (retSubscribe.err) {
        return false;
    }
    if (retSubscribe.rows.length == 0) {
        let sql = 'INSERT INTO t_user_subscribe(userid,subscribe_id,create_time) VALUES(?,?,?) on DUPLICATE key update create_time=create_time';
        sql = MYSQL.format(sql, [userid, subscribe_id, Date.now()]);

        let ret = await dbpool.query(sql);
        if (ret.err) {
            return false;
        }
        return ret.rows.affectedRows > 0;

    } else {
        return true;
    }



}

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

exports.check_buy_count = async function (userid, active_id) {
    if (active_id == null || userid == null) {
        return;
    }

    let sql = 'select count(*) as cnt,sum(attend_cost) as all_cost from t_user_active_records where userid = ? and active_id =?  and ( payment_state = 0 or payment_state =3) ';
    sql = MYSQL.format(sql, [userid, active_id]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length <= 0) {
        return { cnt: 0, all_cost: 0 }
    }


    return ret.rows[0];

}
//订阅活动用户
exports.subscribe_active_user = async function ({ userid, active_id }) {

    let active = await exports.get_active_by_id(active_id);
    if (!active) {
        return;
    }
    let subscribe_user = await exports.subscribe_user({ userid, subscribe_id: active.originator_id })

    return subscribe_user

}
//添加粉丝
exports.add_user_fans = async function ({ userid, fansid }) {
    let sqlFans = `select * from t_user_fans where userid=? and fansid = ?`
    sqlFans = MYSQL.format(sqlFans, [userid, fansid]);

    let retFans = await dbpool.query(sqlFans);
    if (retFans.err) {
        return false;
    }
    if (retFans.rows.length == 0) {
        let sql = 'INSERT INTO t_user_fans(userid,fansid,fans_state,create_time) VALUES(?,?,?,?) on DUPLICATE key update create_time=create_time';
        sql = MYSQL.format(sql, [userid, fansid, 0, Date.now()]);
        let ret = await dbpool.query(sql);
        if (ret.err) {
            return false;
        }
        return ret.rows.affectedRows > 0;
    } else {
        return true;
    }

}
//添加该活动的创始人粉丝
exports.add_active_user_fans = async function ({ userid, active_id }) {
    let active = await exports.get_active_by_id(active_id);
    if (!active) {
        return;
    }
    let add_user_fans = await exports.add_user_fans({ userid: active.originator_id, fansid: userid })

    return add_user_fans > 0;

}

//统计所有接龙数量
exports.getActiveCount = async function () {

    let sql = `select count(*) as activeCount from t_user_active`

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows[0];
}
//统计总参与人数
exports.getAttendActiveCount = async function () {

    let sql = `SELECT count(distinct userid) as attendActiveCount FROM t_user_active_records where payment_state in (0,3)`

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows[0];
}
//统计玩家数量
exports.getUserCount = async function () {

    let sql = `SELECT count(*) as userCount FROM t_users`

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows[0];
}

//获取活动列表_用户信息
exports.getActiveTypeList_user = async function ({ userid }) {
    if (userid == null) {
        return;
    }
    let sql = `SELECT t_active_list.*,A.alter_time as last_attend_time FROM t_active_list LEFT JOIN (select active_type,alter_time from t_user_active where originator_id=? GROUP BY active_type ORDER BY alter_time desc) as A on A.active_type = t_active_list.active_type`
    sql = MYSQL.format(sql, [userid]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows;
}

//获取活动列表
exports.getActiveTypeList = async function (active_type) {
    let activeType = active_type == null ? '' : `where active_type = ${active_type}`
    let sql = `SELECT * from t_active_list ${activeType}`
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows;
}

//获取用户最新的接龙
exports.getLastActive = async function ({ userid }) {
    if (userid == null) {
        return;
    }
    let sql = `select * from t_user_active where originator_id=? order by alter_time desc limit 1`
    sql = MYSQL.format(sql, [userid]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows[0];
}


//发布接龙
exports.add_user_active = async function ({
    originator_id, active_type, phone, title, state,
    list_info, o_list_info, group_way, most_optional,
    hide = 0, start_time, end_time, background,
    user_secret, leave_msg, all_count, start_price, start_price_mode, show_user_info,
    pay_mode, reward_setting, tips, logistics_mode, show_reward_rule,
    reward_amount, reward_num, use_reward, use_share_reward, use_reward_locale,
    share_reward_rule, use_local, local_area_count, local_list, reward_local_area_count, reward_local_list
    }) {
    //可通知次数
    try {
        list_info = crypto.toBase64(list_info)
    } catch (error) {
    }
    let notice_num = 2
    let create_time = Date.now();
    let sql = `insert into t_user_active(
        originator_id, active_type, phone, title, state, 
        list_info, o_list_info, most_optional, hide, start_time, 
        end_time, background, user_secret, leave_msg,all_count, 
        start_price, start_price_mode, show_user_info, pay_mode, reward_setting, 
        tips, create_time, alter_time,logistics_mode, notice_num,
        show_reward_rule, reward_amount, reward_num, remain_reward_amount, remain_reward_num, 
        use_reward,use_share_reward,use_reward_locale,use_local,local_area_count,
        reward_local_area_count) 
        value(
        ?,?,?,?,?,
        ?,?,?,?,?,
        ?,?,?,?,?,
        ?,?,?,?,?,
        ?,?,?,?,?,
        ?,?,?,?,?,
        ?,?,?,?,?,
        ?
        )`
    sql = MYSQL.format(sql, [
        originator_id, active_type, phone, title, state,
        list_info, o_list_info, most_optional, hide, start_time,
        end_time, background, user_secret, leave_msg, all_count,
        start_price, start_price_mode, show_user_info, pay_mode, reward_setting,
        tips, create_time, create_time, logistics_mode, notice_num,
        show_reward_rule, reward_amount, reward_num, reward_amount, reward_num,
        use_reward, use_share_reward, use_reward_locale, use_local, local_area_count,
        reward_local_area_count
    ]);

    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    let affectedRows = ret.rows.affectedRows > 0
    let insertId = ret.rows.insertId
    if (affectedRows) {
        // let getLastActive = await exports.getLastActive({userid:originator_id})
        // if(getLastActive){
        let saveLocalResult = await saveLocal({ active_id: insertId, local_list, type: 0 })
        let saveRewardLocalResult = await saveLocal({ active_id: insertId, local_list: reward_local_list, type: 1 })

        let saveGroupWayResult = await saveGroupWay({ active_id: insertId, group_way })
        let saveShareRewardRuleResult = await saveShareRewardRule({ active_id: insertId, share_reward_rule })
        console.log(`saveLocalResult ${saveLocalResult} saveRewardLocalResult ${saveRewardLocalResult} saveGroupWayResult ${saveGroupWayResult} saveShareRewardRuleResult ${saveShareRewardRuleResult} insertId   ${insertId}`)
        // }
    }
    return insertId
}
//获取接龙地址限制信息
exports.get_active_locale = async function ({ active_id, type }) {
    if (active_id == null) {
        return;
    }
    let typeQuery = type == null ? '' : `and type = ${type}`;
    let sql = `select * from t_active_local where active_id=? ${typeQuery} order by create_time desc `
    sql = MYSQL.format(sql, [active_id, type]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows;
}

//获取用户接龙奖励
exports.get_user_reward = async function ({ active_id, userid }) {
    if (active_id == null || userid == null) {
        return;
    }
    let sql = `select count(*) as all_count ,ifnull(sum(reward_money),0) as all_money from t_user_active_records where reward_money>0 and active_id = ? and userid=?`
    sql = MYSQL.format(sql, [active_id, userid]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return {
            all_count: 0,
            all_money: 0,
        };
    }
    return ret.rows[0];
}

//获取用户接龙分享奖励
exports.get_user_share_reward = async function ({ active_id, userid }) {
    if (active_id == null || userid == null) {
        return;
    }
    let sql = `select count(*) as all_count ,ifnull(sum(reward_money),0) as all_money from t_active_share_reward where reward_money>0 and active_id = ? and userid=?`
    sql = MYSQL.format(sql, [active_id, userid]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return {
            all_count: 0,
            all_money: 0,
        };
    }
    return ret.rows[0];
}
//保存接龙地址信息
async function saveLocal({ active_id, local_list, type }) {
    if (active_id == null || local_list == null) {
        return;
    }
    let valueQuerys = '';
    let sqls = [];

    local_list.forEach(e => {
        let { latitude, longitude, name, address } = e;
        let sql = `insert into t_active_local(active_id, latitude, longitude, name, address, create_time, type) value (?,?,?,?,?,?,?) on  DUPLICATE key update name=?, address=?`
        sql = MYSQL.format(sql, [active_id, latitude, longitude, name, address, Date.now(), type, name, address]);
        sqls.push(sql)
    })

    let ret = await dbpool.queryTransaction(sqls);
    if (ret.err) {
        return false;
    }
    return ret.rows[0][0].affectedRows > 0;
}
//删除接龙地址信息
async function deleteLocal({ active_id, type }) {
    if (active_id == null || type == null) {
        return;
    }

    let sql = `delete from t_active_local where active_id='${active_id}' and type= ${type}`
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }

    return true
}



//保存接龙商品信息
async function saveGroupWay({ active_id, group_way }) {
    if (active_id == null || group_way == null) {
        return;
    }
    let valueQuerys = '';
    let sqls = [];

    group_way.forEach(e => {
        let { group_way_id, url, name, size, price, stock, good_class_id, desc, ensure } = e;
        group_way_id = group_way_id == null ? null : group_way_id;
        try {
            url = JSON.stringify(url)
            good_class_id == null ? good_class_id = null : null;
        } catch (error) {
        }

        let valueQuerys = `(${group_way_id},?,?,?,?,?,?,?,?,?)`

        let sql = "insert into t_active_group_way(group_way_id,active_id,url,name,size,price,stock,good_class_id,`desc`,ensure) value " + valueQuerys + " on  DUPLICATE key update active_id=?,url=?,name=?,size=?,price=?,stock=?,good_class_id=?,`desc`=?,ensure=?"
        sql = MYSQL.format(sql, [
            active_id, url, name, size, price, stock, good_class_id, desc, ensure,
            active_id, url, name, size, price, stock, good_class_id, desc, ensure]);
        sqls.push(sql)


    })

    let ret = await dbpool.queryTransaction(sqls);
    if (ret.err) {
        return false;
    }
    return ret.rows[0][0].affectedRows > 0;
}
//删除接龙商品信息
async function deleteGroupWay({ active_id }) {
    if (active_id == null) {
        return;
    }

    let sql = `delete from t_active_group_way where active_id='${active_id}' and join_num=0`
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }

    return true
}
//保存接龙分享奖励规则信息
async function saveShareRewardRule({ active_id, share_reward_rule }) {
    if (active_id == null || share_reward_rule == null) {
        return;
    }
    let valueQuerys = '';
    let sqls = [];
    let time = Date.now();

    share_reward_rule.forEach(e => {
        let { share_reward_rule_id, start_money, reward_ratio } = e;
        share_reward_rule_id = share_reward_rule_id == null ? null : share_reward_rule_id;

        let valueQuerys = `(${share_reward_rule_id},?,?,?,?,?)`
        let sql = 'insert into t_active_share_reward_rule(share_reward_rule_id,active_id,start_money,reward_ratio,create_time,alter_time) value' + valueQuerys +
            'on  DUPLICATE key update start_money=?,reward_ratio=?,alter_time=?'
        sql = MYSQL.format(sql, [
            active_id, start_money, reward_ratio, time, time, start_money, reward_ratio, time]);
        sqls.push(sql)
    })


    let ret = await dbpool.queryTransaction(sqls);

    if (ret.err) {
        return false;
    }
    return ret.rows[0][0].affectedRows > 0;
}
//删除接龙分享奖励规则
async function deleteShareRewardRule({ active_id }) {
    if (active_id == null) {
        return;
    }

    let sql = `delete from t_active_share_reward_rule where active_id=?`
    sql = MYSQL.format(sql, [active_id]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    return true;
}

//更新接龙
exports.update_user_active = async function ({
    active_id, phone, title, state, list_info,
    o_list_info, group_way, most_optional, hide, start_time,
    end_time, background, user_secret, leave_msg, all_count,
    start_price, start_price_mode, show_user_info, pay_mode, reward_setting,
    tips, logistics_mode, show_reward_rule, reward_amount, reward_num,
    use_reward, use_share_reward, use_reward_locale, share_reward_rule, use_local,
    local_area_count, local_list, reward_local_area_count, reward_local_list
     }) {
    if (active_id == null) {
        return;
    }

    let alter_time = Date.now();
    try {
        list_info = crypto.toBase64(list_info)
    } catch (error) {
    }
    let updateQuerys = [
        { key: `phone`, value: phone },
        { key: `title`, value: title },
        { key: `state`, value: state },
        { key: `list_info`, value: list_info },
        { key: `o_list_info`, value: o_list_info },
        { key: `most_optional`, value: most_optional },
        { key: `hide`, value: hide },
        { key: `start_time`, value: start_time },
        { key: `end_time`, value: end_time },
        { key: `background`, value: background },
        { key: `user_secret`, value: user_secret },
        { key: `leave_msg`, value: leave_msg },
        { key: `all_count`, value: all_count },
        { key: `start_price`, value: start_price },
        { key: `start_price_mode`, value: start_price_mode },
        { key: `show_user_info`, value: show_user_info },
        { key: `pay_mode`, value: pay_mode },
        { key: `reward_setting`, value: reward_setting },
        { key: `tips`, value: tips },
        { key: `alter_time`, value: alter_time },
        { key: `logistics_mode`, value: logistics_mode },
        { key: `show_reward_rule`, value: show_reward_rule },

        { key: `reward_amount`, value: reward_amount, type: 'add' },
        { key: `reward_num`, value: reward_num, type: 'add' },
        { key: `remain_reward_amount`, value: reward_amount, type: 'add' },
        { key: `remain_reward_num`, value: reward_num, type: 'add' },

        { key: `use_reward`, value: use_reward },
        { key: `use_share_reward`, value: use_share_reward },
        { key: `use_reward_locale`, value: use_reward_locale },
        { key: `use_local`, value: use_local },
        { key: `local_area_count`, value: local_area_count },
        { key: `reward_local_area_count`, value: reward_local_area_count },
    ]

    updateQuerys = updateQuerys.filter(e => {
        return e.value != null
    })

    let { query, queryArr } = dealUpdateQuery(updateQuerys);


    let sql = `update t_user_active set ${query} where active_id=?`
    sql = MYSQL.format(sql, [...queryArr, active_id]);

    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }

    let affectedRows = ret.rows.affectedRows > 0
    console.log(ret.rows)
    if (affectedRows) {
        //更新接龙地址信息
        if (local_list && local_list.length > 0) {
            let type = 0;
            let deleteLocalResult = await deleteLocal({ active_id, type })
            if (deleteLocalResult) {
                let saveLocalResult = await saveLocal({ active_id, local_list, type })
                console.log(` saveLocalResult ${saveLocalResult}`)
            }
        }
        //更新接龙奖励地址信息
        if (reward_local_list && reward_local_list.length > 0) {
            let type = 1;
            let deleteLocalResult = await deleteLocal({ active_id, type })
            if (deleteLocalResult) {
                let saveLocalResult = await saveLocal({ active_id, local_list: reward_local_list, type })
                console.log(` saveRewardLocalResult ${saveLocalResult}`)
            }
        }

        //更新接龙商品信息
        if (group_way && group_way.length > 0) {
            let deleteGroupWayResult = await deleteGroupWay({ active_id })
            if (deleteGroupWayResult) {
                let saveGroupWayResult = await saveGroupWay({ active_id, group_way })
                console.log(` saveGroupWayResult ${saveGroupWayResult}`)
            }
        }

        //更新接龙分享奖励规则
        if (share_reward_rule && share_reward_rule.length > 0) {
            let deleteShareRewardRuleResult = await deleteShareRewardRule({ active_id })
            if (deleteShareRewardRuleResult) {
                let saveShareRewardRuleResult = await saveShareRewardRule({ active_id, share_reward_rule })
                console.log(` saveShareRewardRuleResult ${saveShareRewardRuleResult}`)
            }
        }


    }
    return affectedRows;
}

//更新接龙状态
exports.update_active_state = async function ({ userid, active_id, state, hidden = 0, start_time, end_time }) {
    if (active_id == null || userid == null || state == null || hidden == null) {
        return;
    }



    let sql;
    if (state == -1) {
        sql = `delete from t_user_active where active_id=? and originator_id=?`
        sql = MYSQL.format(sql, [active_id, userid]);
    } else {
        let updateQuerys = []
        state != null ? updateQuerys.push({ key: `state`, value: state }) : null;
        hidden != null ? updateQuerys.push({ key: `hidden`, value: hidden }) : null;
        start_time != null ? updateQuerys.push({ key: `start_time`, value: start_time }) : null;
        end_time != null ? updateQuerys.push({ key: `end_time`, value: end_time }) : null;
        let { query, queryArr } = dealUpdateQuery(updateQuerys);
        sql = `update t_user_active set ${query} where active_id=? and originator_id=?`
        sql = MYSQL.format(sql, [...queryArr, active_id, userid]);
    }

    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }

    return ret.rows.affectedRows > 0;
}

//阅读接龙
exports.read_active = async function ({ userid, active_id, invitor_id }) {
    if (active_id == null || userid == null) {
        return;
    }
    invitor_id = invitor_id == null ? null : invitor_id;
    let time = Date.now();
    let sql = `insert into t_user_read_active (userid,active_id,readTimes,create_time,alter_time,invitor_id,originator_id,title) 
    SELECT ? as userid,? as active_id  ,? as readTimes,? as create_time,? as alter_time,? as invitor_id, originator_id, title from t_user_active where active_id=?
     on  DUPLICATE key update readTimes=readTimes+1,alter_time=?`
    sql = MYSQL.format(sql, [userid, active_id, 1, time, time, invitor_id, active_id, time]);

    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }

    exports.subscribe_active_user({ userid, active_id })
    exports.add_active_user_fans({ userid, active_id })
    return ret.rows.affectedRows > 0;
}


//统计玩家粉丝数量
exports.getFansCount = async function (userid) {
    if (userid == null) {
        return;
    }

    let sql = `SELECT count(*) as userFansCount FROM t_user_fans where userid = ?`
    sql = MYSQL.format(sql, [userid]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows[0];
}
//统计玩家关注公众号的粉丝数量
exports.getFansAttentWechatCount = async function (userid) {
    if (userid == null) {
        return;
    }

    let sql = `SELECT count(*) as userFansCount FROM t_user_fans,t_users where t_user_fans.userid = ? and t_user_fans.fansid = t_users.userid and t_users.attent_wechat=1`
    sql = MYSQL.format(sql, [userid]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows[0];
}

//获取粉丝信息
exports.getFansList = async function ({ userid, attent_wechat, name, start, rows }) {
    if (userid == null) {
        return;
    }
    let querys = []

    attent_wechat != null ? querys.push(`t_users.attent_wechat='${attent_wechat}'`) : null;
    name != null ? querys.push(`( from_base64(t_users.name) like '%${name}%' or from_base64(t_user_fans.remark_name) like '%${name}%')`) : null;
    querys.push(`t_user_fans.userid='${userid}'`)
    let query = dealQuery(querys)

    let limitsql = '';
    if (start != null && rows != null) {
        limitsql = ' LIMIT ' + start + ',' + rows;
    }

    let sql = `SELECT t_user_fans.*,t_users.name,t_users.headimg,t_users.attent_wechat,IFNULL(A.readTimes,0) as readTimes,A.read_alter_time,A.active_id,A.title,IFNULL(B.attendTimes,0) as attendTimes,IFNULL(B.attendCost,0) as attendCost FROM t_user_fans
    LEFT JOIN t_users on t_users.userid = t_user_fans.fansid 
    LEFT JOIN 
    ( select rt.*,sum(one_readTime) as readTimes from (select userid,t_user_read_active.originator_id,  readTimes as one_readTime  ,t_user_read_active.alter_time as read_alter_time,t_user_read_active.active_id,IFNULL(t_user_active.title ,t_user_read_active.title) as title
    from t_user_read_active
    LEFT JOIN t_user_active on t_user_read_active.active_id = t_user_active.active_id
    where t_user_read_active.originator_id = '${userid}'
    ORDER BY t_user_read_active.userid asc, t_user_read_active.alter_time desc) as rt  GROUP BY userid) as A
    on A.userid = t_user_fans.fansid and A.originator_id = t_user_fans.userid
    LEFT JOIN 
    (select userid,originator_id,count(*) as attendTimes,t_user_active_records.active_id,sum(t_user_active_records.attend_cost) as attendCost from t_user_active_records,t_user_active 
    where t_user_active_records.active_id = t_user_active.active_id and originator_id='${userid}' GROUP BY userid) as B
    on B.userid = t_user_fans.fansid and B.originator_id = t_user_fans.userid
    ${query}
    ORDER BY create_time desc
    ${limitsql}
    `
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    ret.rows.map(e => {
        try {
            e.name = crypto.fromBase64(e.name);
        } catch (error) {
        }

        try {
            e.remark_name = crypto.fromBase64(e.remark_name);
        } catch (error) {
        }

        return e;
    })

    return ret.rows;
}

//更新粉丝信息
exports.update_user_fans_info = async function ({ fansid, fans_state, remark_name }) {
    if (fansid == null || (fans_state == null && remark_name == null)) {
        return null;
    }

    try {
        remark_name = crypto.toBase64(remark_name);
    } catch (error) {
    }
    let query = '';
    fans_state != null ? query += `fans_state = "${fans_state}",` : null;
    remark_name != null ? query += `remark_name = "${remark_name}",` : null;
    fans_state == 1 ? query += `shield_fans_time="${Date.now()}" ` : `shield_fans_time=0`
    query = query.substr(0, query.length - 1);

    let sql = `UPDATE t_user_fans SET ${query}  WHERE fansid= ?`;
    sql = MYSQL.format(sql, [fansid]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    return ret.rows.affectedRows > 0;

};

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

//获取多个活动的凭证记录
exports.getUserAttendRecords_by_activeIds = async function ({ active_ids, start, rows }) {

    let limitsql = '';
    if (start != null && rows != null) {
        limitsql = ' LIMIT ' + start + ',' + rows;
    }
    let sql = `SELECT t_user_active_records.*,t_users.name,t_users.headimg FROM t_user_active_records,t_users where t_user_active_records.userid=t_users.userid and t_user_active_records.payment_state in (0,3) and  t_user_active_records.active_id in ${active_ids} ORDER BY active_index desc ${limitsql}`;
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return {};
    }

    dealActiveInfoImg(ret.rows)


    //分类凭证数据对应到每个活动
    let data = classify_retData(ret.rows, 'active_id');
    // //存所有活动的对应数据

    //查询每个活动对应的每个凭证的商品信息
    for (let key in data) {
        data[key] = await exports.getActiveRecordGoodInfo({ activeRecordData: data[key] });
    }
    return data;

}

//每个接龙的凭证数量
exports.getActivesAttendCount_by_activeIds = async function ({ active_ids, userDistinct }) {
    let data = {}
    let distinctUser = userDistinct ? 'distinct ' : ''
    let sql = `select count(${distinctUser}userid) as attendCount,active_id from t_user_active_records where t_user_active_records.active_id in ${active_ids} and t_user_active_records.payment_state in (0,3) GROUP BY active_id`;
    let ret = await dbpool.query(sql);
    if (!ret.err && ret.rows.length != 0) {
        ret.rows.forEach(e => {
            let { active_id, attendCount } = e
            data[active_id] = attendCount;
        })
    }

    return data;
}


//获取每个接龙的商品信息
exports.get_group_way_by_activeIds = async function ({ active_ids }) {
    if (active_ids == null) {
        return {};
    }

    let sql = `select t_active_group_way.*,t_user_good_class.class_name from t_active_group_way LEFT JOIN t_user_good_class on t_user_good_class.good_class_id=t_active_group_way.good_class_id where active_id in ${active_ids} order by group_way_id asc`
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return {};
    }

    let data = classify_retData(ret.rows, 'active_id');

    return data;
}

//每个接龙看过的总人数
exports.getActivesReadCount_by_activeIds = async function ({ active_ids }) {
    let data = {}
    let sql = `select count(*) as readTimes,active_id from t_user_read_active where t_user_read_active.active_id in  ${active_ids} GROUP BY active_id`;
    let ret = await dbpool.query(sql);
    if (!ret.err && ret.rows.length != 0) {
        ret.rows.forEach(e => {
            let { active_id, readTimes } = e
            data[active_id] = readTimes;
        })
    }

    return data;
}

//获取每个接龙商品最大价格和最小价格
exports.getActivesMaxMinPrice_by_activeIds = async function ({ active_ids }) {
    let data = {}
    let sql = `SELECT active_id,max(price) as max_price,min(price) as min_price FROM t_active_group_way where active_id in  ${active_ids} GROUP BY active_id`;
    let ret = await dbpool.query(sql);
    if (!ret.err && ret.rows.length != 0) {
        ret.rows.forEach(e => {
            let { active_id, max_price, min_price } = e
            data[active_id] = {
                max_price,
                min_price,
            };

        })
    }

    return data;
}

//获取每个接龙我的接龙总奖励
exports.getActivesMyAllReward_by_activeIds = async function ({ active_ids, userid }) {
    let data = {}
    let sql = `SELECT active_id,max(price) as max_price,min(price) as min_price FROM t_active_group_way where active_id in  ${active_ids} GROUP BY active_id`;
    let ret = await dbpool.query(sql);
    if (!ret.err && ret.rows.length != 0) {
        ret.rows.forEach(e => {
            let { active_id, max_price, min_price } = e
            data[active_id] = {
                max_price,
                min_price,
            };

        })
    }

    return data;
}


//获取每个接龙我的凭证商品
exports.getMyActiveRecordsGoods_by_activeIds = async function ({ userid, active_ids }) {
    if (userid == null || active_ids == null) {
        return {};
    }
    let sql = `SELECT ifnull(sum(num),0) as allNum,t_active_records_good.*,t_user_active_records.* FROM t_active_records_good,t_user_active_records 
    where t_active_records_good.attend_id = t_user_active_records.attend_id 
    and t_user_active_records.userid=? 
    and t_user_active_records.payment_state in (0,3)
    and t_user_active_records.active_id in  ${active_ids}
    group by active_id,group_way_id`
    sql = MYSQL.format(sql, [userid]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return {};
    }
    let data = classify_retData(ret.rows, 'active_id');
    return data;
}




//获取每个接龙我的接龙分享总奖励
exports.getActivesMyAllShareReward_by_activeIds = async function ({ active_ids, userid }) {
    let data = {}
    let sql = `SELECT ifnull(sum(reward_money),0) as all_reward_money,active_id from t_active_share_reward where userid='${userid}' and active_id in  ${active_ids} GROUP BY active_id`;
    let ret = await dbpool.query(sql);
    if (!ret.err && ret.rows.length != 0) {
        ret.rows.forEach(e => {
            let { active_id, all_reward_money } = e
            data[active_id] = all_reward_money
        })
    }
    return data;
}


//获取每个接龙分享奖励规则
exports.activesShareRewardRule_by_activeIds = async function ({ active_ids }) {
    let sql = `select * from t_active_share_reward_rule where active_id in ${active_ids}`;
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return {};
    }

    let data = classify_retData(ret.rows, 'active_id');
    return data;
}


//获取首页接龙列表
exports.getIndexActiveList = async function ({ userid, start, rows, type, search, latitude, longitude }) {
    if (userid == null) {
        return;
    }
    let limitsql = '';
    if (start != null && rows != null) {
        limitsql = ' LIMIT ' + start + ',' + rows;
    }
    let searchFont = ``
    if (search != null) {
        let name;
        // try {
        //     name = crypto.toBase64(search);
        // } catch (error) {
        // }
        searchFont = `and (t_user_active.title like '%${search}%' or from_base64(name) like '%${name}%')`
    }
    console.log(`type ${type} search ${search}`)


    let sql;
    if (type == 1) {
        if(userid == 88888888){
            sql = `
            SELECT 
            t_users.userid,
            t_users.name,
            t_users.headimg,
            t_user_active.* 
            
            FROM t_users,t_user_active
            where t_users.userid = t_user_active.originator_id
            ${searchFont}
            ORDER BY t_user_active.create_time desc
            ${limitsql}
            `;
        }else{
            sql = `SELECT
            t_users.userid,
            t_users.name,
            t_users.headimg,
            t_user_active.*
    
            FROM t_users,t_user_subscribe,t_user_active
            where 
            (   
                t_user_subscribe.subscribe_id = t_user_active.originator_id  
                and t_users.userid = t_user_active.originator_id 
                and t_user_subscribe.userid = ? 
                and t_user_active.active_id not in (select t_user_shield_active.active_id from t_user_shield_active where t_user_shield_active.active_id = t_user_active.active_id and t_user_shield_active.userid = ?) 
                and t_user_active.active_id not in (select t_user_active.active_id from t_user_active,t_user_fans where t_user_active.originator_id = t_user_fans.userid and t_user_fans.fansid=? and t_user_active.create_time<t_user_fans.shield_fans_time and fans_state=1 )
            )
            and ( 
                ( t_user_active.create_time >= t_user_subscribe.create_time and t_user_active.hide = 0 and t_user_active.state =1 )
                or t_user_active.active_id in (select t_user_read_active.active_id from t_user_read_active where userid=?) 
                or t_user_active.originator_id = ?
                or t_users.sex = 5
                )
            ${searchFont}
            ORDER BY t_user_active.create_time desc
             ${limitsql}`;
            sql = MYSQL.format(sql, [userid, userid, userid, userid, userid, userid]);

        }
    } else if (type == 2) {
        sql = `
        SELECT 
        t_users.userid,
        t_users.name,
        t_users.headimg,
        t_user_active.* 
        
        FROM t_users,t_user_active
        where t_users.userid = t_user_active.originator_id and t_users.userid=?
        ${searchFont}
        ORDER BY t_user_active.create_time desc
        ${limitsql}
        `;
        sql = MYSQL.format(sql, [userid]);
    } else if (type == 3) {
        sql = `SELECT 
        t_users.userid,
        t_users.name,
        t_users.headimg,
        t_user_active.* 
        
        FROM t_users,t_user_active,t_user_active_records
        where t_users.userid = t_user_active.originator_id and t_user_active_records.userid=? and t_user_active_records.active_id = t_user_active.active_id
        ${searchFont}
        GROUP BY t_user_active.active_id
        ORDER BY t_user_active.create_time desc
        ${limitsql}
        `;
        sql = MYSQL.format(sql, [userid])
    } else if (type == 4) {
        sql = `SELECT 
        t_users.userid,
        t_users.name,
        t_users.headimg,
        t_user_active.* 
        
        FROM t_users,t_user_active,t_user_read_active
        where t_users.userid = t_user_active.originator_id and t_user_read_active.userid=? and t_user_read_active.active_id = t_user_active.active_id
        ${searchFont}
        GROUP BY t_user_active.active_id
        ORDER BY t_user_read_active.alter_time desc
        ${limitsql}
        `;
        sql = MYSQL.format(sql, [userid]);
    } else if (type == 5) {
        if (!longitude || !latitude) {
            return null;
        }
        sql = `select t_user_active.*, t_users.userid,
        t_users.name,
        t_users.headimg,
min( ROUND(6378.138*2*ASIN(SQRT(POW(SIN((${latitude}*PI()/180-t_active_local.latitude*PI()/180)/2),2)+COS(${latitude}*PI()/180)*COS(t_active_local.latitude*PI()/180)*POW(SIN((${longitude}*PI()/180-t_active_local.longitude*PI()/180)/2),2)))*1000)/1000) AS distance
 FROM  t_user_active 
 left join  t_active_local  on t_user_active.active_id = t_active_local.active_id
  left join  t_users  on t_user_active.originator_id = t_users.userid
 where t_user_active.use_local = 1 and t_active_local.type = 0 ${searchFont}
  group by t_user_active.active_id
 having distance<=t_user_active.local_area_count
 order by distance asc
        ${limitsql}
        `;

    }



    console.log(sql)


    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    dealListInfo(ret.rows)
    return ret.rows;
}

//获取用户未读凭证的数量
exports.get_user_unread_fans_count = async function ({ userid }) {
    if (userid == null) {
        return;
    }
    let sql = `select count(*) as  unread_fans_count from t_user_fans where read_state = 0 and userid=?`;
    sql = MYSQL.format(sql, [userid]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    return ret.rows[0];
}

//获取用户未读凭证的数量
exports.get_user_unread_credential_count = async function ({ userid }) {
    if (userid == null) {
        return;
    }
    let sql = `select count(*) as  unread_credential_count from t_user_active_records where read_state = 0 and userid=?`;
    sql = MYSQL.format(sql, [userid]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    return ret.rows[0];
}


//获取用户未读凭证的数量
exports.get_user_unread_message_count = async function ({ userid }) {
    if (userid == null) {
        return;
    }
    let sql = `select count(*) as  unread_message_count from t_message where read_state = 0 and userid=?`;
    sql = MYSQL.format(sql, [userid]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    return ret.rows[0];
}

//统计活动所有参加接龙的总费用
exports.get_active_all_attend_cost = async function ({ active_id }) {
    let sql = `SELECT IFNULL(sum(attend_cost),0) as all_attend_cost FROM t_user_active_records where active_id=? and payment_state in (0,3)`
    sql = MYSQL.format(sql, [active_id]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows[0]
}


//获取活动详情
exports.get_active_info = async function ({ userid, active_id }) {
    if (userid == null || active_id == null) {
        return;
    }

    let sql = `SELECT 
        t_users.userid,
        t_users.name,
        t_users.headimg,
        t_user_active.* 
        
        FROM t_users,t_user_active
        where t_users.userid = t_user_active.originator_id and t_user_active.active_id = ?
        ORDER BY t_user_active.alter_time desc
        `;
    sql = MYSQL.format(sql, [active_id]);

    console.log(sql)

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    dealUserName(ret.rows)
    dealListInfo(ret.rows)
    dealActiveInfoImg(ret.rows)

    return ret.rows[0];
}






//获取活动留言
exports.get_leave_msg = async function ({ active_id }) {
    if (active_id == null) {
        return;
    }

    let sql = `SELECT  

    t_users.name,
    t_users.headimg,
    t_active_leave_msg.* from t_active_leave_msg,t_users where t_users.userid=t_active_leave_msg.userid and t_active_leave_msg.active_id=?`
    sql = MYSQL.format(sql, [active_id]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    dealUserName(ret.rows)
    return ret.rows;


}

//获取活动留言
exports.get_leave_msg_by_id = async function ({ leave_msg_id }) {
    if (leave_msg_id == null) {
        return;
    }

    let sql = `select * from t_active_leave_msg where leave_msg_id=?`
    sql = MYSQL.format(sql, [leave_msg_id]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    return ret.rows[0];


}

//获取接龙的用户参与历史记录
exports.getAttendRecords = async function ({ userid, active_id, start, rows }) {
    if (userid == null || active_id == null) {
        return;
    }

    let limitsql = '';
    if (start != null && rows != null) {
        limitsql = ' LIMIT ' + start + ',' + rows;
    }

    let sql = `SELECT t_user_active_records.*,t_users.name,t_users.headimg FROM t_user_active_records,t_users where t_users.userid=t_user_active_records.userid and  active_id='${active_id}' and payment_state in (0,3) ORDER BY time desc ${limitsql}
    `
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    ret.rows = await exports.getActiveRecordGoodInfo({ activeRecordData: ret.rows });

    return ret.rows;
}

//获取我的凭证
exports.get_my_active_records = async function ({ userid, active_id }) {
    if (userid == null || active_id == null) {
        return;
    }

    let sql = `SELECT t_user_active_records.*,t_users.name,t_users.headimg FROM t_user_active_records,t_users where t_users.userid=t_user_active_records.userid and t_user_active_records.userid= ?  and active_id=? and ( payment_state in (0,3) or (payment_state =1 and unix_timestamp(now())*1000-t_user_active_records.time <=${pay_fail_time} ) ) ORDER BY active_index desc `
    sql = MYSQL.format(sql, [userid, active_id]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    ret.rows = await exports.getActiveRecordGoodInfo({ activeRecordData: ret.rows });


    return ret.rows;
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
//根据filedName将数组数据进行分类，存到对象中
function classify_retData(retRows, filedName) {
    let data = {};
    retRows.forEach(e => {
        let filed = e[filedName];
        if (!data[filed]) {
            data[filed] = []
        }
        data[filed].push(e)
    })
    return data;
}

//获取接龙记录的商品信息
exports.getActiveRecordsGoods_by_attendId = async function ({ attend_id }) {
    if (attend_id == null) {
        return;
    }
    let sql = `SELECT * FROM t_active_records_good where attend_id=?`
    sql = MYSQL.format(sql, [attend_id]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows;
}

//获取接龙记录的商品信息
exports.getActiveRecordsGoods_arr = async function ({ attend_ids }) {
    let sql = `SELECT * FROM t_active_records_good where attend_id in ${attend_ids}`
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return {};
    }

    let data = {}
    ret.rows.forEach(e => {
        let { attend_id } = e;
        if (!data[attend_id]) {
            data[attend_id] = []
        }
        data[attend_id].push(e)
    })
    return data;
}

//获取我带来的人数
exports.get_invitor_num = async function ({ userid, active_id }) {
    if (userid == null || active_id == null) {
        return;
    }

    let sql = `SELECT count(*) as invitor_num FROM t_user_read_active where invitor_id=? and active_id=? `
    sql = MYSQL.format(sql, [userid, active_id]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    return ret.rows[0].invitor_num;


}

//获取接龙序号
async function getRank(obj) {
    if (obj && obj.length > 0) {
        for (let i = 0; i < obj.length; i++) {
            let { userid, active_id, time } = obj[i];
            let sql = `select count(*) as rank from t_user_active_records where active_id=? and time<=? order by time asc`
            sql = MYSQL.format(sql, [active_id, time]);
            let ret = await dbpool.query(sql);

            if (ret && ret.rows[0]) {
                obj[i].rank = ret.rows[0].rank
            }
        }
    }
    return obj;
}





//屏蔽接龙
exports.shieldActive = async function ({ userid, active_id }) {
    if (userid == null || active_id == null) {
        return;
    }


    let sql = `insert into t_user_shield_active(userid,active_id,create_time) value(?,?,?)`
    sql = MYSQL.format(sql, [userid, active_id, Date.now()]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    return ret.rows.affectedRows > 0;
}

exports.get_configs = async function (key) {
    var sql = `SELECT cvalue FROM t_configs where` + ' `ckey`' + `= '${key}'`;
    var ret = await dbpool.query(sql, true);

    if (ret.err || ret.rows.length == 0) {
        return 0;
    }
    var data = ret.rows[0].cvalue;
    return data;
}


//我的接龙凭证
exports.getActiveCertificates = async function ({ userid, start, rows, state, active_id }) {
    if (userid == null) {
        return;
    }

    let limitsql = '';
    if (start != null && rows != null) {
        limitsql = ' LIMIT ' + start + ',' + rows;
    }
    let activeId = active_id != null ? `and t_user_active_records.active_id='${active_id}'` : '';

    let activeState = ``;
    if (state == 1) {
        activeState = `and t_user_active_records.payment_state in (0,3)`;
    } else if (state == 2) {
        activeState = `and t_user_active_records.payment_state = 1 and unix_timestamp(now())*1000-t_user_active_records.time <=${pay_fail_time}`;
    } else {
        activeState = `and t_user_active_records.state = 3 `;
    }

    let sql = `SELECT 
    t_user_active.locale,
    t_user_active.title,
    t_user_active.originator_id,
    t_users.name as active_user_name,
    t_users.headimg as active_user_headimg,
    
     t_user_active_records.*
    FROM t_user_active_records
    LEFT JOIN t_user_active on t_user_active.active_id = t_user_active_records.active_id 
    LEFT JOIN t_users on t_users.userid = t_user_active.originator_id
    where t_user_active_records.userid=${userid}  ${activeState} ${activeId} ORDER BY time desc ${limitsql}
    `

    sql = MYSQL.format(sql, [userid]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    // ret.rows = await getRank(ret.rows)

    let getActiveRecordsGoods_arr;
    let filedData = exports.retFiledData_to_arr(ret.rows, 'attend_id');
    if (filedData) {
        getActiveRecordsGoods_arr = await exports.getActiveRecordsGoods_arr({ attend_ids: filedData.queryString })
    }

    for (let i = 0; i < ret.rows.length; i++) {
        let { attend_id } = ret.rows[i];
        let activeRecordsGoods = getActiveRecordsGoods_arr[attend_id]
        ret.rows[i].activeRecordsGoods = activeRecordsGoods == null ? [] : activeRecordsGoods;

        try {
            ret.rows[i].active_user_name = crypto.fromBase64(ret.rows[i].active_user_name)
            ret.rows[i].logistics = crypto.fromBase64(ret.rows[i].logistics)
            ret.rows[i].logistics = JSON.parse(ret.rows[i].logistics)
        } catch (error) {

        }

    }
    return ret.rows;
}


//添加历史地理位置
exports.addHistoryLocal = async function ({ userid, name, address, latitude, longitude }) {
    if (userid == null) {
        return;
    }
    if (name == null && address == null && latitude == null && longitude == null) {
        return;
    }

    let sql = `insert into t_history_local(userid,name, address, latitude, longitude, create_time) value(?,?,?,?,?,?)`
    sql = MYSQL.format(sql, [userid, name, address, latitude, longitude, Date.now()]);

    let ret = await dbpool.query(sql);
    if (ret.err) {
        return null;
    }

    return ret.rows.affectedRows > 0;
}

//删除历史地理位置
exports.delHistoryLocal = async function ({ userid, local_id }) {
    if (userid == null || local_id == null) {
        return;
    }

    let sql = `delete from t_history_local where userid=? and local_id=?`
    sql = MYSQL.format(sql, [userid, local_id]);

    let ret = await dbpool.query(sql);
    if (ret.err) {
        return null;
    }

    return true;
}



//获取历史地理位置
exports.getHistoryLocal = async function ({ userid }) {
    if (userid == null) {
        return;
    }

    let sql = `select * from t_history_local where userid = ? order by create_time desc`
    sql = MYSQL.format(sql, [userid]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    return ret.rows;
}

//获取我的订阅
exports.getSubscribe = async function ({ userid, search, start, rows }) {
    if (userid == null) {
        return;
    }

    let limitsql = '';
    if (start != null && rows != null) {
        limitsql = ' LIMIT ' + start + ',' + rows;
    }


    let searchQuery = search != null ? `and from_base64(t_users.name) like '%${search}%'` : ''

    let sql = `SELECT t_user_subscribe.*,t_users.name,t_users.headimg,t_users.sex,t_users.userid 
    FROM t_user_subscribe,t_users
    where t_user_subscribe.subscribe_id = t_users.userid and t_user_subscribe.userid=? ${searchQuery} ORDER BY t_user_subscribe.create_time desc ${limitsql}`
    sql = MYSQL.format(sql, [userid]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    let subscribe_id_arr = [];
    let subscribe_Obj = {};
    ret.rows.map(e => {
        let { subscribe_id } = e;
        subscribe_id_arr.push(subscribe_id);
        subscribe_Obj[subscribe_id] = {};
        try {
            e.name = crypto.fromBase64(e.name);
        } catch (error) {
        }
        return e
    })

    //统计粉丝数量
    let subscribe_id_S = `(${subscribe_id_arr.join(',')})`
    let sqlFansCount = `select userid,count(*) as fansCount from t_user_fans where t_user_fans.userid in ${subscribe_id_S} GROUP BY userid `
    let retFansCount = await dbpool.query(sqlFansCount);
    if (retFansCount && retFansCount.rows && retFansCount.rows.length > 0) {
        retFansCount.rows.forEach(e => {
            let { userid, fansCount } = e;
            if (subscribe_Obj[userid]) {
                subscribe_Obj[userid].fansCount = fansCount;
            }
        })
    }

    //统计接龙数量
    let sqlActiveCount = `select originator_id,count(*) as activeCount from t_user_active where t_user_active.originator_id in ${subscribe_id_S} GROUP BY originator_id `
    let retActiveCount = await dbpool.query(sqlActiveCount);
    if (retActiveCount && retActiveCount.rows && retActiveCount.rows.length > 0) {
        retActiveCount.rows.forEach(e => {
            let { originator_id, activeCount } = e;
            if (subscribe_Obj[originator_id]) {
                subscribe_Obj[originator_id].activeCount = activeCount;
            }
        })
    }

    //统计总订阅数
    let sqlCount = `select count(*) as subscribeCount from t_user_subscribe where t_user_subscribe.userid=? `
    sqlCount = MYSQL.format(sqlCount, [userid]);
    let count = 0;
    let retCount = await dbpool.query(sqlCount);
    if (retCount.rows && retCount.rows.length > 0 && retCount.rows[0].subscribeCount) {
        count = retCount.rows[0].subscribeCount;
    }

    ret.rows.map(e => {
        let { subscribe_id } = e;

        e.fansCount = subscribe_Obj[subscribe_id].fansCount ? subscribe_Obj[subscribe_id].fansCount : 0;
        e.activeCount = subscribe_Obj[subscribe_id].activeCount ? subscribe_Obj[subscribe_id].activeCount : 0;
        return e;

    })



    return { subscribeData: ret.rows, subscribeCount: count };
}

exports.delete_subscribe = async function ({ userid, subscribe_id }) {
    if (userid == null || subscribe_id == null) {
        return;
    }
    let sql = `delete from t_user_subscribe where userid=? and subscribe_id=?`
    sql = MYSQL.format(sql, [userid, subscribe_id]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return null;
    }

    return true;
}

// exports.no_subscribe_user = async function({userid,subscribe_id}){
//     if(userid == null || subscribe_id == null){
//         return;
//     }

//     let sql = `update t_user_subscribe set subscribe_state=1 ,no_subscribe_time=? where userid=? and subscribe_id=?`
//     sql = MYSQL.format(sql,[Date.now(),userid,subscribe_id]);
//     let ret = await dbpool.query(sql);
//     if(ret.err){
//         return null;
//     }

//     return ret.rows.affectedRows>0;
// }

//获取商品分类
exports.getGoodclassList = async function ({ userid }) {
    if (userid == null) {
        return;
    }


    let sql = `select * from t_user_good_class where userid=? order by level asc`
    sql = MYSQL.format(sql, [userid]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return null;
    }

    return ret.rows
}


//添加商品分类
exports.add_good_class = async function ({ userid, class_name }) {
    if (userid == null) {
        return;
    }

    let sqlLast = `select * from t_user_good_class where userid=? order by level desc limit 1`
    sqlLast = MYSQL.format(sqlLast, [userid]);
    let retLast = await dbpool.query(sqlLast);
    if (retLast.err) {
        return null;
    }
    let level = 1;
    if (retLast.rows && retLast.rows.length > 0) {
        level = retLast.rows[0].level + 1;
    }

    let sql = `insert into t_user_good_class(userid,class_name, create_time, level) value(?,?,?,?)`
    sql = MYSQL.format(sql, [userid, class_name, Date.now(), level]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return null;
    }

    return ret.rows.affectedRows > 0;
}


//修改商品分类名称
exports.update_good_class = async function ({ userid, good_class_id, class_name, firstLevel }) {
    if (userid == null || good_class_id == null || (class_name == null && !firstLevel)) {
        return;
    }


    if (class_name != null) {
        let sql = `update t_user_good_class set class_name=? where userid=? and good_class_id=?`
        sql = MYSQL.format(sql, [class_name, userid, good_class_id]);
        let ret = await dbpool.query(sql);
        if (ret.err) {
            return null;
        }

        return ret.rows.affectedRows > 0;
    }

    if (firstLevel) {
        let sql = `select * from t_user_good_class where userid=? and good_class_id=? `
        sql = MYSQL.format(sql, [userid, good_class_id]);
        let ret = await dbpool.query(sql);
        if (ret.err) {
            return null;
        }

        if (ret.rows && ret.rows.length > 0) {
            let { level } = ret.rows[0];
            let sqlS = `update t_user_good_class set level=level+1 where userid=? and level < ${level}`
            sqlS = MYSQL.format(sqlS, [userid]);
            let retS = await dbpool.query(sqlS);
            if (retS.err) {
                return null;
            }

            let sqlU = `update t_user_good_class set level=1 where userid=? and good_class_id=?`
            sqlU = MYSQL.format(sqlU, [userid, good_class_id]);
            let retU = await dbpool.query(sqlU);
            if (retU.err) {
                return null;
            }

            return retU.rows.affectedRows > 0;

        }


    }
}



//删除商品分类
exports.delete_good_class = async function ({ userid, good_class_id }) {
    if (userid == null || good_class_id == null) {
        return;
    }

    let sql = `delete from t_user_good_class where userid =? and good_class_id=?`
    sql = MYSQL.format(sql, [userid, good_class_id]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return null;
    }

    return true;
}




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

//获取商品
exports.get_good_list = async function ({ userid, class_id, name }) {
    if (userid == null) {
        return;
    }
    let classId = class_id != null ? `and class_id = '${class_id}'` : '';
    let good_name = name != null ? ` and name like '%${name}%'` : '';
    let sql = `select * from t_goods left join t_user_good_class on t_user_good_class.good_class_id = t_goods.class_id  where t_goods.userid=? ${good_name} ${classId} order by t_goods.create_time desc`
    sql = MYSQL.format(sql, [userid]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return null;
    }

    return ret.rows;
}


//获取商品
exports.get_history_good_list = async function ({ userid,  name,start,rows }) {
    if (userid == null) {
        return;
    }
    let good_name = name != null ? ` and name like '%${name}%'` : '';
    let limitStr = start != null&&rows != null ? ` limit ${start},${rows}` : '';
    let sql = `SELECT t_active_group_way.*,class_name FROM t_active_group_way
     left join t_user_good_class on t_user_good_class.good_class_id = t_active_group_way.good_class_id  
      where active_id in (select active_id from t_user_active where originator_id = ?)   ${good_name} group by  name ,size  order by group_way_id ${limitStr}  ;`
    sql = MYSQL.format(sql, [userid]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return null;
    }
    return ret.rows;
}






exports.get_group_way_by_id = async function (id) {

    if (id == null) {
        return null;
    }

    let sql = 'SELECT * FROM t_active_group_way WHERE group_way_id = ?';
    sql = MYSQL.format(sql, [id]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {

        return null;
    }
    let data = ret.rows[0];
    return data;
};

exports.create_active_record = async function ({ userid, active_id, comments, reward_money, active_content, attend_cost, logistics, order_id, locale }) {

    try {
        logistics = crypto.toBase64(logistics)
    } catch (error) {
    }
    let payment_state = 1


    var sql = `INSERT INTO t_user_active_records(userid, active_id, time,comments,reward_money,active_content,attend_cost,payment_state,logistics,order_id,locale) 
    VALUES(?,?,?,?,?,?,?,?,?,?,?)`;
    sql = MYSQL.format(sql, [userid, active_id, Date.now(), comments, reward_money, active_content, attend_cost, payment_state, logistics, order_id, locale]);

    var ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    return ret.rows.insertId;
};

exports.create_active_record_good = async function ({ attend_id, group_way_id, num, name, size, price }) {


    var sql = `INSERT INTO t_active_records_good(attend_id,group_way_id, num,name,size,price) 
    VALUES(?,?,?,?,?,?)`;
    sql = MYSQL.format(sql, [attend_id, group_way_id, num, name, size, price]);

    var ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    return ret.rows.insertId;
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

    ret.rows = await exports.getActiveRecordGoodInfo({ activeRecordData: ret.rows });

    let data = ret.rows[0];
    console.log(data)
    // try{
    //     data.name = crypto.fromBase64(data.name)
    //     // data.logistics = crypto.fromBase64(data.logistics)
    // }catch(e){

    // }
    return data;
};

exports.get_active_record_detail_by_id = async function (id) {

    if (id == null) {
        return null;
    }

    let sql = 'SELECT * FROM t_user_active_records WHERE attend_id = ?';
    sql = MYSQL.format(sql, [id]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {

        return null;
    }
    let sql1 = 'SELECT * FROM t_active_records_good WHERE attend_id = ?';
    sql1 = MYSQL.format(sql1, [id]);

    let ret1 = await dbpool.query(sql1);
    var good_list = []
    if (ret1.rows.length > 0) {
        good_list = ret1.rows

    }
    let data = ret.rows[0];
    data.good_list = good_list
    return data;
};


exports.create_pay_record = async function (ord_id, attend_id, userid, cost, type, fee) {
    if (!fee) {
        var fee = 0
    }

    var sql = `INSERT INTO t_pay_records(ord_id,attend_id, userid,cost,type,state,time,fee) 
    VALUES(?,?,?,?,?,?,?,?)`;
    sql = MYSQL.format(sql, [ord_id, attend_id, userid, cost, type, 1, Date.now(), fee]);

    let ret = await dbpool.query(sql);
    if (ret.err) {

        return null;
    }
    return ret.rows.affectedRows > 0;
};

exports.update_pay_state = async function (orderId, state, transaction_id) {
    if (orderId == null || state == null || state < 1 || state > 3) {
        return false;
    }
    var wechat_order = ''

    if (transaction_id) {
        wechat_order = transaction_id
    }

    var sql = `UPDATE t_pay_records SET state = ? ,time =?,wechat_ord = ?  WHERE ord_id = ? AND state = 1`;
    sql = MYSQL.format(sql, [state, Date.now(), wechat_order, orderId]);
    var ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    return true;
};

exports.update_active_record_state = async function (attend_id, state, active_id, pay_type) {
    let active_index = 1
    let refund_str = ``
    if (state == 3 || state == 0) {
        let sql1 = 'SELECT count(*) as cnt  FROM t_user_active_records WHERE active_id = ? and (payment_state=3 or payment_state=0) ';
        sql1 = MYSQL.format(sql1, [active_id]);
        let ret1 = await dbpool.query(sql1);
        if (ret1.rows.length == 0) {
            active_index = 1
        } else {
            active_index = 1 + ret1.rows[0].cnt
        }

        let sql2 = `update t_active_group_way inner join t_active_records_good on 
 t_active_group_way.group_way_id =t_active_records_good.group_way_id and t_active_records_good.attend_id = ? 
 set t_active_group_way.join_num = t_active_group_way.join_num+t_active_records_good.num `
        sql2 = MYSQL.format(sql2, [attend_id]);
        let ret2 = await dbpool.query(sql2);
        if (state == 3) {
            refund_str = `,refund_state = 1`

        }
    }
    let pay_type_str = ``
    if (pay_type) {
        pay_type_str = ' , pay_type = 1'
    }
    var sql = `UPDATE t_user_active_records SET payment_state = ?,active_index = ? ${refund_str} ${pay_type_str} WHERE attend_id = ? `;
    sql = MYSQL.format(sql, [state, active_index, attend_id]);
    var ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    return true;
};

exports.get_pay_data = async function (orderId) {
    if (orderId == null) {
        return null;
    }

    var sql = "SELECT t_pay_records.* FROM t_pay_records   WHERE t_pay_records.ord_id = '" + orderId + "'";
    var ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    return ret.rows[0];
};

exports.get_pay_data_by_attendid = async function (attendid) {
    if (attendid == null) {
        return null;
    }

    var sql = `SELECT t_pay_records.* FROM t_pay_records   WHERE t_pay_records.attend_id =? and state = 3`;
    sql = MYSQL.format(sql, [attendid]);
    var ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    return ret.rows[0];
};

async function add_bills(userid, num, note, time, title, type, current_num, orderid, attend_id) {
    var ord = 'BK' + Date.now() + userid;
    if (orderid) {
        ord = orderid
    }
    var mtitle = '';
    if (title) {
        mtitle = title
    }
    let my_attend_id = 0
    if (attend_id) {
        my_attend_id = attend_id
    }
    var sql = `INSERT INTO t_bills(ord_id,userid, num, note, time,title,type,current_num,attend_id) VALUES(?,?,?,?,?,?,?,?,?)`;
    sql = MYSQL.format(sql, [ord, userid, num, note, time, mtitle, type, current_num, my_attend_id]);
    var ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }

    return ret.rows.affectedRows > 0;
};

exports.add_user_money = async function (userid, money, note, title, orderid, attend_id) {

    var sql = `update t_users set money = money+? where userid = ?`

    sql = MYSQL.format(sql, [money, userid]);

    var ret = await dbpool.query(sql);

    var sql1 = `select * from t_users where userid = ?`
    sql1 = MYSQL.format(sql1, [userid]);
    var ret1 = await dbpool.query(sql1);

    var current_money = ret1.rows[0].money
    if (ret.rows.affectedRows > 0) {
        await add_bills(userid, money, note, Date.now(), title, "add", current_money, orderid, attend_id)
    }

    return true
}
exports.dec_user_money = async function (userid, money, note, title, orderid, attend_id) {

    var sql = `update t_users set money = money-? where userid = ?`

    sql = MYSQL.format(sql, [money, userid]);

    var ret = await dbpool.query(sql);

    var sql1 = `select * from t_users where userid = ?`
    sql1 = MYSQL.format(sql1, [userid]);
    var ret1 = await dbpool.query(sql1);

    var current_money = ret1.rows[0].money
    if (ret.rows.affectedRows > 0) {
        await add_bills(userid, money, note, Date.now(), title, "dec", current_money, orderid, attend_id)
    }
    return true
}

exports.update_active_record_info = async function ({ userid, attend_id, comments, active_creator_comments, logistics }) {
    if (userid == null || attend_id == null) {
        return;
    }
    try {
        logistics = crypto.toBase64(logistics)
    } catch (error) {
    }
    let updateQuery = ``

    let query = ''
    if (active_creator_comments != null) {
        updateQuery = `active_creator_comments = '${active_creator_comments}'`

        query = `and active_id in (select active_id from t_user_active where originator_id='${userid}')`
    } else {
        let q_comments = comments != null ? `comments='${comments}'` : 'comments = comments';
        let q_logistics = logistics != null ? `,logistics='${logistics}'` : '';
        updateQuery = q_comments + q_logistics
        query = `and userid = '${userid}'`
    }


    var sql = `update t_user_active_records set ${updateQuery} where attend_id='${attend_id}' ${query}`
    var ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }

    return ret.rows.affectedRows > 0;

}


exports.updateActiveRecordState = async function ({ userid, attend_id, state }) {
    if (userid == null || attend_id == null || state == null) {
        return;
    }


    var sql = `update t_user_active_records set state='${state}' where attend_id='${attend_id}' `
    var ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }

    return ret.rows.affectedRows > 0;

}

//获取消息列表
exports.get_message_list = async function ({ userid, start, rows }) {
    if (userid == null) {
        return;
    }

    let limitsql = '';
    if (start != null && rows != null) {
        limitsql = ' LIMIT ' + start + ',' + rows;
    }
    let sql = `select t_message.*,
    IFNULL(t_user_active.title ,t_message.active_title) as active_title,
    a_user.name as active_user_name, 
    a_user.headimg as active_user_headimg, 
    user.name as name, 
    user.headimg as headimg
    from t_message 
    left join t_user_active on t_user_active.active_id = t_message.active_id 
    left join t_users as a_user on a_user.userid = t_user_active.originator_id 
    left join t_users as user on user.userid = t_message.userid 
    where t_message.to_userid=? 
    order by t_message.create_time desc  
    ${limitsql}`
    sql = MYSQL.format(sql, [userid]);
    let ret = await dbpool.query(sql);

    if (ret.err) {
        return null;
    }

    return ret.rows;

}


//添加消息
exports.add_message = async function ({ userid, content, active_id, active_title, type, active_index, to_userid }) {
    if (userid == null) {
        return;
    }

    let sql = `insert into t_message(userid,content,active_id,active_title,type,active_index,create_time,read_state,to_userid) value(?,?,?,?,?,?,?,?,?)`
    sql = MYSQL.format(sql, [userid, content, active_id, active_title, type, active_index, Date.now(), 0, to_userid]);

    let ret = await dbpool.query(sql);
    if (ret.err) {
        return null;
    }
    return ret.rows.affectedRows > 0;
}

//阅读消息
exports.read_message = async function ({ userid, msg_id }) {
    if (userid == null || msg_id == null) {
        return;
    }

    let sql = `update t_message set read_state = 1 where userid=? and msg_id = ?`
    sql = MYSQL.format(sql, [userid, msg_id]);

    let ret = await dbpool.query(sql);
    if (ret.err) {
        return null;
    }
    return ret.rows.affectedRows > 0;
}


//阅读我的所有凭证
exports.read_user_all_active_records = async function ({ userid }) {
    if (userid == null) {
        return;
    }

    let sql = `update t_user_active_records set read_state = 1 where userid=? `
    sql = MYSQL.format(sql, [userid]);

    let ret = await dbpool.query(sql);
    if (ret.err) {
        return null;
    }
    return ret.rows.affectedRows > 0;
}

//阅读我的所有粉丝
exports.read_user_all_fans = async function ({ userid }) {
    if (userid == null) {
        return;
    }

    let sql = `update t_user_fans set read_state = 1 where userid=? `
    sql = MYSQL.format(sql, [userid]);

    let ret = await dbpool.query(sql);
    if (ret.err) {
        return null;
    }
    return ret.rows.affectedRows > 0;
}



//获取活动留言信息列表
exports.get_leave_msg_list = async function ({ userid, active_id, start, rows }) {
    if (active_id == null) {
        return;
    }

    let limitsql = '';
    if (start != null && rows != null) {
        limitsql = ' LIMIT ' + start + ',' + rows;
    }
    let sql = `SELECT t_users.name,t_users.headimg,t_active_leave_msg.*,ifnull(thumbup.thumbup_num,0) as thumbup_num,is_thumbup
    FROM t_active_leave_msg
    LEFT JOIN t_users on t_users.userid = t_active_leave_msg.userid
    LEFT JOIN (select count(*) as thumbup_num,count(userid=? or null) as is_thumbup,leave_msg_id from t_leavemsg_thumbup where active_id=? and t_leavemsg_thumbup.state=1 GROUP BY leave_msg_id) as thumbup on thumbup.leave_msg_id= t_active_leave_msg.leave_msg_id
    where t_active_leave_msg.active_id =?
    ${limitsql}
    `
    sql = MYSQL.format(sql, [userid, active_id, active_id]);
    let ret = await dbpool.query(sql);

    if (ret.err) {
        return null;
    }

    let reply_leave_msg_arr;

    let filedData = exports.retFiledData_to_arr(ret.rows, 'leave_msg_id');
    if (filedData) {
        reply_leave_msg_arr = await exports.get_reply_leave_msg({ leave_msg_ids: filedData.queryString })
    }
    ret.rows.map(e => {
        let { leave_msg_id } = e;
        let reply_leave_msg = reply_leave_msg_arr[leave_msg_id]
        e.reply_leave_msg = reply_leave_msg == null ? [] : reply_leave_msg;

        try {
            e.name = crypto.fromBase64(e.name)
        } catch (error) {
        }

        return e;
    })


    return ret.rows;
}

//获取留言回复
exports.get_reply_leave_msg = async function ({ leave_msg_ids }) {
    let sql = `SELECT t_users.name as reply_name,t_users.headimg as reply_headimg,t_reply_msg.* FROM t_reply_msg,t_users where t_reply_msg.userid=t_users.userid and leave_msg_id in ${leave_msg_ids} order by create_time desc`
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return {};
    }


    ret.rows.map(e => {
        try {
            e.reply_name = crypto.fromBase64(e.reply_name)
        } catch (error) {
        }
        return e;
    })

    let data = classify_retData(ret.rows, 'leave_msg_id');

    return data;
}


//添加留言
exports.add_leave_msg = async function ({ userid, active_id, leave_msg, msg_type }) {
    if (userid == null) {
        return;
    }

    let sql = `insert into t_active_leave_msg(userid,active_id,leave_msg,msg_type,create_time) value(?,?,?,?,?)`
    sql = MYSQL.format(sql, [userid, active_id, leave_msg, msg_type, Date.now()]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return null;
    }
    return ret.rows.affectedRows > 0;
}

//回复留言
exports.reply_leave_msg = async function ({ userid, leave_msg_id, content }) {
    let sql = ` insert into t_reply_msg (userid,reply_content,leave_msg_id,create_time) value(?,?,?,?)`
    sql = MYSQL.format(sql, [userid, content, leave_msg_id, Date.now()]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    return ret.rows.affectedRows > 0;

}

//获取我的账单
exports.get_bills = async function (userid, start, rows, note) {
    if (userid == null) {
        return;
    }
    var limitStr = ``
    if (start != null && rows != null) {
        limitStr = `limit ${start},${rows}`
    }
    var noteStr = ``
    if (note) {
        noteStr = `and note='${note}'`
    }

    let sql = `select * from t_bills where userid = ? ${noteStr} order by time desc ${limitStr} `
    sql = MYSQL.format(sql, [userid]);

    let ret = await dbpool.query(sql);
    if (ret.err) {
        return null;
    }
    ret.rows.forEach(item => {
        item.detail = item.title
        item.title = BILLNOTE[item.note]
        if (!item.detail) {
            item.detail = item.title

        }
        item.time = moment(item.time).format('MM-DD HH:mm:ss')

        moment
    })


    return ret.rows;
}

const BILLNOTE = {
    'pay': '充值订单',
    'tx': '提现',
    'qjl': '群接龙订单',
    'red_packet': '红包',
    'sever': '服务费',
    'other': '其他',
    'refund': '退款',
    'withdraw_refund': '提现失败退款',
    
}



exports.get_active_record_log = async function ({ attend_id }) {

    if (attend_id == null) {
        return null;
    }

    let sql = 'SELECT t_active_records_log.*,t_users.name FROM t_active_records_log,t_users WHERE t_users.userid=t_active_records_log.userid and attend_id = ? order by create_time desc';
    sql = MYSQL.format(sql, [attend_id]);

    let ret = await dbpool.query(sql);
    if (ret.err) {
        return null;
    }

    ret.rows.map(e => {
        try {
            e.name = crypto.fromBase64(e.name)
            e.log_content = crypto.fromBase64(e.log_content)
        } catch (error) {

        }
        return e;
    })


    return ret.rows;
};


//添加凭证操作日志
exports.add_active_record_log = async function ({ userid, type, content = '', attend_id }) {
    if (attend_id == null || userid == null) {
        return;
    }

    let typeTitle = {
        1: { title: '【 用户备注 】', content: content },
        2: { title: '【 接龙操作 】', content: content },
        3: { title: '【 用户在线支付成功 】', content: content },
        4: { title: '【 退款操作 】', content: content },//-- 金额：10.00 交易单号：sdfsdfsdf
        5: { title: '【 签到 】', content: content },//-- 纸巾+1
        6: { title: '【 取消接龙 】', content: '后台取消订单' },// 后台取消订单
        7: { title: '【 完成接龙 】', content: '接龙已完成' },
        8: { title: '【 申请取消接龙 】', content: '申请取消接龙' },
    }

    let typeData = typeTitle[type]
    if (!typeData) {
        return;
    }

    let log_content = `${typeData.title} ${typeData.content}`
    try {
        log_content = crypto.toBase64(log_content)
    } catch (error) {
        console.error(error)
    }

    let sql = `insert into t_active_records_log (userid,attend_id,log_content,create_time,type) value(?,?,?,?,?)`

    sql = MYSQL.format(sql, [userid, attend_id, log_content, Date.now(), type]);

    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    console.log("消息插入成功ret.rows.insertId", ret.rows.insertId)

    return ret.rows.affectedRows > 0;
}

//获取接龙统计（总订单数、总金额、总退款金额）
exports.get_active_count = async function ({ active_id }) {
    if (active_id == null) {
        return;
    }

    let sql = `select 
    count(*) as recordCount,
    ifnull(sum(attend_cost),0) as payMoneyCount,
    ifnull(sum(refund_num),0) as refundMoneyCount,
    ifnull(sum(if(state=4,1,0)),0) as applyCancelCount,
    ifnull(sum(if(state=2,1,0)),0) as cancelCount,
    ifnull(sum(if(refund_state=3,1,0)),0) as refundCount,
    ifnull(sum(if(comments='' and active_creator_comments='' ,0,1)),0) as commentsCount

    
    from t_user_active_records 
    where active_id= ? and ( payment_state in (0,3) or (payment_state =1 and unix_timestamp(now())*1000-t_user_active_records.time <=${pay_fail_time} ) )`
    sql = MYSQL.format(sql, [active_id]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    return ret.rows[0];

}

//获取接龙已团的商品信息(通过字段)
exports.get_active_buyGoodList = async function ({ active_id }) {
    if (active_id == null) {
        return [];
    }

    let sql = `SELECT * FROM t_active_group_way where active_id=? and join_num>0`
    sql = MYSQL.format(sql, [active_id]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return [];
    }

    return ret.rows;
}

//获取接龙已团的商品信息（通过查记录统计）
exports.get_active_buyGoodList_by_records = async function ({ active_id }) {
    if (active_id == null) {
        return [];
    }

    let sql = `SELECT t_active_records_good.* FROM t_active_records_good,t_user_active_records where t_user_active_records.attend_id = t_active_records_good.attend_id and t_user_active_records.active_id=?`
    sql = MYSQL.format(sql, [active_id]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return [];
    }

    return ret.rows;
}

//获取接龙签到统计
exports.get_signIn_count = async function ({ active_id }) {
    if (active_id == null) {
        return {};
    }

    let sql = `	
    select 
    sum(if(all_sign_in=all_num and all_sign_in!=0,1,0)) as finish_sign_in,
    sum(if(all_sign_in=0,1,0)) as no_sign_in,
    sum(if(all_sign_in<all_num and all_sign_in!=0,1,0)) as part_sign_in 
    from 
    (SELECT 
        t_user_active_records.attend_id,
        IFNULL(sum(sign_in),0) as all_sign_in,
        IFNULL(sum(num),0) as all_num
        FROM t_user_active_records
		LEFT JOIN t_active_records_good on t_user_active_records.attend_id = t_active_records_good.attend_id 
        where 
     t_user_active_records.active_id=?
        and t_user_active_records.state != 2 
        and t_user_active_records.payment_state in (0,3)
        GROUP BY t_user_active_records.attend_id) as signCount
    `
    sql = MYSQL.format(sql, [active_id]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return {};
    }

    return ret.rows[0];

}




//获取接龙的用户参与历史记录
exports.getActiveRecordsManageList = async function ({ userid, type, active_id, search, start, rows }) {
    if (userid == null || active_id == null) {
        return;
    }

    let searchFont = ``
    if (search != null) {
        let name;
        try {
            name = crypto.toBase64(search);
        } catch (error) {
        }
        searchFont = `and (t_user_active_records.active_index like '%${search}%' or t_users.name like '%${name}%')`
    }

    let limitsql = '';
    if (start != null && rows != null) {
        limitsql = ' LIMIT ' + start + ',' + rows;
    }

    let query = ``
    switch (Number(type)) {
        case 1: query = `and t_user_active_records.state = 4`; break;
        case 2: query = `and t_user_active_records.state = 2`; break;
        case 3: query = `and t_user_active_records.refund_state = 3`; break;
        case 4: query = `and comments!='' and active_creator_comments='' `; break;
    }

    let sql = `SELECT t_user_active_records.*,t_users.name,t_users.headimg FROM t_user_active_records,t_users where t_users.userid=t_user_active_records.userid and  active_id=?  ${query} ${searchFont} and ( payment_state in (0,3) or (payment_state =1 and unix_timestamp(now())*1000-t_user_active_records.time <=${pay_fail_time} ) ) ORDER BY time desc ${limitsql}
    `
    sql = MYSQL.format(sql, [active_id]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    ret.rows = await exports.getActiveRecordGoodInfo({ activeRecordData: ret.rows });

    return ret.rows;
}

//获取接龙签到的凭证列表
exports.getActiveRecordsSignInManageList = async function ({ userid, type, active_id, search, start, rows }) {
    if (userid == null || active_id == null) {
        return;
    }

    let searchFont = ``
    if (search != null) {
        let name;
        try {
            name = crypto.toBase64(search);
        } catch (error) {
        }
        searchFont = `and (t_user_active_records.active_index like '%${search}%' or t_users.name like '%${name}%')`
    }

    let limitsql = '';
    if (start != null && rows != null) {
        limitsql = ' LIMIT ' + start + ',' + rows;
    }

    let query = ``
    switch (Number(type)) {
        case 1: query = `HAVING all_sign_in=all_num and all_sign_in!=0`; break;
        case 2: query = `HAVING all_sign_in=0`; break;
        case 3: query = `HAVING all_sign_in<all_num and all_sign_in!=0`; break;
    }

    let sql = `SELECT 
    signCount.*,t_user_active_records.*,t_users.name,t_users.headimg 
    FROM t_user_active_records,t_users,(SELECT 
            t_user_active_records.attend_id,
            IFNULL(sum(sign_in),0) as all_sign_in,
            IFNULL(sum(num),0) as all_num
            FROM t_user_active_records
            LEFT JOIN t_active_records_good on t_user_active_records.attend_id = t_active_records_good.attend_id 
            where 
         t_user_active_records.active_id=?
            and t_user_active_records.state != 2 
            and t_user_active_records.payment_state in (0,3)
                    
            GROUP BY t_user_active_records.attend_id  ${query}) as signCount 
    
    where 
    t_users.userid=t_user_active_records.userid 
    and signCount.attend_id = t_user_active_records.attend_id
    and active_id= ?
    and payment_state in (0,3)
    and t_user_active_records.state != 2 

    ${searchFont} 
    ORDER BY time desc
    ${limitsql}

    `
    sql = MYSQL.format(sql, [active_id, active_id]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    ret.rows = await exports.getActiveRecordGoodInfo({ activeRecordData: ret.rows });

    return ret.rows;
}

exports.update_user_contact_info = async function ({ userid, real_name, phone, addr, about_me }) {
    if (userid == null) {
        return;
    }
    let updateQuerys = []
    real_name != null ? updateQuerys.push({ key: `real_name`, value: real_name }) : null;
    phone != null ? updateQuerys.push({ key: `phone`, value: phone }) : null;
    addr != null ? updateQuerys.push({ key: `addr`, value: addr }) : null;
    about_me != null ? updateQuerys.push({ key: `about_me`, value: about_me }) : null;
    let { query, queryArr } = dealUpdateQuery(updateQuerys);

    let sql = `update t_users set ${query} where userid = ? `
    sql = MYSQL.format(sql, [...queryArr, userid]);

    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }

    return ret.rows.affectedRows > 0;

}

//获取接龙数据统计
exports.get_active_data_statistics = async function ({ userid, active_id, service_fee_rate }) {
    if (userid == null || active_id == null) {
        return;
    }

    let sql = `select
    count(*) as activeRecordsCount,
    count(DISTINCT t_user_active_records.userid) as activeRecordsUserCount,
    IFNULL(sum(attend_cost),0) as  attendCostCount,
    IFNULL(sum(refund_num),0) as refundNumCount,
    share_num,
    count(DISTINCT t_user_read_active.userid) as readUserCount,

    IFNULL(sum(if(attend_cost*${service_fee_rate}>=${service_fee_rate},attend_cost*${service_fee_rate},${service_fee_rate})),0) as  service_fee

    from t_user_active
    LEFT JOIN t_user_active_records on t_user_active_records.active_id = t_user_active.active_id
    LEFT JOIN t_user_read_active on t_user_active_records.active_id = t_user_read_active.active_id
    where payment_state in (0,3) and t_user_active_records.active_id = ?`

    sql = MYSQL.format(sql, [active_id]);

    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }

    return ret.rows[0];

}



//获取活动数据-用户信息
exports.get_active_data_userinfo = async function ({ invitor_id, active_id, start, rows }) {
    if (active_id == null) {
        return;
    }
    let limitsql = '';
    if (start != null && rows != null) {
        limitsql = ' LIMIT ' + start + ',' + rows;
    }

    let invitor = invitor_id == null ? `` : `and t_user_read_active.invitor_id= '${invitor_id}'`;

    let sql = `SELECT t_users.name,t_users.headimg,IFNULL(shareUserCount,0) as shareUserCount,t_user_read_active.* 
    FROM t_user_read_active
    LEFT JOIN t_users on t_users.userid = t_user_read_active.userid
    LEFT JOIN (SELECT sum(IF(userid=invitor_id,0,1)) as shareUserCount,userid,invitor_id FROM t_user_read_active where active_id=?  GROUP BY invitor_id) as shareCount on shareCount.invitor_id = t_user_read_active.userid
    where t_user_read_active.active_id = ? ${invitor}
    ${limitsql}
    `

    sql = MYSQL.format(sql, [active_id, active_id]);

    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }

    dealUserName(ret.rows)

    return ret.rows;

}

exports.signIn_active_records = async function ({ userid, type, signInGoodList, attend_id }) {

    let sql = ''
    if (type == 1) {
        let updateParam = ``
        let goodIds_arr = []
        signInGoodList.forEach(e => {
            let { group_way_id, sign_in } = e;
            updateParam += ` when ${group_way_id} then ${sign_in} `
            goodIds_arr.push(group_way_id)
        })
        let goodIds = `(${goodIds_arr.join(',')})`
        sql = `update t_active_records_good set  sign_in = CASE group_way_id 
            ${updateParam}
        END
       where group_way_id in ${goodIds} and attend_id = ?`

    } else {
        sql = `update t_active_records_good set  sign_in = num
        where  attend_id = ?`
    }
    sql = MYSQL.format(sql, [attend_id]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    return ret.rows.affectedRows > 0;

}

//添加formid
exports.report_user_formid = async function ({ userid, form_id, create_time, expire_time, state, title = '', page = '', offset_left, offset_top }) {
    let sql = `insert into t_formid_pool (form_id,userid,create_time,expire_time,state,title,page,offset_left,offset_top) value(?,?,?,?,?,?,?,?,?)`
    sql = MYSQL.format(sql, [form_id, userid, create_time, expire_time, state, title, page, offset_left, offset_top]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    return ret.rows.affectedRows > 0;

}

//添加formid
exports.thumbup_leavemsg = async function ({ leave_msg_id, userid, active_id, state }) {
    let sql = `insert into t_leavemsg_thumbup (leave_msg_id, userid, active_id, state, create_time) value(?,?,?,?,?)
    on DUPLICATE key update state=?`
    sql = MYSQL.format(sql, [leave_msg_id, userid, active_id, state, Date.now(), state]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    return ret.rows.affectedRows > 0;

}

//获取用户form_id
exports.get_form_id = async function (userid) {
    let sql = `select * from t_formid_pool where userid = ? and state = 0 and  expire_time >${Date.now()} limit 1 `

    sql = MYSQL.format(sql, [userid]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    return ret.rows[0].form_id;

}

//获取用户form_id
exports.update_form_id = async function (form_id) {
    let sql = `update t_formid_pool set state = 1 where form_id = ? `

    sql = MYSQL.format(sql, [form_id]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return;

}

//记录请求信息
exports.record_request_info = async function ({ method, query, body }) {

    let sql = `insert into t_http_request (method, query, body, create_time, alter_time, request_num) value(?,?,?,?,?,?)
    on DUPLICATE key update request_num = request_num+1,alter_time=?`
    let time = Date.now()
    sql = MYSQL.format(sql, [method, query, body, time, time, request_num, time]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    return ret.rows.affectedRows > 0;

}

exports.update_active_record_refund = async function (attend_id, money) {
    let sql = `update t_user_active_records set refund_num = refund_num +?,state = 1  where attend_id = ? `

    sql = MYSQL.format(sql, [money, attend_id]);

    let ret = await dbpool.query(sql);
    if (ret.err) {
        return null;
    }
    return ret.rows.affectedRows > 0;

}
exports.getUserActiveList = async function ({ userid, start, rows }) {
    let limitsql = '';
    if (start != null && rows != null) {
        limitsql = ' LIMIT ' + start + ',' + rows;
    }

    let sql = `
    SELECT 
    t_users.userid,
    t_users.name,
    t_users.headimg,
    t_user_active.* 
    FROM t_users,t_user_active
    where t_users.userid = t_user_active.originator_id and t_users.userid=? and t_user_active.hide in (0,1) and t_user_active.state in (1,2)
    ORDER BY t_user_active.create_time desc
    ${limitsql}
    `;
    sql = MYSQL.format(sql, [userid]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    dealListInfo(ret.rows)

    return ret.rows;
}

//统计用户接龙数量
exports.getUserActiveCount = async function (userid) {
    if (userid == null) {
        return;
    }
    let sql = `select count(*) as userActiveCount from t_user_active where t_user_active.originator_id=?`
    sql = MYSQL.format(sql, [userid]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows[0];
}

//统计用户接龙数量
exports.checkUserSubscribe = async function ({ userid, subscribe_id }) {
    if (userid == null || subscribe_id == null) {
        return;
    }
    let sql = `select * from t_user_subscribe where t_user_subscribe.userid=? and subscribe_id=?`
    sql = MYSQL.format(sql, [userid, subscribe_id]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows[0];
}


//获取接龙可通知的用户
exports.get_active_notice_user = async function ({ active_id }) {
    if (active_id == null) {
        return;
    }
    let sql = `
    select formid.form_id,t_users.userid,name,headimg from t_users  
    left join 
    (select * from 
    t_formid_pool 
    where t_formid_pool.state=0 and expire_time > ${Date.now()}
    group by t_formid_pool.userid ) as formid
    on formid.userid = t_users.userid
    where t_users.userid in (SELECT distinct(userid) FROM t_user_active_records where active_id=? and state != 2)`
    sql = MYSQL.format(sql, [active_id]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    dealUserName(ret.rows)
    return ret.rows;
}


//获取接龙红包信息
exports.get_active_reward_info = async function (active_id) {
    if (active_id == null) {
        return;
    }
    let sql = `select count(*) as all_count ,ifnull(sum(reward_money),0) as all_money from t_user_active_records where reward_money>0 and active_id = ?`
    sql = MYSQL.format(sql, [active_id]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return {
            all_count: 0,
            all_money: 0,
        };
    }
    return ret.rows[0];
}

//更新接龙红包信息
exports.update_active_reward = async function (attend_id, money) {
    if (attend_id == null) {
        return;
    }
    let sql = `update t_user_active_records set reward_money = ? where attend_id = ? `
    sql = MYSQL.format(sql, [money, attend_id]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false
    }
    return ret.rows.affectedRows > 0;
}

//更新接龙剩余红包信息
exports.update_active_remain_reward = async function (active_id, money) {
    if (attend_id == null) {
        return;
    }
    let sql = `update t_user_active set remain_reward_amount =remain_reward_amount- ? ,remain_reward_num = remain_reward_num -1  where active_id = ? and remain_reward_num>=1 and remain_reward_amount>?`
    sql = MYSQL.format(sql, [money, active_id, money]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false
    }
    return ret.rows.affectedRows > 0;
}

//查看接龙人的邀请信息
exports.get_user_invitor = async function (userid, active_id) {
    if (userid == null) {
        return;
    }
    let sql = `select * from t_user_read_active where userid = ? and active_id = ?`
    sql = MYSQL.format(sql, [userid, active_id]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return false
    }
    return ret.rows[0];
}


//查看用户当天提现信息
exports.get_user_today_withdraw_info = async function (userid) {
    if (userid == null) {
        return;
    }
    let sql = `SELECT count(*) as all_count ,sum(money) as all_money FROM t_withdraw_records where userid = ? and to_days( from_unixtime(create_time/1000)) = to_days(now())   ;`
    sql = MYSQL.format(sql, [userid]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return {
            all_count: 0,
            all_money: 0,
        }
    }
    return ret.rows[0];
}

//增加提现记录
exports.add_withdraw_record = async function ({ order_id, userid, money, platform, real_name,type,bank_code,bank_no }) {

    let sql = `insert into t_withdraw_records(withdraw_id,userid,money,create_time,state,platform,real_name,type,bank_no,bank_code) values(?,?,?,?,?,?,?,?,?,?)`
    sql = MYSQL.format(sql, [order_id, userid, money, Date.now(), 1, platform, real_name,type,bank_no,bank_code]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    return ret.rows.affectedRows > 0;
}

//通过ID获取提现记录
exports.get_withdraw_record = async function (order_id) {
    if (order_id == null) {
        return;
    }
    let sql = `select * from t_withdraw_records where withdraw_id = ?`
    sql = MYSQL.format(sql, [order_id]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows[0];
}

//更新提现记录
exports.update_withdraw_record = async function (order_id, state, wechat_ord, mark, mch_id) {
    if (order_id == null) {
        return;
    }
    let str = ``
    let markstr = ``
    let mchstr = ``
    if (wechat_ord) {
        str = `,wechat_ord='${wechat_ord}'`
    }
    if (mark) {
        markstr = `,mark='${mark}'`
    }
    if (mch_id) {
        mchstr = `,mch_id='${mch_id}'`
    }
    let sql = `update t_withdraw_records set state = ?,audit_time =? ${str} ${markstr} ${mchstr}  where withdraw_id = ?`
    sql = MYSQL.format(sql, [state, Date.now(), order_id]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    return ret.rows.affectedRows > 0;
}


//获取未处理提现记录
exports.get_no_deal_withdraw_records = async function () {
    let max_money = Number(await exports.get_configs('withdraw_auto_max_money'))
    let str = ''
    if (max_money > 0) {
        str = `and money <=${max_money}`
    } else {
        str = `and money <=100`
    }

    let sql = `select * from t_withdraw_records where state = 1 and auto_deal_time<3 ${str} `
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows;
}


//更新提现记录
exports.update_withdraw_record_deal_time = async function (order_id) {
    if (order_id == null) {
        return;
    }

    let sql = `update t_withdraw_records set auto_deal_time = auto_deal_time+1  where withdraw_id = ?`
    sql = MYSQL.format(sql, [order_id]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    return ret.rows.affectedRows > 0;
}



//获取玩家提现记录
exports.get_user_withdraw_records = async function (userid, start, rows) {
    if (userid == null) {
        return;
    }
    let limitsql = '';
    if (start != null && rows != null) {
        limitsql = ' LIMIT ' + start + ',' + rows;
    }

    let sql = `select * from t_withdraw_records where userid = ? order by create_time desc ${limitsql}`
    sql = MYSQL.format(sql, [userid]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows;
}


//获取接龙的分享奖励规则
exports.get_active_share_reward_rule = async function (active_id) {
    if (active_id == null) {
        return;
    }

    let sql = `select * from t_active_share_reward_rule where active_id = ?  and reward_ratio>0  order by start_money desc,reward_ratio desc `
    sql = MYSQL.format(sql, [active_id]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows;
}



//获取购买者进入该接龙的详情
exports.get_user_read_active = async function (active_id, userid) {
    if (active_id == null || userid == null) {
        return;
    }
    let sql = `select * from t_user_read_active where active_id = ?  and userid = ? `
    sql = MYSQL.format(sql, [active_id, userid]);
    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows[0];
}


//添加玩家分享接龙奖励记录
exports.add_active_share_reward = async function (active_id, userid, reward_money, srr_id, srr_start_money, srr_reward_ratio, attend_id) {

    let sql = `insert into t_active_share_reward(active_id,userid,reward_money,create_time,srr_id,srr_start_money,srr_reward_ratio,attend_id) values(?,?,?,?,?,?,?,?) `
    sql = MYSQL.format(sql, [active_id, userid, reward_money, Date.now(), srr_id, srr_start_money, srr_reward_ratio, attend_id]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    return ret.rows.affectedRows > 0;
}


//获取剩余红包结束的接龙
exports.get_finish_reward_active = async function () {

    let sql = `select * from t_user_active where  end_time <? and (remain_reward_amount>0 or remain_reward_num >0 ) `
    sql = MYSQL.format(sql, [Date.now()]);
    let ret = await dbpool.query(sql);
   if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows;
}



//清空接龙剩余红包
exports.update_finish_reward_active = async function (active_id) {

    let sql = `update t_user_active set remain_reward_amount = 0 , remain_reward_num = 0 where active_id = ?`
    sql = MYSQL.format(sql, [active_id]);
    let ret = await dbpool.query(sql);
    if (ret.err) {
        return false;
    }
    return ret.rows.affectedRows > 0;
}



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




exports.add_movie = async function ({req_url,movie_url,movie_url2,name,movie_img,url_name}) {

    let sql = `INSERT INTO t_movie(req_url,movie_url,movie_url2,name,movie_img,time,url_name) VALUES(?,?,?,?,?,?,?) on DUPLICATE key update movie_url=?,movie_url2=?,time=?`;
    sql = MYSQL.format(sql, [req_url,movie_url,movie_url2,name,movie_img,Date.now(),url_name,movie_url,movie_url2,Date.now()]);

    let ret = await dbpool.query(sql);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }
    return ret.rows.affectedRows > 0;

};

exports.get_movie = async function ({movie_url}) {

    let sql = `select * from t_movie where movie_url=?`;
    sql = MYSQL.format(sql, [movie_url]);

    let ret = await dbpool.query(sql,true);
    if (ret.err || ret.rows.length == 0) {
        return null;
    }

    return ret.rows;

};


exports.query = query;


