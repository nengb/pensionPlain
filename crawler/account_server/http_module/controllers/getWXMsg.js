
const  db = require('../../../utils/dbsync_hall');
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

        //小程序-化妆入门教程-校验服务器接口
        async getWechatCustomerMsg(req,res){
            var token = "YoMDh7u";
            this.checkWechatMsg(token,req,res)
        }
        //小程序-化妆入门教程-接受微信客服消息
        async postWechatCustomerMsg(req,res){
            console.log("getWechatCustomerMsg_makeUp")
            console.log(req.query)
            // let { openid } = req.query;
            // if(client_service.MEMORY.TOKEN_mini_makeUp.time<Date.now()){
            //     await client_service.ACCESSTOKEN.UPDATE_MINI_LOGIN_ACCESSTOKEN_makeUp () 
            // }
            let access_token = client_service.MEMORY.TOKEN_mini_makeUp.value;
            console.log("access_token——makeUp",access_token)

            let { signature, timestamp, nonce, openid, encrypt_type, msg_signature } = req.query;
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

        //小程序-口红试色测评-校验服务器接口
        async getWechatCustomerMsg2(req,res){
            var token = "ClWBBlZu";
            this.checkWechatMsg(token,req,res)
        }
        //小程序-口红试色测评-接受微信客服消息
        async postWechatCustomerMsg2(req,res){
            console.log("getWechatCustomerMsg_makeUp")
            console.log(req.query)
            // let { openid } = req.query;
            if(client_service.MEMORY.TOKEN_mini_nars.time<Date.now()){
                await client_service.ACCESSTOKEN.UPDATE_MINI_LOGIN_ACCESSTOKEN_nars () 
            }
            let access_token = client_service.MEMORY.TOKEN_mini_nars.value;
            console.log("access_token——nars",access_token)

            let { signature, timestamp, nonce, openid, encrypt_type, msg_signature } = req.query;
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
