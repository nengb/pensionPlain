const  db = require('../../../utils/dbsync_account');
const  crypto = require('../../../utils/crypto');
const  http = require('../../../utils/http');

const  configs = require('../../../configs.js');

const ERRCODE = require('../../../utils/errcode.js');

const { RET_OK } = ERRCODE;
//大厅服错误码
const { TOKEN_TIMEOUT, NO_USER, OPERATE_FAILED } = ERRCODE.HALL_ERRS;
//系统错误码
const { INVALID_PARAMETER, INTER_NETWORK_ERROR } = ERRCODE.SYS_ERRS;


/**
 * 
 *  签到模块
 */
module.exports = app => {
    const controllerUtils = require('../utils')(app)
    // const { 
    //     db,                     //mysql操作
    //     http,                   //http请求返回
    //     cashChangeReasons,  
    //     consts,    
    // } = app;
    class httpController extends controllerUtils{
        constructor(){
            super()
        }
        //获取签到信息
        async send_msg_to_hall(req,res){
            const { userMgr } = app;
            let { userid } = req.query;
            console.log(`send_msg_to_hall`)
            console.log(req.query)
            userMgr.sendMsg(userid,"send_msg_to_hall",{msgData:req.query})
            http.send(res, RET_OK);

        }

        async paySuccess(req,res){
            const { userMgr } = app;
            var userid = req.query.userid;		
            userMgr.sendMsg(userid, 'paySuccess', {userid});
            http.send(res, RET_OK);
        }
        

      
        

    }

    return httpController;
};
