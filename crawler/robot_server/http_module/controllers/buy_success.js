
const db = require('../../../utils/dbsync_hall');
const crypto = require('../../../utils/crypto');
const http = require('../../../utils/http');
const configs = require('../../../configs.js');
const config = configs.hall_server();
const  dbRedis = require('../../../utils/db_redis_hall');

const { TOKENS_USER, USERS_TOKEN } = dbRedis;

const path = require('path');
const fs = require('fs');
const bot = require('../../robot_module/bot');

const ERRCODE = require('../../../utils/errcode.js');
//redis表名
const { RET_OK } = ERRCODE;
//大厅服错误码
const { TOKEN_TIMEOUT, NO_USER, OPERATE_FAILED } = ERRCODE.HALL_ERRS;
//系统错误码
const { INVALID_PARAMETER, INTER_NETWORK_ERROR } = ERRCODE.SYS_ERRS;



/**
 * 
 *  接龙成功通知模块
 */

// await db.update_user_info(account, name, headimgurl, sex)
module.exports = app => {
    const controllerUtils = require('../utils')(app)
    class httpController extends controllerUtils {
        constructor() {
            super()

        }

        /**
        * showdoc
        * @catalog 机器人
        * @title 机器人接受接龙成功信息
        * @description 机器人接受接龙成功信息接口
        * @method get
        * @url https://xxx:9001/buy_success_to_robot
        * @param attend_id 必选 string 凭证id
        * @return {"errcode":0,"errmsg":"ok"}
        * @remark 这里是备注信息
        * @number 1
        */

       async buy_success_to_robot(req,res){
            let { attend_id } = req.query
            console.log(`3234234`)
            let activeRecord = await db.get_active_record_by_id(attend_id);
            if (!activeRecord) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            console.log(`3333333`)

            let { active_id } = activeRecord;
            let active = await db.get_active_by_id(active_id)
            if (!active) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let group  = await db.get_wx_group_room_by_active_id(active_id);
            console.log(group)

            if(group && group.length>0){
                group.forEach(async e=>{

                    console.log("app.bot")
                    console.log(e.group_name)
                    let room = await bot.Room.find({topic:e.group_name});
                    console.log("room")
                    console.log(room)

                    if(room){
                        await room.say(active_id)

                    }

                })
            }

       
            http.send(res, RET_OK);


       }
        
        





    }

    return httpController;
};
