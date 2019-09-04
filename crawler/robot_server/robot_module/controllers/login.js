
const db = require('../../../utils/dbsync_hall');
const crypto = require('../../../utils/crypto');
const http = require('../../../utils/http');
const configs = require('../../../configs.js');
const config = configs.hall_server();
const redis = require('../../../utils/redis');

const path = require('path');
const fs = require('fs');
const  dbRedis = require('../../../utils/db_redis_hall');

const { TOKENS_USER, USERS_TOKEN, WX_GROUP_ACTIVEID } = dbRedis;

const bot = require('../bot')


const ERRCODE = require('../../../utils/errcode.js');

/**
 * Wechaty - WeChat Bot SDK for Personal Account, Powered by TypeScript, Docker, and 💖
 *  - https://github.com/chatie/wechaty
 */
const {
    Wechaty,
    log,
} = require('wechaty')

//redis表名
const { RET_OK } = ERRCODE;
//大厅服错误码
const { TOKEN_TIMEOUT, NO_USER, OPERATE_FAILED } = ERRCODE.HALL_ERRS;
//系统错误码
const { INVALID_PARAMETER, INTER_NETWORK_ERROR } = ERRCODE.SYS_ERRS;



/**
 * 
 *  用户商品管理模块
 */

// await db.update_user_info(account, name, headimgurl, sex)
module.exports = app => {
    const controllerUtils = require('../utils')(app)
    class httpController extends controllerUtils {
        constructor() {
            super()
            this.bot;
            this.room = {}

        }

        onScan (qrcode) {
            require('qrcode-terminal').generate(qrcode)  // show qrcode on console
        
            const qrcodeImageUrl = [
            'https://api.qrserver.com/v1/create-qr-code/?data=',
            encodeURIComponent(qrcode),
            ].join('')
        
            log.info('StarterBot', qrcodeImageUrl)
        }
        
        async onLogin (user) {
            log.info('StarterBot', '%s login', user)

        }
        
        onLogout (user) {
            log.info('StarterBot', '%s logout', user)
        }
        //获取内容的是否有接龙id
        msgToActive_id(text){
            let str = text.match(/\[[0-9]+\]/g);
            console.log("str")
            console.log(str)
            if(str && str.length>0){
                let a = str[0];
                if(a[0]==='[' && a[a.length-1] === ']'){
                    let active_id = Number(a.replace('[','').replace(']',''))
                    if(active_id > 0){
                        return active_id;
                    }

                }  
            }


            return ;

        }

        async getRedisGroupActiveId(group_name){
            group_name = crypto.toBase64(group_name);
            let active_id = await redis.hget(WX_GROUP_ACTIVEID,group_name)
            return active_id;
        }
        async setRedisGroupActiveId(group_name,active_id){
            // group_name = crypto.toBase64(group_name);
            // console.log(group_name)

            // let data = {
            //     [group_name]:true
            // }
            // console.log(data)
            // await redis.hmset(`${WX_GROUP_ACTIVEID}:${active_id}`, data)

            // await db.set_wx_group_room(group_name,active_id)
            return await db.set_wx_group_room(group_name,active_id);
        }
        async  onMessage (msg) {
            log.info(msg.from())
            log.info(msg.to())
            log.info(msg.room())
            log.info(msg.text())
            
            log.info('StarterBot', msg.toString())

            const contact = msg.from()
            const text = msg.text()
            const room = msg.room()
            if (room) {
                const topic = await room.topic()

                console.log(`Room: ${topic} Contact: ${contact.name()} Text: ${text}`)
                console.log('msg.self()',msg.self())

                if (!msg.self()) {
                    let active_id = this.msgToActive_id(text);
                    console.log("msgToActive_id")
                    console.log(active_id)
                    if(active_id>0){
                        let group = await db.get_wx_group_room_by_name(topic)
                        if(group && group.active_id == active_id){
                        }else{
                            await db.set_wx_group_room(topic,active_id);
                        }
                        // await this.setRedisGroupActiveId(topic,active_id);
                        
                    }
                }


            } else {
                console.log(`Contact: ${contact.name()} Text: ${text}`)
            }


        }


        async roomInvite(roomInvitation){
            try {
                console.log(`received room-invite event.`)
                await roomInvitation.accept()
              } catch (e) {
                console.error(e)
              }
        }
        
        






    }

    return httpController;
};
