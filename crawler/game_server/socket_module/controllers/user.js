
const db = require('../../../utils/dbsync_game');
const myredis = require('../../../utils/redis');
const http = require('../../../utils/http');
const jiguangPush = require('../../../utils/jiguangPush');
const cf = require('../../configs');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const crypto = require('../../../utils/crypto');
const sys = require('../../../utils/sys');
const configs = require('../../../configs.js');

const { FILTERWORDS, NOFILTERWORDS, PROJECT, findClassify, hasClassify, hasProject, FAILEDGIFT, TIME_OUT ,translateText} = cf;

module.exports = app => {
    
    class MacController {
        constructor(){
            this.barrageDbName = {
                "1":"msg_game",                 //游戏中弹幕
                "2":"msg_game_success",         //获得奖品弹幕
                "3":"msg_send_out_goods",       //系统发货弹幕
                "4":"msg_submit_order",         //玩家提交发货订单弹幕
            }
        }
        async login (socket,data){
            const { userMgr } = app
            try{
                // console.log("登陆")
                // console.log(data)
                
                let userid = Number(data.userid);
                if( String(userid) == 'NaN' ||  userid == 0){
                    console.log("传参错误"+userid)
                    return;
                }
                if(socket.userid != null){
                    //已经登陆过的就忽略
                    // console.log("玩家已经登录")
                    return ;
                }else{
                    console.log("登陆")
                    console.log(data)
                }	
                let checkSocket = await userMgr.get(userid);   //检查玩家是否已经在另外设备登陆
                if(checkSocket){
                    //已经建立长连接，通知另外已登陆的客户端先断开连接
                    console.log("已经建立长连接，通知另外已登陆的客户端先断开连接")
                    // checkSocket.emit("other_client_login",{});
                    await userMgr.sendMsg(userid,"other_client_login",{})		
                    
                }
                
                let userInfo =await db.get_user_data_by_userid(userid);
                if(!userInfo){
                    console.log(`login 数据库不存在改玩家${userid}`)
                    return;
                }
                await userMgr.bind(userid,socket);
                socket.userid = userid;
                // let msgData = await app.http_controllers.index.getBarrageData();
                // let noticeData = await app.http_controllers.notice.getNoticeData();
                // // console.log("msgData")
                // // console.log(msgData)
                // await userMgr.sendMsg(userid,"allBarrageData",{msgData})	
                // await userMgr.sendMsg(userid,"allNoticeData",{noticeData})	



            }catch(e){
                console.log(e);
            }




        
        }
        async disconnect (socket,data){
            const { userMgr } = app

            console.log("----------------------disconnect------------------")
            let userid = socket.userid;
            console.log(userid)
            console.log(await userMgr.get(userid) != socket)
            if(!userid){
                return;
            }
            
            // console.log('socketMsg',userMgr.get(userId));
            let socketId = await userMgr.get(userid) 
            if( socketId != socket.id) {
                console.log(`socketid不一样socketId${socketId} socket.id ${socket.id}`)
                return;
            }
        
            //通知玩家信息已清掉
            // socket.emit('user_state_push');
            await userMgr.sendMsg(userid,"user_state_push",{})		
            
            //清除玩家的在线信息
            await userMgr.del(userid);
        
        
            socket.userid = null;
        }

     

    }

    return MacController;
}

