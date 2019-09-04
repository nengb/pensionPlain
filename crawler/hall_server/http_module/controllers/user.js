
const db = require('../../../utils/dbsync_hall');
const dbRedis = require('../../../utils/db_redis_hall');
const crypto = require('../../../utils/crypto');
const http = require('../../../utils/http');
const configs = require('../../../configs.js');
const config = configs.hall_server();

const path = require('path');
const fs = require('fs');
const TOKEN = require('../utils/token');

const ERRCODE = require('../../../utils/errcode.js');
//redis表名
const { TOKENS_USER, USERS_TOKEN } = dbRedis;
const { RET_OK } = ERRCODE;
//大厅服错误码
const { TOKEN_TIMEOUT, NO_USER, OPERATE_FAILED } = ERRCODE.HALL_ERRS;
//系统错误码
const { INVALID_PARAMETER } = ERRCODE.SYS_ERRS;



/**
 * 
 *  用户管理模块
 */

// import db from '../utils/dbsync_hall'
// await db.update_user_info(account, name, headimgurl, sex)
module.exports = app => {
    const controllerUtils = require('../utils')(app)
    class httpController extends controllerUtils {
        constructor() {
            super()
        }

        async get_all_accesstoken() {
            let accesstoken = await this.get_mini_accesstoken()
            let accesswxtoken = await this.get_wx_accesstoken()
            console.log("accesstoken")
            console.log(accesstoken)
            console.log("accesswxtoken")
            console.log(accesswxtoken)
        }
        //code 换 accesstoken
        async  get_user_access_token(code, brower) {
            let bT = brower == 0 ? "wechat" : "nowechat";

            let info = config.appInfo.H5[bT];
            console.log("info")
            console.log(info)
            let AppID = await db.get_configs('AppID') || info.appid
            let secret = await db.get_configs('secret') || info.secret

            if (info == null) {
                return { err: 'haha' };
            }
            let data = {
                appid: AppID,
                secret: secret,
                code: code,
                grant_type: "authorization_code"
            };

            return await http.getSync("https://api.weixin.qq.com/sns/oauth2/access_token", data, true);
        }
        //获取用户信息
        async get_state_info({ access_token, openid, type }) {
            if (!type) {
                let type = 0
            }
            if (type == 0) {
                return await http.getSync("https://api.weixin.qq.com/sns/userinfo", { access_token, openid }, true);
            } else if (type == 1) {
                return await http.getSync("https://graph.qq.com/user/get_user_info", { access_token, openid }, true);
            } else if (type == 2) {
                return await http.getSync("https://api.weibo.com/2/users/show.json", { access_token, openid }, true);
            }
            // return http.getSync("https://api.weixin.qq.com/cgi-bin/user/info",data,true);
        }


        async checkAttentWechat() {

        }

        /**
        * showdoc
        * @catalog 用户信息管理
        * @title 微信小程序注册用户
        * @description 微信小程序注册用户接口，注册完后需要走login接口登录
        * @method get
        * @url https://xxx:9001/mini_wechat_auth
        * @param appid 必选 string 微信小程序appid  
        * @param code 必选 string 微信小程序用户登录凭证,通过微信小程序接口获取
        * @param nickname 可选 string 用户昵称  
        * @param sex 可选 number 用户性别,1：男性，2：女性 
        * @param headimg 可选 string 用户头像
        * @param encryptedData 可选 string 包括敏感数据在内的完整用户信息的加密数据
        * @param iv 可选 string 加密算法的初始向量
        * @param invitor 可选 string 加密算法的初始向
        * @return {"data":{"account":"wx_o5_aPwQGiw67_1C-UAfBjvjLtL3g","openid":"o_GN45Kucn7Aav7OCoMMCZ4i6lfI","unionid":"o5_aPwQGiw67_1C-UAfBjvjLtL3g"},"errcode":0,"errmsg":"ok"}
        * @return_param account string 用户账号
        * @return_param openid string 用户openid
        * @return_param unionid string 用户unionid
        * @remark 这里是备注信息
        * @number 1
        */
        //微信小程序授权
        async mini_wechat_auth(req, res) {

            let { appid, code, nickname, sex, headimg, encryptedData, iv, invitor } = req.query;

            console.log(req.query)
            console.log('小程序登陆---1>', code);
            let wechatMinConf = this.findWechatMinConf(appid);
            if (!code || !wechatMinConf) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            let { secret } = wechatMinConf;
            let retAccess = await this.get_access_token_mini({ code, appid, secret });
            console.log(retAccess.data)
            if (retAccess.err || retAccess.data == null || !retAccess.data.openid || !retAccess.data.session_key) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            let session_key = retAccess.data.session_key;//会话秘钥key

            let openid = retAccess.data.openid;
            let unionid = retAccess.data.unionid;
            let deDate;
            if (encryptedData) {
                //解密数据 //unionid 解密
                deDate = crypto.decryptData(encryptedData, iv, appid, session_key);
                //解密失败
                if (!deDate) {
                    http.send(res, INVALID_PARAMETER);
                    return console.error('小程序登陆 解密失败', deDate);
                }
                console.log("deDate");
                console.log(deDate);
                unionid = deDate.unionId;
                nickname = deDate.nickName;//名字
                sex = deDate.gender;//男或女
                headimg = deDate.avatarUrl;//头像
            }

            // if(!unionid){
            //     http.send(res, INVALID_PARAMETER);
            //     return;
            // }
            let accountId = unionid != null ? unionid : openid;

            let account = "wx_" + accountId;


            let invitor_data = await db.get_user_data_by_userid(invitor);
            let agent = null;
            if (!invitor_data) {
                invitor = 0
            } else {
                if (invitor_data && !agent) {
                    agent = invitor_data.agent
                }
            }

            if (!agent) {
                agent = 'mini'
            }
            await this.create_user({ account, name: nickname, sex, headimg, invitor, openid, unionid });
            // let sign = crypto.md5(account + req.ip + config.ACCOUNT_PRI_KEY);
            let ret = {
                account: account,
                openid: openid,
                unionid: unionid,
                session_key: session_key,
            };
            http.send(res, RET_OK, { data: ret });
        };

        /**
        * showdoc
        * @catalog 用户信息管理
        * @title 微信网页授权注册用户
        * @description 微信网页授权注册用户接口，注册完后需要走login接口登录
        * @method get
        * @url https://xxx:9001/h5_wechat_auth
        * @param appid 必选 string 微信小程序appid  
        * @param code 必选 string 微信小程序用户登录凭证,通过微信小程序接口获取
        * @param nickname 可选 string 用户昵称  
        * @param sex 可选 number 用户性别,1：男性，2：女性 
        * @param headimg 可选 string 用户头像
        * @param encryptedData 可选 string 包括敏感数据在内的完整用户信息的加密数据
        * @param iv 可选 string 加密算法的初始向量
        * @param invitor 可选 string 加密算法的初始向
        * @return {"data":{"account":"wx_o5_aPwQGiw67_1C-UAfBjvjLtL3g","openid":"o_GN45Kucn7Aav7OCoMMCZ4i6lfI","unionid":"o5_aPwQGiw67_1C-UAfBjvjLtL3g"},"errcode":0,"errmsg":"ok"}
        * @return_param account string 用户账号
        * @return_param openid string 用户openid
        * @return_param unionid string 用户unionid
        * @remark 这里是备注信息
        * @number 1
        */
        //微信网页授权
        async h5_wechat_auth(req, res) {

            let { code, invitor } = req.query;

            let retAccess = await this.get_user_access_token(code, 0);
            console.log(retAccess.data)

            if (retAccess.err || retAccess.data == null || retAccess.data.errcode) {
                http.send(res, -3, `unkown err. ${JSON.stringify(retAccess)}`);
                return;
            }

            let { access_token, openid, unionid } = retAccess.data;

            let ret = await this.get_state_info({ access_token, openid, type: 0 });
            if (ret.err || ret.data == null || ret.data.errcode) {
                http.send(res, -4, `unkown err.${JSON.stringify(ret)}`);
                return;
            }
            console.log("ret get_h5_state_info")
            console.log(ret)

            let { nickname, sex, headimgurl: headimg } = ret.data;


            let accountId = unionid != null ? unionid : openid;
            let account = "wx_" + accountId;

            let invitor_data = await db.get_user_data_by_userid(invitor);
            let agent = null;
            if (!invitor_data) {
                invitor = 0
            } else {
                if (invitor_data && !agent) {
                    agent = invitor_data.agent
                }
            }

            if (!agent) {
                agent = 'mini'
            }
            await this.create_user({ account, name: nickname, sex, headimg, invitor, wx_openid: openid, unionid });
            // let sign = crypto.md5(account + req.ip + config.ACCOUNT_PRI_KEY);
            let data = {
                account: account,
                openid: openid,
                unionid: unionid,
            };
            http.send(res, RET_OK, { data: data });
        };


        //向微信服务器获取微信小程序 access_token
        async get_access_token_mini({ code, appid, secret }) {
            let data = {
                appid: appid,
                secret: secret,
                js_code: code,
                grant_type: "authorization_code"
            };

            return await http.getSync("https://api.weixin.qq.com/sns/jscode2session", data, true);
        }

        //创建用户
        async create_user({ account, name, sex, headimg, invitor, openid, unionid, wx_openid }) {

            // let exist = await db.get_user_data(account);
            let exist = await db.get_user_data_by_u_o_wxo_a({ unionid, openid, wx_openid, account });
            if (exist) {
                console.log(`已存在用户 ${account}`)
                console.log(exist)
                let { userid } = exist
                return await db.update_user_info({ userid, account, name, headimg, openid, unionid, wx_openid });
            }
            else {
                console.log(`创建用户 ${account} ${name} ${openid}`)
                return await db.create_user({ account, name, sex, headimg, invitor, openid, unionid, wx_openid });
            }
        };


        //获取微信小程序配置
        findWechatMinConf(appid) {
            for (let key in config.appInfo.H5) {
                let info = config.appInfo.H5[key];
                if (info.appid === appid) {
                    return info;
                }
            }
            return null;
        }

        /**
        * showdoc
        * @catalog 用户信息管理
        * @title 用户登录
        * @description 登录接口，获取token，每次走该接口token都会发生变化，后续所有接口都需要带上token
        * @method get
        * @url https://xxx:9001/login
        * @param account 必选 string 用户账号  
        * @return {"data":{"token":"025de5a04913097a80fbc424f3cd731a"},"errcode":0,"errmsg":"ok"}
        * @return_param token string 用户凭证token 
        * @remark 这里是备注信息
        * @number 2
        */
        async login(req, res) {
            let { account, latitude, longitude } = req.query;
            if (account == null) {
                http.send(res, NO_USER);
                return;
            }

            let user = await db.get_user_data(account);
            if (!user) {
                http.send(res, NO_USER);
                return;
            }

            let { userid } = user;
            await db.update_user_info({ userid, latitude, longitude })
            let token = await TOKEN.createToken(userid);
            console.log(token)
            let ret = {
                token
            }

            http.send(res, RET_OK, { data: ret });
        }

        /**
        * showdoc
        * @catalog 用户信息管理
        * @title 上报用户定位
        * @description 上报用户定位
        * @method get
        * @url https://xxx:9001/uploadLocation
        * @param latitude 必选 string 经度  
        * @param longitude 必选 string 纬度  
        * @return {"data":{"token":"025de5a04913097a80fbc424f3cd731a"},"errcode":0,"errmsg":"ok"}
        * @return_param token string 用户凭证token 
        * @remark 这里是备注信息
        * @number 2
        */
        async uploadLocation(req, res) {
            let { token, latitude, longitude } = req.query;
            if (latitude == null || longitude == null) {
                return http.send(res, INVALID_PARAMETER);
            }
            let user = req.user
            let { userid } = user;
            let ret = await db.update_user_info({ userid, latitude, longitude })

            http.send(res, RET_OK, { data: ret });
        }




        /**
        * showdoc
        * @catalog 用户信息管理
        * @title 查看用户信息
        * @description 查看用户信息接口
        * @method get
        * @url https://xxx:9001/get_user_info
        * @param token 必选 string 用户凭证token 
        * @return {"data":{"userid":519207,"account":"wx_o5_aPwQGiw67_1C-UAfBjvjLtL3a","name":"🇳 🇪 🇳 🇬","sex":1,"headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTInSWicVSUdicGxKOnWhicnoR4zlZFmakVBbWPKYjGGQUZfaXRdEkFQPZlq6PgibDL7TiaZh6l7MSBhwTg/132","money":0,"create_time":null,"first_login":null,"last_login":null,"token":null,"phone":null,"real_name":null,"addr":null,"openid":null,"invitor_id":null,"attent_wechat":null,"about_me":null},"errcode":0,"errmsg":"ok"}
        * @return_param userid number 用户id
        * @return_param account string 用户账号
        * @return_param sex number 用户性别,1：男性，2：女性 
        * @return_param headimg string 用户头像
        * @return_param money number 用户余额
        * @return_param create_time number 用户创建时间
        * @return_param first_login number 用户第一次登陆时间
        * @return_param last_login number 用户最后一次登陆时间
        * @return_param phone number 用户电话
        * @return_param real_name string 用户真实名称
        * @return_param addr string 用户地址
        * @return_param openid string 用户openid
        * @return_param invitor_id number 邀请人id
        * @return_param attent_wechat number 是否关注公众号，0：未关注，1：关注
        * @return_param about_me string 用户简介
        * @return_param userFansCount number 用户粉丝数量
        * @remark 这里是备注信息
        * @number 3
        */
        async get_user_info(req, res) {

            let { token } = req.query;
            let user = req.user;

            console.log(req.user)
            let { userid } = user;

            //单日提现最大次数
            let withdraw_max_count = await db.get_configs('withdraw_max_count') || 0
            //每天提现金额
            let withdraw_money_limit = await db.get_configs('withdraw_money_limit') || 0

            //统计玩家粉丝数量
            let getFansCount = await db.getFansCount(userid)
            //统计粉丝参加我的接龙数量
            let getFansAttentWechatCount = await db.getFansAttentWechatCount(userid)
            //统计未读粉丝数量
            let unread_fans = await db.get_user_unread_fans_count({ userid });
            //统计未读凭证数量
            let unread_credential = await db.get_user_unread_credential_count({ userid });
            //统计未读消息
            let unread_message = await db.get_user_unread_message_count({ userid });
            //统计今日提现次数
            let user_today_withdraw_info = await db.get_user_today_withdraw_info(user.userid)


            let userFansCount = getFansCount ? getFansCount.userFansCount : 0;
            let userFansAttentWechatCount = getFansAttentWechatCount ? getFansAttentWechatCount.userFansCount : 0;
            let unread_fans_count = unread_fans ? unread_fans.unread_fans_count : 0;
            let unread_credential_count = unread_credential ? unread_credential.unread_credential_count : 0;
            let unread_message_count = unread_message ? unread_message.unread_message_count : 0;

            user.userFansCount = userFansCount
            user.userFansAttentWechatCount = userFansAttentWechatCount
            user.unread_fans_count = unread_fans_count
            user.unread_credential_count = unread_credential_count
            user.unread_message_count = unread_message_count
            user.withdraw_count = user_today_withdraw_info.all_count
            user.withdraw_money = user_today_withdraw_info.all_money
            user.withdraw_max_count = withdraw_max_count
            user.withdraw_money_limit = withdraw_money_limit

            http.send(res, RET_OK, { data: user });
        }

        /**
        * showdoc
        * @catalog 用户信息管理
        * @title 获取用户粉丝列表信息
        * @description 获取用户粉丝列表信息的接口
        * @method get
        * @url https://xxx:9001/get_user_fans
        * @param token 必选 string 用户凭证token
        * @param name 可选 string 用户名称，返回对应用户名称或备注的粉丝
        * @param attent_wechat 可选 number是否关注公众号的粉丝，0：未关注，1：关注，不传返回全部粉丝
        * @param page 可选 number 页数，每页返回50条数据，不传返回全部数据
        * @return {"data":[{"userid":17059767,"fansid":519207,"fans_state":0,"create_time":1555317788945,"remark_name":"frewf","name":"🇳 🇪 🇳 🇬","headimg":null,"attent_wechat":0,"readTimes":0,"read_alter_time":null,"active_id":null,"title":null,"attendTimes":0,"attendCost":0},{"userid":17059767,"fansid":17059767,"fans_state":0,"create_time":1555317788945,"remark_name":"neng","name":"🇳 🇪 🇳 🇬","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKR2CX866DCJ90TXtmaZWdHu3oBzvib2zu03IFvQjebXfK0sicGW53GQd85Cz97aKic6Q4VzogHMZlsA/132","attent_wechat":0,"readTimes":21,"read_alter_time":1557475619774,"active_id":20,"title":"接龙主题色调20","attendTimes":1,"attendCost":62},{"userid":17059767,"fansid":13012409,"fans_state":0,"create_time":1555317778945,"remark_name":"3123123","name":"stones","headimg":"https://wx.qlogo.cn/mmopen/vi_32/M8XkRL1icroT8UPeGeEuicJ4BicqAnd7yz2o7WjYHQ1JUOQnZ46s4lmtkpu1ZoCqQr8Fj8gkd0z5NHYs8qPdmSOGQ/132","attent_wechat":1,"readTimes":0,"read_alter_time":null,"active_id":null,"title":null,"attendTimes":0,"attendCost":0},{"userid":17059767,"fansid":40052945,"fans_state":0,"create_time":1555317778945,"remark_name":"3123123","name":"BigBinChan","headimg":"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJWddt1Ficn6dUibWsQO2mFYvibnAgELnyTVloCbko7d4WuPMfxLzmQIRxEuUABgMOr9KFiaa2hK1h4IQ/132","attent_wechat":1,"readTimes":3,"read_alter_time":1555309567416,"active_id":2,"title":"dcesdf","attendTimes":5,"attendCost":205}],"errcode":0,"errmsg":"ok"}
        * @return_param userid number 用户id
        * @return_param fansid number 粉丝id
        * @return_param fans_state number 粉丝状态：0：关注，1：屏蔽
        * @return_param create_time number 粉丝关注的时间
        * @return_param remark_name string 粉丝备注
        * @return_param name string 粉丝名称
        * @return_param headimg string 粉丝头像
        * @return_param attent_wechat number 粉丝是否关注公众号，0：未关注，1：关注
        * @return_param readTimes number 粉丝阅读被关注用户的接龙次数
        * @return_param read_alter_time number 粉丝最新阅读被关注用户的时间
        * @return_param active_id number 粉丝最新阅读被关注用户的接龙id
        * @return_param title number 粉丝最新阅读被关注用户的接龙主题
        * @return_param attendTimes number 粉丝参加被关注用户的接龙次数
        * @return_param attendCost number 粉丝在被关注用户的接龙上花费的总金额
        * @remark 这里是备注信息
        * @number 4
        */
        async get_user_fans(req, res) {

            let { token, name, attent_wechat, page } = req.query;

            let user = req.user;


            let { userid } = user;
            // try {
            //     name = crypto.toBase64(name);
            // } catch (error) {

            // }

            var start = null;
            let rows = 50;
            if (page != null) {
                page = Number(req.query.page) - 1;
                start = page * rows;
            }
            start < 0 ? start = null : null;

            //统计玩家粉丝数量
            let getFansList = await db.getFansList({ userid, attent_wechat, name, start, rows })
            http.send(res, RET_OK, { data: getFansList || [] });
        }

        /**
        * showdoc
        * @catalog 用户信息管理
        * @title 屏蔽粉丝或修改粉丝备注
        * @description 屏蔽粉丝或修改粉丝备注
        * @method get
        * @url https://xxx:9001/update_user_fans_info
        * @param token 必选 string 用户凭证token 
        * @param fansid 必选 number 粉丝id
        * @param fans_state 可选 number 粉丝状态：0：关注，1：屏蔽
        * @param remark_name 可选 string 粉丝备注名称
        * @return {"errcode":0,"errmsg":"ok"}
        * @remark 这里是备注信息
        * @number 5
        */
        async update_user_fans_info(req, res) {

            let { token, fansid, fans_state, remark_name } = req.query;
            if (fansid == null || (fans_state == null && remark_name == null)) {
                http.send(res, INVALID_PARAMETER);
                return;
            }
            let user = req.user;


            let { userid } = user;


            let update_user_fans_info = await db.update_user_fans_info({ fansid, fans_state, remark_name })
            if (update_user_fans_info) {
                http.send(res, RET_OK);
            } else {
                http.send(res, OPERATE_FAILED);
            }
        }

        /**
        * showdoc
        * @catalog 用户信息管理
        * @title 阅读我的所有粉丝
        * @description 阅读我的所有粉丝接口,会将用户所有粉丝状态标记为已读
        * @method get
        * @url https://xxx:9001/read_user_all_fans
        * @param token 必选 string 用户凭证token  
        * @return {"data":true,"errcode":0,"errmsg":"ok"}
        * @remark 这里是备注信息
        * @number 1
        */
        async read_user_all_fans(req, res) {
            let { token } = req.query;

            let user = req.user;


            let { userid, } = user;

            let read_user_all_fans = await db.read_user_all_fans({ userid });

            http.send(res, RET_OK, { data: read_user_all_fans });

        }






        /**
        * showdoc
        * @catalog 用户信息管理
        * @title 更新用户联系信息
        * @description 更新用户联系信息
        * @method get
        * @url https://xxx:9001/update_user_contact_info
        * @param token 必选 string 用户凭证token  
        * @param real_name 可选 string 联系人
        * @param phone 可选 string 联系电话
        * @param addr 可选 string 收货地址
        * @param about_me 可选 string 个人简介
        * @return {"data":true,"errcode":0,"errmsg":"ok"}
        * @remark 这里是备注信息
        * @number 1
        */
        async update_user_contact_info(req, res) {
            let { token, real_name, phone, addr, about_me } = req.query;
            if (real_name == null && phone == null && addr == null && about_me == null) {
                return http.send(res, INVALID_PARAMETER);
            }

            let user = req.user;


            let { userid, } = user;

            let update_user_contact_info = await db.update_user_contact_info({ userid, real_name, phone, addr, about_me });

            http.send(res, RET_OK, { data: update_user_contact_info });

        }


        /**
        * showdoc
        * @catalog 用户信息管理
        * @title 上报用户表单id（发送服务通知使用）
        * @description 上报用户表单id（发送服务通知使用）
        * @method get
        * @url https://xxx:9001/report_user_formid
        * @param token 必选 string 用户凭证token  
        * @param form_id 可选 string 表单id
        * @param title 可选 string 表单id
        * @param page 可选 string 上报的页面
        * @param offset_left 可选 string 点击区域离左边距离
        * @param offset_top 可选 string 点击区域离上边距离
        * @return {"data":true,"errcode":0,"errmsg":"ok"}
        * @remark 这里是备注信息
        * @number 1
        */
        async report_user_formid(req, res) {
            let { token, form_id, title, page, offset_left, offset_top } = req.query;
            if (form_id == null) {
                return http.send(res, INVALID_PARAMETER);
            }

            let user = req.user;


            let { userid, } = user;
            let create_time = Date.now();
            let expire_time = Date.now() + 1000 * 60 * 60 * 24 * 7 * 0.98;
            let state = 0;

            let report_user_formid = await db.report_user_formid({ userid, form_id, create_time, expire_time, state, title, page, offset_left, offset_top });

            http.send(res, RET_OK, { data: report_user_formid });

        }


        /**
        * showdoc
        * @catalog 用户信息管理
        * @title 获取其他用户的信息
        * @description 获取其他用户的信息接口
        * @method get
        * @url https://xxx:9001/get_other_user_info
        * @param token 必选 string 用户凭证token
        * @param view_userid 必选 number 查看的用户id
        * @return {"data":{"userFansCount":0,"userActiveCount":0,"userSubscribe":0},"errcode":0,"errmsg":"ok"}
        * @return_param getFansCount number 统计玩家粉丝数量
        * @return_param getUserActiveCount number 统计玩家接龙数量
        * @return_param userSubscribe number 是否关注,0:没关注，1：已关注
        * @return_param about_me number 用户简介
        * @return_param name number 用户名称
        * @return_param headimg number 用户头像
        * @return_param is_me number 是否是本人
       
        * @remark 这里是备注信息
        * @number 4
        */
        async get_other_user_info(req, res) {

            let { token, view_userid } = req.query;
            if (view_userid == null) {
                return http.send(res, INVALID_PARAMETER);
            }

            let user = req.user;



            let { userid, } = user;
            // 查看的用户信息
            let view_user = await db.get_user_data_by_userid(view_userid)
            if (!view_user) {
                return http.send(res, INVALID_PARAMETER);
            }

            let { about_me, name, headimg } = view_user

            about_me == null ? about_me = '' : null;
            //统计玩家粉丝数量
            let getFansCount = await db.getFansCount(view_userid)
            //统计玩家接龙数量
            let getUserActiveCount = await db.getUserActiveCount(view_userid)
            //检测是否是我的订阅
            let checkUserSubscribe = await db.checkUserSubscribe({ userid, subscribe_id: view_userid })

            let userFansCount = getFansCount ? getFansCount.userFansCount : 0;
            let userActiveCount = getUserActiveCount ? getUserActiveCount.userActiveCount : 0;
            let userSubscribe = checkUserSubscribe ? 1 : 0;

            http.send(res, RET_OK, {
                data: {
                    userFansCount,
                    userActiveCount,
                    userSubscribe,
                    about_me,
                    name,
                    headimg,
                    is_me: view_userid == userid
                }
            });
        }


        /**
        * showdoc
        * @catalog 用户信息管理
        * @title 获取用户接龙列表
        * @description 获取用户接龙列表接口
        * @method get
        * @url https://xxx:9001/get_user_active_list
        * @param token 必选 string 用户凭证token  
        * @param page 可选 number 页数，每页返回10条数据，不传返回第一页
        * @param view_userid 必选 number 查看的用户id
        * @return {"data":[{"userid":123456,"name":"bmVuZw==","headimg":null,"active_id":4,"originator_id":123456,"active_type":1,"phone":null,"title":"cssss","state":null,"list_info":null,"o_list_info":null,"participant_info":null,"group_way":null,"most_optional":null,"hide":0,"start_time":1555062612140,"end_time":null,"locale":null,"background":0,"user_secret":0,"leave_msg":0,"all_count":-999,"start_price":0,"show_user_info":0,"pay_mode":0,"reward_setting":null,"tips":null,"create_time":null,"alter_time":1555061912144,"retAttendRecords":[{"attend_id":1,"userid":519207,"active_id":1,"time":null,"active_index":1,"comments":null,"reward_money":0,"active_content":null,"attend_cost":10,"state":null},{"attend_id":2,"userid":519207,"active_id":1,"time":null,"active_index":2,"comments":null,"reward_money":0,"active_content":null,"attend_cost":30.6,"state":null},{"attend_id":3,"userid":123456,"active_id":1,"time":null,"active_index":3,"comments":null,"reward_money":0,"active_content":null,"attend_cost":20.3,"state":null},{"attend_id":4,"userid":234567,"active_id":1,"time":null,"active_index":4,"comments":null,"reward_money":0,"active_content":null,"attend_cost":21.4,"state":null}],"activeAttendCount":1,"activeReadCount":0},{"userid":519207,"name":"8J+HsyDwn4eqIPCfh7Mg8J+HrA==","headimg":null,"active_id":3,"originator_id":519207,"active_type":2,"phone":null,"title":"测试3","state":null,"list_info":null,"o_list_info":null,"participant_info":null,"group_way":null,"most_optional":null,"hide":0,"start_time":1555061912140,"end_time":null,"locale":null,"background":0,"user_secret":0,"leave_msg":0,"all_count":-999,"start_price":0,"show_user_info":null,"pay_mode":0,"reward_setting":null,"tips":null,"create_time":1555061912140,"alter_time":1555061912143,"retAttendRecords":[{"attend_id":1,"userid":519207,"active_id":1,"time":null,"active_index":1,"comments":null,"reward_money":0,"active_content":null,"attend_cost":10,"state":null},{"attend_id":2,"userid":519207,"active_id":1,"time":null,"active_index":2,"comments":null,"reward_money":0,"active_content":null,"attend_cost":30.6,"state":null},{"attend_id":3,"userid":123456,"active_id":1,"time":null,"active_index":3,"comments":null,"reward_money":0,"active_content":null,"attend_cost":20.3,"state":null},{"attend_id":4,"userid":234567,"active_id":1,"time":null,"active_index":4,"comments":null,"reward_money":0,"active_content":null,"attend_cost":21.4,"state":null}],"activeAttendCount":0,"activeReadCount":0},{"userid":519207,"name":"8J+HsyDwn4eqIPCfh7Mg8J+HrA==","headimg":null,"active_id":1,"originator_id":519207,"active_type":1,"phone":null,"title":"测试1","state":null,"list_info":null,"o_list_info":null,"participant_info":null,"group_way":null,"most_optional":null,"hide":0,"start_time":1555061812140,"end_time":null,"locale":null,"background":0,"user_secret":0,"leave_msg":0,"all_count":-999,"start_price":0,"show_user_info":null,"pay_mode":0,"reward_setting":null,"tips":null,"create_time":1555061812140,"alter_time":1555061812141,"retAttendRecords":[{"attend_id":1,"userid":519207,"active_id":1,"time":null,"active_index":1,"comments":null,"reward_money":0,"active_content":null,"attend_cost":10,"state":null},{"attend_id":2,"userid":519207,"active_id":1,"time":null,"active_index":2,"comments":null,"reward_money":0,"active_content":null,"attend_cost":30.6,"state":null},{"attend_id":3,"userid":123456,"active_id":1,"time":null,"active_index":3,"comments":null,"reward_money":0,"active_content":null,"attend_cost":20.3,"state":null},{"attend_id":4,"userid":234567,"active_id":1,"time":null,"active_index":4,"comments":null,"reward_money":0,"active_content":null,"attend_cost":21.4,"state":null}],"activeAttendCount":4,"activeReadCount":15},{"userid":519207,"name":"8J+HsyDwn4eqIPCfh7Mg8J+HrA==","headimg":null,"active_id":2,"originator_id":519207,"active_type":1,"phone":null,"title":"测试2","state":null,"list_info":null,"o_list_info":null,"participant_info":null,"group_way":null,"most_optional":null,"hide":0,"start_time":1555061612140,"end_time":null,"locale":null,"background":0,"user_secret":0,"leave_msg":0,"all_count":-999,"start_price":0,"show_user_info":null,"pay_mode":0,"reward_setting":null,"tips":null,"create_time":1555061612140,"alter_time":1555061612142,"retAttendRecords":[{"attend_id":1,"userid":519207,"active_id":1,"time":null,"active_index":1,"comments":null,"reward_money":0,"active_content":null,"attend_cost":10,"state":null},{"attend_id":2,"userid":519207,"active_id":1,"time":null,"active_index":2,"comments":null,"reward_money":0,"active_content":null,"attend_cost":30.6,"state":null},{"attend_id":3,"userid":123456,"active_id":1,"time":null,"active_index":3,"comments":null,"reward_money":0,"active_content":null,"attend_cost":20.3,"state":null},{"attend_id":4,"userid":234567,"active_id":1,"time":null,"active_index":4,"comments":null,"reward_money":0,"active_content":null,"attend_cost":21.4,"state":null}],"activeAttendCount":1,"activeReadCount":3}],"errcode":0,"errmsg":"ok"}
        * 
        * @return_param activeAttendCount number 接龙参与人数
        * @return_param activeReadCount number 接龙阅读人数
        * @return_param userid number 发布接龙的用户id
        * @return_param name number 发布接龙的用户名称
        * @return_param headimg number 发布接龙的用户头像
        * @return_param active_id number 接龙id
        * @return_param active_type  number 接龙类型，1：报名接龙-enlist，2：团购接龙-buy，3：互动接龙-interact，4：拼团接龙-assemble，5：阅读接龙-read，6：评选接龙-select，7：费用接龙-cost
        * @return_param phone  number 客服电话  
        * @return_param title  string 主题  
        * @return_param state  number 活动状态，0：保存预览，1：发布，2：完成 
        * @return_param list_info  array 列表内容，json数组对象，（dataType,1：文字，2：图片，3：视频）
        * @return_param o_list_info  array 列表内容，json数组对象，（报名接龙和互动接龙有效）（dataType,1：填写项，2：图片，3：视频,4:语音，5：位置，6：单选项，7：多选项）,
        * @return_param group_way  array 拼团方式，json数组对象，（报名项目、团购商品、拼团商品、选项、筹款等栏目）
        * @return_param most_optional  number 最多可选（只有在评选接龙才有效，1：最多可选1项，2：最多可选2项）
        * @return_param hide  number 传播隐私，0：所有人均可转发，1：隐藏接龙且所有人均可转发，2：只有发布者可以转发
        * @return_param start_time  number 活动开始时间，毫秒时间戳
        * @return_param end_time  number 活动结束时间，毫秒时间戳
        * @return_param locale  string 活动地点
        * @return_param background  number 活动背景(不知道有什么用，传0)
        * @return_param user_secret  number 用户隐私设置，0：公开所有参与者信息，1：匿名所有参与者信息
        * @return_param leave_msg number  留言设置，0：参与者无需留言，1：参与者可留言(不传默认0）
        * @return_param all_count number 接龙次数，-999：无限次(不传默认-999）
        * @return_param start_price number 接龙起购价(不传默认0）
        * @return_param start_price_mode number 接龙起购价模式，0：每次接龙需满足的起购金额，1：只需满足第一次的起购金额
        * @return_param show_user_info number 参与人显示，0：头像+微信名，1：头像+微信名匿名，2：头像，3：微信名，4：微信名匿名(不传默认0）
        * @return_param pay_mode number 确认接龙方式，0：支付后完成接龙，1：先完成接龙暂不支付(不传默认0）
        * @return_param reward_setting array 接龙奖励设置，json数组对象，（奖励费用、是否公开奖励规则、设定奖励区域范围、参与接龙有镜像、分享有奖励等）
        * @return_param tips string 填写让参与人注意的重要信息
        * @return_param create_time number 创建时间
        * @return_param alter_time number 修改时间
        * @return_param share_num number 转发次数
        * @return_param hidden number 是否隐藏，0：显示，1：隐藏
        * @return_param logistics_mode  object json对象,物流方式设置
        * @return_param show_reward_rule  number 是否公开奖励规则，0：公开，1：隐藏
        * @return_param reward_amount  number 奖励总金额
        * @return_param reward_num  number 红包数量
        * @return_param reward_locale  object json对象,设定奖励区域范围
        * @return_param use_reward  number 使用参与接龙获得奖励,0：不使用，1：使用
        * @return_param use_share_reward  number 使用分享接龙奖励，0：不使用，1：使用
        * @return_param use_reward_locale  number 使用奖励区域范围，0：不使用，1：使用
        * @return_param share_reward_rule  object json对象,分享奖励，数据结构[{share_reward_rule_id:1,num:1,reward_money:22.13}]
        * @return_param myActiveRecordsGoods  array 我的凭证商品
        * @return_param myActiveRecordsGoods/allNum  array 我的凭证商品-该商品数量
        * @remark 这里是备注信息
        * @number 1
        */
        async get_user_active_list(req, res) {
            let { token, page, view_userid } = req.query;
            if (view_userid == null) {
                return http.send(res, INVALID_PARAMETER);
            }
            let user = req.user;


            if (page == null) {
                page = 1;
            }
            var start = null;
            let rows = 10;
            if (page != null) {
                page = Number(page) - 1;
                start = page * rows;
            }

            start < 0 ? start = null : null;

            let { userid, } = user;

            let getUserActiveList = await db.getUserActiveList({ userid: view_userid, start, rows });
            if (!getUserActiveList) {
                getUserActiveList = [];
            }

            if (getUserActiveList.length > 0) {

                let filedData_activeId = db.retFiledData_to_arr(getUserActiveList, 'active_id');
                let active_ids = filedData_activeId.queryString;
                let id_arr = filedData_activeId.arr;
                if (active_ids && active_ids.length > 2) {
                    // //获取多个活动的凭证记录
                    // let AttendRecordsData = await db.getUserAttendRecords_by_activeIds({active_ids,start:0,rows:10});
                    //获取每个接龙的商品信息
                    let groupWayData = await db.get_group_way_by_activeIds({ active_ids });
                    //每个接龙参加的总人数
                    let activeAttendCount = await db.getActivesAttendCount_by_activeIds({ active_ids });
                    //每个接龙看过的总人数
                    let activeReadCount = await db.getActivesReadCount_by_activeIds({ active_ids });
                    //获取每个接龙商品最大价格和最小价格
                    let activeMaxMinPrice = await db.getActivesMaxMinPrice_by_activeIds({ active_ids });
                    //获取每个接龙我的凭证商品
                    let myActiveRecordsGoods = await db.getMyActiveRecordsGoods_by_activeIds({ userid, active_ids });
                    //组合数据
                    getUserActiveList.map(e => {
                        let { active_id, name } = e;
                        // e.retAttendRecords = AttendRecordsData[active_id] || [];
                        e.group_way = groupWayData[active_id] || [];
                        e.myActiveRecordsGoods = myActiveRecordsGoods[active_id] || [];

                        e.activeAttendCount = activeAttendCount[active_id] ? activeAttendCount[active_id] : 0;
                        e.activeReadCount = activeReadCount[active_id] ? activeReadCount[active_id] : 0;
                        e.max_price = activeMaxMinPrice[active_id] ? activeMaxMinPrice[active_id].max_price : 0;
                        e.min_price = activeMaxMinPrice[active_id] ? activeMaxMinPrice[active_id].min_price : 0;

                        try {
                            e.name = crypto.fromBase64(name);
                        } catch (error) {
                            console.error(error)
                        }
                    })

                }

            }


            http.send(res, RET_OK, { data: getUserActiveList });

        }





        /**
        * showdoc
        * @catalog 用户信息管理
        * @title 获取微信jssdk配置
        * @description 获取微信jssdk配置
        * @method get
        * @url https://xxx:9001/get_wechat_jssdk_config
        * @param url 必选 授权地址
        * 
        * @return {"data":{"appid":"wx1cf05273c7f1212e4e99","timestamp":15611188281,"noncestr":"1561188281433","signature":"845e0abec04b1925da09ddb80a8d7c3d53cce859b"},"errcode":0,"errmsg":"ok"}
        * @remark 这里是备注信息
        * @number 4
        */
        async get_wechat_jssdk_config(req, res) {

            let { url } = req.query;
            console.log(`url`, req.query)
            console.log(req.query)
            // if(url){
            //     url=decodeURIComponent(url)
            // }

            let ticket = await this.get_jsapi_ticket()
            console.log(`ticket`, ticket)
            let appid = await db.get_configs('AppID') || config.appInfo.H5.wechat.appid
            let timestamp = parseInt(Date.now() / 1000)
            let noncestr = '' + Date.now()
            let signStr = `jsapi_ticket=${ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`
            let signature = crypto.sha1(signStr);

            let data = {
                appid: appid,
                timestamp: timestamp,
                noncestr: noncestr,
                signature: signature,
            }

            http.send(res, RET_OK, {
                data
            });

        }


        /**
        * showdoc
        * @catalog 用户信息管理
        * @title 获取用户小程序码
        * @description 获取用户小程序码
        * @method get
        * @url https://xxx:9001/get_mini_scanCode
        * @param scene 必选 最大32个可见字符，只支持数字，大小写英文以及部分特殊字符：!#$&'()*+,/:;=?@-._~，其它字符请自行编码为合法字符（因不支持%，中文无法使用 urlencode 处理，请使用其他编码方式）
        * @param page 必选 授权地址
        * @param width 必选 二维码的宽度，单位 px，最小 280px，最大 1280px
        * @param is_hyaline 必选 是否需要透明底色，为 true 时，生成透明底色的小程序
        * @param page 必选 授权地址
        * 
        * @return {"data":{"appid":"wx1cf05273c7f1212e4e99","timestamp":15611188281,"noncestr":"1561188281433","signature":"845e0abec04b1925da09ddb80a8d7c3d53cce859b"},"errcode":0,"errmsg":"ok"}
        * @remark 这里是备注信息
        * @number 4
        */
        async get_mini_scanCode(req, res) {

            let { scene, page, width, is_hyaline, invitor } = req.body;

            console.log(`url`, req.query)
            console.log(req.query)

            let access_token = await this.get_mini_accesstoken()
            let data = {
                scene,
                is_hyaline: Boolean(is_hyaline),
                page:'pages/indexShare/index',
            }
            console.log(data)
            let ret = await http.postJsonImage({
                host:'api.weixin.qq.com', 
                port:'443', 
                path:`/wxa/getwxacodeunlimit?access_token=${access_token}`, 
                data, 
                safe:true,
            })
            // let ret = await http.postJsonImage('api.weixin.qq.com', '443', `/wxa/getwxacodeunlimit?access_token=${access_token}`, data, true)

            if (!ret) {
                http.send(res, -1);
                return;
            }

            http.send(res, RET_OK, { data: ret });


        }











    }

    return httpController;
};
