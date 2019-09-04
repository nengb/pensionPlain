
const db = require('../../../utils/dbsync_hall');
const dbRedis = require('../../../utils/db_redis_hall');
const crypto = require('../../../utils/crypto');
const http = require('../../../utils/http');
const configs = require('../../../configs.js');
const config = configs.hall_server();
var request = require('request');//http请求库
var fs_node = require('node-fs');//文件操作库
var formstream = require('formstream');
const path = require('path');
const fs = require('fs');

const ERRCODE = require('../../../utils/errcode.js');
//redis表名
const { TOKENS_USER, USERS_TOKEN } = dbRedis;
const { RET_OK } = ERRCODE;
//大厅服错误码
const { TOKEN_TIMEOUT, NO_USER, FILE_TOO_BIG, NO_FILE_TYPE } = ERRCODE.HALL_ERRS;
//系统错误码
const { INVALID_PARAMETER } = ERRCODE.SYS_ERRS;

let account_userid = '88888888'

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



        async goodDetailPost(req, res) {

            let { or_data, good_id, detail } = req.body;

            try {
                or_data = JSON.parse(or_data)
                detail = JSON.parse(detail)
            } catch (err) {

            }

            let userid = account_userid;
            let filePath = [];
            var data = null;

            if (req.files.files) {
                data = req.files.files
            }

            if (data) {
                console.log(data)
                let checkFile = this.checkFile(req.files.files);

                switch (checkFile) {
                    case -1: return http.send(res, FILE_TOO_BIG);
                    case -2: return http.send(res, NO_FILE_TYPE);
                }

                for (let key in data) {
                    let fileObj = data[key];
                    let f_path = await this.saveFile(userid, fileObj);
                    filePath.push(f_path);
                }
                console.log(`用户$${userid} 上传文件`, filePath)

            }
            console.log(or_data)
            let picture_details = or_data.concat(filePath)
            let new_data = { ...detail, picture_details: '' + picture_details, good_id, userid: userid, good_name: detail.name }

            console.log(new_data)
            if (!good_id) {
                await db.add_good(new_data)
            } else {
                await db.update_good(new_data)

            }

            //检测文件大小

            http.send(res, RET_OK);
        }

        async image_upload(req, res) {
            if (!req.files || !req.files.file) {
                http.send(res, NO_FILE_TYPE);
                return
            }
            let userid = account_userid;

            let checkFile = this.checkFile(req.files);
            switch (checkFile) {
                case -1: return http.send(res, FILE_TOO_BIG);
                case -2: return http.send(res, NO_FILE_TYPE);
            }
            let f_path = await this.saveFile(userid, req.files.file);
            //检测文件大小
            console.log(f_path)
            http.send(res, RET_OK, { data: f_path });
        }

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
            //复制文件流


            let result1 = await this.oss_put(fileObj.path, saveFilePath + filename)

            let result = fs.createReadStream(fileObj.path).pipe(fs.createWriteStream(targetPath));

            return result1.url;

        }
        //校验文件
        checkFile(fileObjs) {

            for (let key in fileObjs) {
                let fileObj = fileObjs[key];
                let fileTypeName = fileObj.type.split('/')[0];
                let fileSizeLimit = app.uploadFileSizeLimit[fileTypeName];
                if (fileObj.size > fileSizeLimit) {
                    return -1;
                }
                if (!this.fileTypeLimit[fileTypeName]) {
                    return -2;
                }

            }

            return true;
        }




        async  putStream(file, name) {
            try {
                // use 'chunked encoding'
                let stream = fs.createReadStream(file);
                let result = await oss_client.putStream(name, stream);
                console.log(result);
                return result;
            } catch (e) {
                console.log(e)
                return false;
            }
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
        async bucketACL(req, res, next) {
            try {
                let result1 = await oss_client.getBucketACL('qunjielong');
                console.log(result1.acl);
                let result2 = await oss_client.putBucketACL('qunjielong', 'public-read');
                console.log(result2);

            } catch (e) {
                console.log(e);
            }
            res.json({ code: 200 });
        }

        async delete_img(req, res, next) {
            try {
                let result1 = await oss_client.delete('1553924856987.png');
                console.log(result1);

            } catch (e) {
                console.log(e);
            }
            res.json({ code: 200 });
        }

        // app.get('/bucketACL',  );

        // app.get('/delete_img',  );








    }

    return httpController;
};
