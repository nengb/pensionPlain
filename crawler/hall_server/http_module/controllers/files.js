
const db = require('../../../utils/dbsync_hall');
const dbRedis = require('../../../utils/db_redis_hall');
const crypto = require('../../../utils/crypto');
const http = require('../../../utils/http');
const configs = require('../../../configs.js');
const config = configs.hall_server();

const path = require('path');
const fs = require('fs');
const TOKEN = require('../utils/token');
var request = require('request');//http请求库
var fs_node = require('node-fs');//文件操作库
var formstream = require('formstream');
const ERRCODE = require('../../../utils/errcode.js');
//redis表名
const { TOKENS_USER, USERS_TOKEN } = dbRedis;
const { RET_OK } = ERRCODE;
//大厅服错误码
const { TOKEN_TIMEOUT, NO_USER, FILE_TOO_BIG, NO_FILE_TYPE } = ERRCODE.HALL_ERRS;
//系统错误码
const { INVALID_PARAMETER } = ERRCODE.SYS_ERRS;

let OSS = require('ali-oss');

let oss_client = new OSS({
    region: 'oss-cn-hangzhou',
    accessKeyId: 'LTAIIeSywergFJZw',
    accessKeySecret: 'SaIpvQvIghKWZI5bMWpekk5q0hLj33',
    bucket: 'qunjielong'
});


/**
 * 
 *  文件管理模块
 */

// import db from '../utils/dbsync_hall'
// await db.update_user_info(account, name, headimgurl, sex)
module.exports = app => {
    const controllerUtils = require('../utils')(app)
    class httpController extends controllerUtils {
        constructor() {
            super()



            //获取域名
            let domain = configs.SERVER_CONF.domain()
            //网络文件根路径
            this.netFileRoot = `http://${domain}/userActiveFile/`


            this.fileTypeLimit = {
                'image': true,
                'video': true,
                'audio': true,
            }
        }

        /**
        * showdoc
        * @catalog 文件上传
        * @title 文件上传
        * @description 可上传图片、视频、音频
        * @method post
        * @url https://xxx:9001/upload_files
        * @param token 必选 string 用户凭证token  
        * @return {"data":["http://192.168.0.119/userActiveFile/519207/audio/2019313/tmp_bcf6a4ae6305a308d54508cff99c3bd2851c05ba66846f1f.silk"],"errcode":0,"errmsg":"ok"}
        * @return_param data array 网络文件链接数组对象
        * @remark 这里是备注信息
        * @number 1
        */
        async upload_files(req, res) {
            let { token } = req.query;
            let user = req.user;

            let { userid } = user;
            let filePath = [];
            console.log(req.files);

            // switch(checkFile){
            //     case -1: return http.send(res, FILE_TOO_BIG);
            //     case -2: return http.send(res, NO_FILE_TYPE);
            // }
            for (let key in req.files) {
                let files_Obj = req.files[key];
                let files = []
                if (!this.isArray(files_Obj)) {
                    files.push(files_Obj)
                } else {
                    files = files_Obj;
                }


                for (let i in files) {
                    let checkFile = this.checkFile(files[i]);
                    //检测文件大小
                    if (checkFile) {

                        let f_path = await this.saveFile(userid, files[i]);
                        filePath.push(f_path);
                    } else {
                        // filePath.push(checkFile);
                    }
                }


            }
            console.log(`用户$${userid} 上传文件`, filePath)
            http.send(res, RET_OK, { data: filePath });

        }

        /**
        * showdoc
        * @catalog 文件上传
        * @title 文件上传
        * @description 可上传图片、视频、音频
        * @method post
        * @url https://xxx:9001/upload_files
        * @param token 必选 string 用户凭证token  
        * @return {"data":["http://192.168.0.119/userActiveFile/519207/audio/2019313/tmp_bcf6a4ae6305a308d54508cff99c3bd2851c05ba66846f1f.silk"],"errcode":0,"errmsg":"ok"}
        * @return_param data array 网络文件链接数组对象
        * @remark 这里是备注信息
        * @number 1
        */
        async upload_web_files(req, res) {
            let { token } = req.query;
            let user = req.user;

            let { userid } = user;
            let filePath = [];
            // switch(checkFile){
            //     case -1: return http.send(res, FILE_TOO_BIG);
            //     case -2: return http.send(res, NO_FILE_TYPE);
            // }
            for (let key in req.files) {
                let files_Obj = req.files[key];
                let files = []
                if (!this.isArray(files_Obj)) {
                    files.push(files_Obj)
                } else {
                    files = files_Obj;
                }



                for (let i in files) {
                    let checkFile = this.checkFile(files[i]);
                    //检测文件大小
                    if (checkFile) {
                        let f_path = await this.saveFile(userid, files[i]);
                        filePath.push(f_path);
                    } else {
                        // filePath.push(checkFile);
                    }
                }
            }
            console.log(`用户$${userid} 上传文件`, filePath)
            http.send(res, RET_OK, { data: filePath });

        }




        //保存文件
        async  saveFile(userid, fileObj) {
            let fileTypeName = fileObj.type.split('/')[0];
            if (!this.fileTypeLimit[fileTypeName]) {
                return;
            }
            if (fileTypeName == "image") {
                let check_sec = await this.check_img_sec(fileObj)
                console.log(check_sec)
                if (!check_sec) {
                    return 'http://www.csxtech.com.cn/logo.png';
                }
            }

            let date = new Date();
            let year = date.getFullYear()
            let month = date.getMonth()
            let day = date.getDate();
            let nowTime = `${year}${month}${day}`

            let filename = fileObj.originalFilename;

            //linux服务器文件根目录路径
            let saveFilePathRoot = `/root/wwwroot/userActiveFile/`;
            //window服务器文件根目录路径
            // let saveFilePathRoot = `F:/neng/game/qunjielong/files/`;


            //文件相对目录路径
            let saveFilePath = `${userid}/${fileTypeName}/${nowTime}/`;
            let filePath = saveFilePathRoot + saveFilePath;

            this.mkdirsSync(filePath);
            //复制文件到指定路径
            let targetPath = path.join(filePath + filename)
            console.log(targetPath)
            //复制文件流
            let result1 = await this.oss_put(fileObj.path, saveFilePath + filename)
            try {
                let result = fs.createReadStream(fileObj.path).pipe(fs.createWriteStream(targetPath));
            } catch (error) {

            }
            return result1.url;

        }

        //校验文件
        checkFile(fileObj) {
            if (!fileObj || !fileObj.type || !fileObj.size) {
                return -3;
            }
            let fileTypeName = fileObj.type.split('/')[0];
            let fileSizeLimit = app.uploadFileSizeLimit[fileTypeName];
            if (fileObj.size > fileSizeLimit) {
                return -1;
            }
            if (!this.fileTypeLimit[fileTypeName]) {
                return -2;
            }

            return true;
        }

        //检查图片安全
        async check_img_sec(file) {
            let _this = this
            return new Promise((resolve, reject) => {

                fs.stat(file.path, async function (err, stat) {
                    let access_token = await _this.get_mini_accesstoken();
                    var url = `https://api.weixin.qq.com/wxa/img_sec_check?access_token=${access_token}&type=image`;//uploadType就是媒体文件的类型，image,voice等
                    var form = formstream();
                    form.file('media', file.path, file.fileName, stat.size);//将文档中媒体文件需要的filename，filelength参数加到要上传的表单，content-type不知道为啥没有，可能自带吧
                    var upload = request.post(url, { headers: form.headers() }, async function (err, httpResponse, body) {
                        if (err) {
                            console.error('上传失败:', err);
                            reject(false)
                        }

                        var data = JSON.parse(body)
                        if (data.errcode == 0) {
                            resolve(true)
                        } else {
                            reject(false)
                        }
                    });
                    form.pipe(upload);
                });
            });
        }


        async  oss_put(file, name) {

            try {
                let result = await oss_client.put(name, file);
                return result;

            } catch (e) {
                console.log('asasd', e);
                return false;

            }
        }


        /**
   * showdoc
   * @catalog 文件上传
   * @title 获取图片数据
   * @description 获取图片数据
   * @method get
   * @url https://xxx:9001/get_img
   * @param token 必选 string 用户凭证token  
   * @param url 必选 string 图片地址  
   * @return 图片数据流
   * @remark 这里是备注信息
   * @number 1
   */
        async  get_img(req, res) {
            var url = req.query.url;
            if (!url || url == null || url == "null" || url == "null.jpg") {
                http.send(res, { code: 1, msg: 'invalid url' }, true);
                return;
            }
            if (url.indexOf('thirdwx.qlogo.cn') != -1 || url.indexOf('wx.qlogo.cn') != -1) {//微信头像
                url = url.split('.jpg')[0];
            }
            if (url.indexOf('thirdqq.qlogo.cn') != -1) {//QQ头像
                url = url.split('.jpg')[0];
            }
            var safe = url.search('https://') == 0;
            if (!url || url == null || url == "null") {
                http.send(res, { code: 1, msg: 'invalid url' }, true);
                return;
            }
            var ret = await http.getSync12(url, null, safe, true, 'binary');
            if (!ret.type || !ret.data) {
                http.send(res, { code: 1, msg: 'invalid url' }, true);
                return;
            }
            res.writeHead(200, { "Content-Type": ret.type });
            res.write(ret.data, 'binary');
            res.end();
        }
        /**
   * showdoc
   * @catalog 文件上传
   * @title 获取图片数据
   * @description 获取图片数据
   * @method get
   * @url https://xxx:9001/get_img
   * @param token 必选 string 用户凭证token  
   * @param long_url 必选 string 地址  
   * @return {"data":"https://w.url.cn/s/AD0jKMU","errcode":0,"errmsg":"ok"}
   * @return_param data string 短连接
   * @remark 这里是备注信息
   * @number 1
   */
      
        async get_short_url(req, res) {
            let long_url = req.query.long_url
            if (!long_url) {
                http.send(res, { code: 1, msg: 'invalid url' }, true);
                return;
            }


            let access_token = await this.get_wx_accesstoken();
            let data = {
                action: 'long2short',
                long_url: long_url,
            }
            let result = await http.postMENU(`https://api.weixin.qq.com/cgi-bin/shorturl?access_token=${access_token}`, data);
            if (result.data) {
                try {
                    result.data = JSON.parse(result.data)

                } catch (err) {

                }
            }
            http.send(res, RET_OK, { data: result.data.short_url });
        }

    }

    return httpController;
};
