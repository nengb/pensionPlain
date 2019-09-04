
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
const { INVALID_PARAMETER, INTER_NETWORK_ERROR } = ERRCODE.SYS_ERRS;



/**
 * 
 *  用户商品管理模块
 */

// import db from '../utils/dbsync_hall'
// await db.update_user_info(account, name, headimgurl, sex)
module.exports = app => {
    const controllerUtils = require('../utils')(app)
    class httpController extends controllerUtils {
        constructor() {
            super()

        }

        /**
        * showdoc
        * @catalog 商品管理
        * @title 获取商品分类列表
        * @description 获取商品分类列表接口
        * @method get
        * @url https://xxx:9001/get_goodclass_list
        * @param token 必选 string 用户凭证token  
        * @return {"data":[{"good_class_id":1,"userid":17059767,"class_name":"sdv","create_time":null,"level":1},{"good_class_id":2,"userid":17059767,"class_name":"bbb","create_time":null,"level":2},{"good_class_id":3,"userid":17059767,"class_name":"gg","create_time":null,"level":3},{"good_class_id":4,"userid":17059767,"class_name":"test","create_time":null,"level":4},{"good_class_id":5,"userid":17059767,"class_name":"bebeb","create_time":1556519835292,"level":5}],"errcode":0,"errmsg":"ok"}
        * @return_param class_name string 分类名称
        * @return_param level number 排序
        * @remark 这里是备注信息
        * @number 1
        */
        async get_goodclass_list(req, res) {
            let { token } = req.query;
            let user = req.user;


            let { userid, } = user;


            let getGoodclassList = await db.getGoodclassList({ userid });
            if (!getGoodclassList) {
                getGoodclassList = []
            }
            http.send(res, RET_OK, { data: getGoodclassList });

        }


        /**
       * showdoc
       * @catalog 商品管理
       * @title 添加商品分类
       * @description 添加商品分类接口
       * @method gey
       * @url https://xxx:9001/add_good_class
       * @param token 必选 string 用户凭证token 
       * @param class_name 必选 string 分类名称
       * @return 
       * @remark 这里是备注信息
       * @number 2
       */
        async add_good_class(req, res) {
            let { token, class_name } = req.query;

            if (class_name == null) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let user = req.user;


            let { userid } = user;

            let add_good_class = await db.add_good_class({ userid, class_name })
            if (!add_good_class) {
                http.send(res, OPERATE_FAILED);
                return;
            }

            http.send(res, RET_OK);

        }


        /**
       * showdoc
       * @catalog 商品管理
       * @title 修改商品分类
       * @description 修改商品分类接口
       * @method get
       * @url https://xxx:9001/update_good_class
       * @param token 必选 string 用户凭证token 
       * @param good_class_id 必选 string 分类id
       * @param class_name 必选 string 分类名称
       * @param firstLevel 必选 bool 是否将分类放到最前，传true
       * @return 
       * @remark 这里是备注信息
       * @number 2
       */
        async update_good_class(req, res) {
            let { token, good_class_id, class_name, firstLevel } = req.query;

            if (good_class_id == null || (class_name == null && !firstLevel)) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let user = req.user;


            let { userid } = user;

            let update_good_class = await db.update_good_class({ userid, good_class_id, class_name, firstLevel })
            if (!update_good_class) {
                http.send(res, OPERATE_FAILED);
                return;
            }

            http.send(res, RET_OK);

        }

        /**
       * showdoc
       * @catalog 商品管理
       * @title 删除商品分类
       * @description 删除商品分类接口
       * @method get
       * @url https://xxx:9001/delete_good_class
       * @param token 必选 string 用户凭证token 
       * @param good_class_id 必选 string 分类id
       * @return 
       * @remark 这里是备注信息
       * @number 2
       */
        async delete_good_class(req, res) {
            let { token, good_class_id } = req.query;

            if (good_class_id == null) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let user = await TOKEN.getUserInfo(token);
            if (user == null) {
                http.send(res, TOKEN_TIMEOUT);
                return;
            }
            let { userid } = user;

            let delete_good_class = await db.delete_good_class({ userid, good_class_id })
            if (!delete_good_class) {
                http.send(res, OPERATE_FAILED);
                return;
            }

            http.send(res, RET_OK);

        }



        /**
        * showdoc
        * @catalog 商品管理
        * @title 添加商品
        * @description 添加商品接口
        * @method post
        * @url https://xxx:9001/add_good
        * @param token 必选 string 用户凭证token 
        * @param good_name 必选 string 商品名称
        * @param introduction 必选 string 商品介绍
        * @param picture_details 必选 array 图片详情
        * @param spec 必选 string 商品规格
        * @param price 必选 string 价格
        * @param inventory 必选 string 库存
        * @param class_id 必选 string 分类名称
        * @param after_sale_commitment 必选 string 售后承诺
        * @return 
        * @remark 这里是备注信息
        * @number 2
        */
        async add_good(req, res) {
            let { token } = req.query;
            let { good_name, introduction, picture_details, spec, price, inventory, class_id, after_sale_commitment } = req.body;


            let user = req.user;


            let { userid } = user;

            let add_good = await db.add_good({ userid, good_name, introduction, picture_details, spec, price, inventory, class_id, after_sale_commitment })
            if (!add_good) {
                http.send(res, OPERATE_FAILED);
                return;
            }

            http.send(res, RET_OK);

        }


        /**
        * showdoc
        * @catalog 商品管理
        * @title 修改商品
        * @description 修改商品接口
        * @method post
        * @url https://xxx:9001/update_good
        * @param token 必选 string 用户凭证token 
        * @param good_id 必选 string 商品id
        * @param good_name 必选 string 商品名称
        * @param introduction 必选 string 商品介绍
        * @param picture_details 必选 array 图片详情
        * @param spec 必选 string 商品规格
        * @param price 必选 string 价格
        * @param inventory 必选 string 库存
        * @param class_id 必选 string 分类名称
        * @param after_sale_commitment 必选 string 售后承诺
        * @return 
        * @remark 这里是备注信息
        * @number 2
        */
        async update_good(req, res) {
            let { token } = req.query;
            let { good_id, good_name, introduction, picture_details, spec, price, inventory, class_id, after_sale_commitment } = req.body;

            let user = req.user;


            let { userid } = user;

            let update_good = await db.update_good({ userid, good_id, good_name, introduction, picture_details, spec, price, inventory, class_id, after_sale_commitment })
            if (!update_good) {
                http.send(res, OPERATE_FAILED);
                return;
            }

            http.send(res, RET_OK);

        }


        /**
       * showdoc
       * @catalog 商品管理
       * @title 删除商品
       * @description 删除商品接口
       * @method get
       * @url https://xxx:9001/delete_good
       * @param token 必选 string 用户凭证token 
       * @param good_id 必选 string 商品id
       * @return 
       * @remark 这里是备注信息
       * @number 2
       */
        async delete_good(req, res) {
            let { token, good_id } = req.query;

            if (good_id == null) {
                http.send(res, INVALID_PARAMETER);
                return;
            }

            let user = req.user;


            let { userid } = user;

            let delete_good = await db.delete_good({ userid, good_id })
            if (!delete_good) {
                http.send(res, OPERATE_FAILED);
                return;
            }

            http.send(res, RET_OK);

        }



        /**
        * showdoc
        * @catalog 商品管理
        * @title 获取商品列表
        * @description 获取商品列表接口
        * @method get
        * @url https://xxx:9001/get_good_list
        * @param token 必选 string 用户凭证token  
        * @param class_id 必选 string 分类id  
        * @param name 可选 string 商品名称  
        * @return {"data":[{"good_id":5,"userid":17059767,"class_id":null,"name":"商品2","price":24,"inventory":100,"spec":null,"introduction":"号商铺","after_sale_commitment":null,"picture_details":null,"create_time":1556594445368},{"good_id":4,"userid":17059767,"class_id":null,"name":"商品1","price":24,"inventory":100,"spec":null,"introduction":"号商铺","after_sale_commitment":null,"picture_details":null,"create_time":1556594425550},{"good_id":3,"userid":17059767,"class_id":null,"name":"商品1","price":24,"inventory":100,"spec":null,"introduction":"号商铺","after_sale_commitment":null,"picture_details":null,"create_time":1556594401735},{"good_id":2,"userid":17059767,"class_id":null,"name":"商品1","price":24,"inventory":100,"spec":null,"introduction":"号商铺","after_sale_commitment":null,"picture_details":null,"create_time":1556594389536},{"good_id":1,"userid":17059767,"class_id":null,"name":null,"price":null,"inventory":null,"spec":null,"introduction":null,"after_sale_commitment":null,"picture_details":null,"create_time":1556594230103}],"errcode":0,"errmsg":"ok"}
        * 
        * @return_param name 必选 string 商品名称
        * @return_param introduction 必选 string 商品介绍
        * @return_param picture_details 必选 array 图片详情
        * @return_param spec 必选 string 商品规格
        * @return_param price 必选 string 价格
        * @return_param inventory 必选 string 库存
        * @return_param class_id 必选 string 分类名称
        * @return_param after_sale_commitment 必选 string 售后承诺
        * @remark 这里是备注信息
        * @number 1
        */
        async get_good_list(req, res) {
            let { token, class_id, name } = req.query;
            let user = req.user;


            let { userid, } = user;

            let get_good_list = await db.get_good_list({ userid, class_id, name });
            if (!get_good_list) {
                get_good_list = []
            }
            http.send(res, RET_OK, { data: get_good_list });

        }
        /**
           * showdoc
           * @catalog 商品管理
           * @title 获取历史商品列表
           * @description 获取商品列表接口
           * @method get
           * @url https://xxx:9001/get_history_good_list
           * @param token 必选 string 用户凭证token  
           * @param name 可选 string 商品名称  
           * @param page 可选 string 分页 不传默认给第一页  
           * @return {"data":[{"group_way_id":49,"active_id":32,"url":"[]","name":"33","size":"呃呃呃","price":0.01,"stock":5,"good_class_id":0,"desc":"","ensure":"","join_num":0,"class_name":null},{"group_way_id":80,"active_id":49,"url":"[]","name":"111121","size":"1212","price":10,"stock":100,"good_class_id":0,"desc":"","ensure":"","join_num":12,"class_name":null},{"group_way_id":169,"active_id":157,"url":"[]","name":"","size":"","price":0,"stock":0,"good_class_id":0,"desc":"","ensure":"","join_num":0,"class_name":null},{"group_way_id":178,"active_id":160,"url":"[]","name":"芒果","size":"一斤","price":15,"stock":50,"good_class_id":0,"desc":"","ensure":"","join_num":0,"class_name":null},{"group_way_id":209,"active_id":164,"url":"[]","name":"测试","size":"1块","price":1,"stock":10,"good_class_id":0,"desc":"","ensure":"","join_num":2,"class_name":null},{"group_way_id":319,"active_id":242,"url":"\"[]\"","name":"毛绒单肩包","size":"灰色","price":7,"stock":50,"good_class_id":0,"desc":"毛绒单肩包 灰色","ensure":"#","join_num":0,"class_name":null},{"group_way_id":320,"active_id":243,"url":"\"[\\\"http://www.csxtech.com.cn/userActiveFile/88888888/image/2019517/tmp_ba89e074099b0a61cb3d9359f920a7ba.jpg\\\"]\"","name":"测试商品","size":"个","price":0.1,"stock":0,"good_class_id":0,"desc":"11","ensure":"测试商品，不发货","join_num":0,"class_name":null},{"group_way_id":330,"active_id":255,"url":"[]","name":"5648","size":"4564","price":1,"stock":100,"good_class_id":0,"desc":"","ensure":"","join_num":6,"class_name":null},{"group_way_id":360,"active_id":280,"url":"[]","name":"哦哦哦","size":"","price":0,"stock":1,"good_class_id":0,"desc":"","ensure":"","join_num":0,"class_name":null}],"errcode":0,"errmsg":"ok"}
           * 
           * @return_param name 必选 string 商品名称
           * @return_param desc 必选 string 商品介绍
           * @return_param url 必选 array 图片详情
           * @return_param size 必选 string 商品规格
           * @return_param price 必选 string 价格
           * @return_param stock 必选 string 库存
           * @return_param good_class_id 必选 int 分类ID
           * @return_param class_name 必选 string 分类名称
           * @return_param ensure 必选 string 售后承诺
           * @remark 这里是备注信息
           * @number 1
           */
        async get_history_good_list(req, res) {
            let { token, page, name } = req.query;
            let user = req.user;


            let { userid, } = user;
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

            let get_history_good_list = await db.get_history_good_list({ userid, name,start,rows });
            if (!get_history_good_list) {
                get_history_good_list = []
            }
            http.send(res, RET_OK, { data: get_history_good_list });

        }







    }

    return httpController;
};
