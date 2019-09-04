
const  db = require('../../../utils/dbsync_hall');
const  dbRedis = require('../../../utils/db_redis_hall');
const  crypto = require('../../../utils/crypto');
const  http = require('../../../utils/http');
const  configs = require('../../../configs.js');
const path = require('path');
const fs = require('fs');
// const client_service = require("../../client_service");


/**
 * 
 *  晒单模块
 */

// import db from '../utils/dbsync_hall'
// await db.update_user_info(account, name, headimgurl, sex)
module.exports = app => {
    const controllerUtils = require('../utils')(app)
    class httpController extends controllerUtils{
        constructor(){
            super()
        }
        async checkWechatMsg(token,req,res){

            var signature = req.query.signature;
            var timestamp = req.query.timestamp;
            var echostr = req.query.echostr;
            var nonce = req.query.nonce;
            console.log(req.query)
            var oriArray = new Array();
            oriArray[0] = nonce;
            oriArray[1] = timestamp;
            oriArray[2] = token;
            oriArray.sort();
            var original = oriArray.join('');
            var scyptoString = crypto.sha1(original)
            if (signature == scyptoString) {
                //验证成功
                res.send(echostr)
            } else {
                //验证失败
                res.send("error")
            }
        }

        postWechatCustomerMsg(name,req,res){
            console.log(`getWechatCustomerMsg:`,name)
            console.log(req.query)
            // if(client_service.MEMORY[`TOKEN_mini_${makeUp}`].time<Date.now()){
            //     await client_service.ACCESSTOKEN.UPDATE_MINI_LOGIN_ACCESSTOKEN_makeUp () 
            // }
            let access_token = client_service.MEMORY[`TOKEN_mini_${makeUp}`].value;
            console.log(`access_token-${name}`,access_token);
            


        }

        //小程序-校验服务器接口
        async getWechatCustomerMsg(req,res){
            var token = "YoMDh7u";
            this.checkWechatMsg(token,req,res)
        }
        //小程序-接受微信客服消息
        async postWechatCustomerMsg(req,res){
            console.log("getWechatCustomerMsg_makeUp")
            console.log(req.query)
            // let { openid } = req.query;
            // if(client_service.MEMORY.TOKEN_mini_makeUp.time<Date.now()){
            //     await client_service.ACCESSTOKEN.UPDATE_MINI_LOGIN_ACCESSTOKEN_makeUp () 
            // }
            let access_token =await this.get_mini_accesstoken();
            console.log("access_token——makeUp",access_token)

            var rawBody = '';//添加接收变量
            var json = {};
            req.setEncoding('utf8');
            req.on('data', function (chunk) {
                rawBody += chunk;
            });
            req.on('end', async function () {
                console.log("rawBody")
                try {
                    rawBody = JSON.parse(rawBody);
                    let { ToUserName, FromUserName, CreateTime,Event, MsgType, Content, MsgId, Encrypt,trace_id ,isrisky} = rawBody;
                    if(MsgType == 'text'){
                        if(Content == '1'){
                            let data = {
                                access_token,
                                touser:openid,
                                msgtype:'link',
                                link:{
                                    title:'邀请你一起玩游戏得奖品',
                                    description:'我发现这款游戏里面有苹果手机、大牌美妆、流行潮品、进口零食、水果等，快来一起玩吧！立即点击>>',
                                    url:'http://www.zwwlive.com/web_wjwl_egg/index.html',
                                    thumb_url:'',
                                }
                            }
                            http.postMENU(`https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${access_token}`,data,async function(err,result){
                                console.log(result)
                                //  res.send('succc') 
                                res.send('success');
                               
                            },true)
                                res.send('success');
                            
                        }else{

                        }
                    }
                    if(MsgType == 'event'){
                        if(Event =='wxa_media_check'){
                            if(trace_id){

                                if(isrisky==1){
                                    console.log(rawBody)

                                }

                            }

                        }
                         res.send('success');
                    }
                } catch (error) {
                    
                }
                console.log(rawBody)

            })
        }


        //微信公众号-校验服务器接口
        async getWechatMsg(req,res){
            var token = "YoMDh7u";
            this.checkWechatMsg(token,req,res)
        }

        //微信公众号-接受微信公众号消息
        async postWechatMsg(req,res){
            console.log("getWechatCustomerMsg_makeUp")
            console.log(req.query)
            // let { openid } = req.query;
            // if(client_service.MEMORY.TOKEN_mini_makeUp.time<Date.now()){
            //     await client_service.ACCESSTOKEN.UPDATE_MINI_LOGIN_ACCESSTOKEN_makeUp () 
            // }
            let access_token =await this.get_mini_accesstoken;
            
            console.log("access_token——makeUp",access_token)

            var rawBody = '';//添加接收变量
            var json = {};
            req.setEncoding('utf8');
            req.on('data', function (chunk) {
                rawBody += chunk;
            });
            req.on('end', async function () {
                console.log("rawBody")
                try {
                    rawBody = JSON.parse(rawBody);
                    let { ToUserName, FromUserName, CreateTime, MsgType, Content, MsgId, Encrypt } = rawBody;
                    if(MsgType == 'text'){
                        if(Content == '1'){
                            let data = {
                                access_token,
                                touser:openid,
                                msgtype:'link',
                                link:{
                                    title:'邀请你一起玩游戏得奖品',
                                    description:'我发现这款游戏里面有苹果手机、大牌美妆、流行潮品、进口零食、水果等，快来一起玩吧！立即点击>>',
                                    url:'http://www.zwwlive.com/web_wjwl_egg/index.html',
                                    thumb_url:'',
                                }
                            }
                            http.postMENU(`https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${access_token}`,data,async function(err,result){
                                console.log(result)
                                //  res.send('succc') 
                                res.send('success');
                               
                            },true)
                        }
                    }
                } catch (error) {
                    
                }
                console.log(rawBody)

            })
        }

      

        
        

    }

    return httpController;
};
