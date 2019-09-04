
const  redis = require('../../../utils/redis');
const  crypto = require("../../../utils/crypto");
const  db = require('../../../utils/dbsync_hall');
const  dbRedis = require('../../../utils/db_redis_hall');
const  http = require('../../../utils/http');
const  ERRCODE = require('../../../utils/errcode.js');

const { TOKENS_USER, USERS_TOKEN } = dbRedis;
const { TOKEN_TIMEOUT } = ERRCODE.HALL_ERRS;

class token {
    constructor(){

        //不检测token的接口名单
        this.noCheckTokenApi = {
            '/login':true,
            '/mini_wechat_auth':true,
            '/h5_wechat_auth':true,
            '/wechatPay_back':true,
            '/get_wechatPay_to_user':true,
            '/refund_to_buyer':true,
            '/get_wechat_order':true,
            '/getWechatCustomerMsg':true,
            '/getWechatMsg':true,
            '/get_wechat_jssdk_config':true,
            '/ali_oss_callback':true,
            '/send_template_test':true,
            '/get_img':true,
            '/get_short_url':true,
            
            
        }

        this.token_expire_time = 1000*60*60*24


    }

    //检测token信息
    async check_token(req, res) {
        //获取请求接口
        let url = req._parsedUrl.pathname;
        if(this.noCheckTokenApi[url]){
            return true;
        }

        let token = req.query.token;


        let user = await db.get_user_data_by_token(token)
        // if
        // let user = await this.getUserId(token);
        if(!user){
            http.send(res, TOKEN_TIMEOUT);
            return null;
        }
        if(Date.now() - user.token_time > this.token_expire_time){
            http.send(res, TOKEN_TIMEOUT);
            return null;
        }
        // req.userid = user.userid
        return user;
    }
    async createToken(userid){
        // let oldToken = await this.getToken(userid);
        // if(oldToken && typeof oldToken == 'object' && Date.now() - oldToken.time <= 1000*60*5 ){
        //     return oldToken.token
        // }
        
        // oldToken = oldToken == null? {} : oldToken;
        // let hdel = await redis.hdel(TOKENS_USER,oldToken.token);
        // console.log(`oldToken ${oldToken}  hdel ${hdel}`)
        // console.log(oldToken)
        console.log(`createToken userid`,userid)
        console.log(userid)
        let user = await db.get_user_data_by_userid(userid)
        if(user){
            let { userid, token, token_time } = user;
            console.log(token_time)
            if(Date.now() - token_time <= this.token_expire_time ){
                return token;
            }
        }

        console.log(`创建token`)
        let time = Date.now();
        // console.log(`createToken ${userid}` )
        let token = crypto.md5(userid + "!@#$%^&" + time);
        // let TOKENS_USER_Data  = {};
        // let USERS_TOKEN_Data  = {};
        // TOKENS_USER_Data[token] = JSON.stringify({
        //     userid,
        //     time,
        // });
        // USERS_TOKEN_Data[userid] = JSON.stringify({
        //     token,
        //     time,
        // });
        // console.log(TOKENS_USER_Data)
        // console.log(USERS_TOKEN_Data)
        // await redis.hmset(TOKENS_USER,TOKENS_USER_Data);
        // await redis.hmset(USERS_TOKEN,USERS_TOKEN_Data);

        let result = await db.update_user_token(userid,token,time)

        return token;
    }

    async getToken(userid){
        // return await redis.get(`${USERS_TOKEN}:${userid}`);
        let user = await db.get_user_data_by_userid(userid)
        if(!user){
            return null;
        }
        return user;
    }
    async getUserId(token){
        if(token == null){
            return;
        }
        // return await redis.get(`${TOKENS_USER}:${token}`);
        let user = await db.get_user_data_by_token(token)
        return user;

    }
    async delToken(token){
        return await redis.del(`${TOKENS_USER}:${token}`);
    }

    async getUserInfo(token){
        let user = await this.getUserId(token);
        return user;

    }

}

module.exports = new token();