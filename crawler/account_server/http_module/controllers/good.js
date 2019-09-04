
const  db = require('../../../utils/dbsync_account');
const  db_hall = require('../../../utils/dbsync_hall');
const  crypto = require('../../../utils/crypto');
const  http = require('../../../utils/http');
const  configs = require('../../../configs.js');
const path = require('path');
const fs = require('fs');
const ERRCODE = require('../../../utils/errcode.js');
//redis表名
const { RET_OK } = ERRCODE;
//大厅服错误码
const { TOKEN_TIMEOUT, NO_USER,MONEY_NO_ENOUGH, OPERATE_FAILED ,STOCK_NO_ENOUGH,ORDER_HAS_HANDLE} = ERRCODE.HALL_ERRS;
//系统错误码
const { INVALID_PARAMETER, INTER_NETWORK_ERROR } = ERRCODE.SYS_ERRS;

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
async  get_good_list(req, res) {
	console.log(req.query)
	var start = req.query.start;
	var rows = req.query.rows;
	var name = req.query.name;
	var good_id = req.query.good_id;
	var start_time = req.query.start_time;
	var end_time = req.query.end_time;
	var order_start = req.query.order_start;
	var order_end = req.query.order_end;
	var history = req.query.history;
	var agent = req.query.agent;
	var field = req.query.field;
	var order = req.query.order;
	var state = req.query.state;
	var good_no = req.query.good_no;
	var isOnline = req.query.isOnline;
	var jd_no = req.query.jd_no;
	var low_price= req.query.low_price;
	var high_price= req.query.high_price;

	var suc = await db.get_good_list(start, rows, name, start_time, end_time, order_start, order_end, history,good_id,agent,field,order,state,good_no,isOnline,jd_no,low_price,high_price);

	if (suc !== null) {
		http.send(res, RET_OK,  {data:suc});
	}
	else {
		http.send(res, RET_OK, {data:[]});
	}
}
async  get_good_class(req, res) {
	var start = req.query.start;
	var rows = req.query.rows;
	if (start == null) {
		http.send(res, -1, "failed");
		return;
	}
	if (rows == null) {
		http.send(res, -1, "failed");
		return;
	}
	var suc = await db.get_good_class(start,rows);

	if (suc !== null) {
		http.send(res, RET_OK,  {data:suc});
	}
	else {
		http.send(res, RET_OK, {data:[]});
	}
}

async  add_good_class(req, res) {
	var level = req.query.level;
	var name = req.query.class_name;

	var suc = await db.add_good_class(name,level);

	if (suc !== null) {
		http.send(res, RET_OK,  {data:suc});
	}
	else {
		http.send(res, RET_OK, {data:[]});
	}
}

async  update_good_class(req, res) {
	var id = req.query.good_class_id;
	var level = req.query.level;
	var name = req.query.class_name;

	var suc = await db.update_good_class(id,name,level);

	if (suc !== null) {
		http.send(res, RET_OK,  {data:suc});
	}
	else {
		http.send(res, RET_OK, {data:[]});
	}
}
async  delete_good_class(req, res) {
	var id = req.query.good_class_id;
	var suc = await db.update_good_class(id);
	if (suc !== null) {
		http.send(res, RET_OK,  {data:suc});
	}
	else {
		http.send(res, RET_OK, {data:[]});
	}
}

async  add_good(req, res) {
            let {  good_name, introduction, picture_details, spec,  price, inventory, class_id, after_sale_commitment } = req.query



	var suc = await db_hall.add_good(name, img, msg, price,type, spec,com_id,display_price,sale_price,inventory,
	split_ord,change_coins,fictitious ,good_level,good_url,good_no,isOnline,all_inventory,jd_no);
	if (suc) {

		http.send(res, 0, "ok");
	}
	else {
		http.send(res, 1, "failed");
	}
}

async  update_good(req, res) {
	var name = req.query.name;
	var img = req.query.img;
	var msg = req.query.msg;
	var price = req.query.price;
	var weight = req.query.weight;
	var id = req.query.good_id;
	var spec = req.query.spec;
	var com_id = req.query.com_id;
	var display_price = req.query.display_price;
	var sale_price = req.query.sale_price;
	var inventory = req.query.inventory;
	var split_ord = req.query.split_ord;
	var change_coins = req.query.change_coins;
	var fictitious = req.query.fictitious;
	var good_level = req.query.good_level;
	var class_list = req.query.class_list;
	var good_url = req.query.good_url;
		var good_no = req.query.good_no;
		var isOnline = req.query.isOnline;
		var all_inventory = req.query.all_inventory;
	var jd_no = req.query.jd_no;
	if(!jd_no){
	jd_no=''
	}
			if(!all_inventory){
	all_inventory=0
}
	if(!isOnline){
	isOnline=0
}
	if(!good_no){
	good_no=''
}
		if(!name){

		http.send(res, 1, "failed");
		return;
	}
if(!good_url){
	good_url=''
}
		if (!good_level) {
		good_level = 0
	}
   if(!display_price){
	display_price = 0
}	
if(!sale_price){
	sale_price = 0
}
if(!inventory){
	inventory = -1
}
if(!split_ord){
	split_ord = 1
	
}
	if (!fictitious) {
		fictitious = 0
	}
		if(jd_no){
			var check =await db.get_good_data_by_jd_no(jd_no)
			var good_data =await db.get_good_data(id)
			if(check&&check.good_id!=id&&check.type==good_data.type){
			http.send(res, 1, "已经有该京东号商品了",{data:"已经有该京东号商品了"});
				return ;
			}
	}
	var suc = await db.update_good(id, name, img, msg, price, com_id,spec,display_price,sale_price,inventory,
	split_ord ,change_coins,fictitious,good_level,good_url,good_no,isOnline,all_inventory,jd_no);
	if (suc) {
			if(class_list){
	setTimeout(async function() {
				await db.update_score_good_class(id,class_list)
		}, 0);
	}
	if(jd_no){
		setTimeout(async function() {
						var data = {
		token:await get_jd_token(),
		sku:jd_no
	}
	
	var result = await http.postSync('bizapi.jd.com',80,'/api/price/getSellPrice',data)
		// console.log(result.data)
	if(result.data&&result.data.success&&result.data.result.length>0){
		var new_price = result.data.result[0].price
		await db.update_jd_good_from_good(id,new_price)
	}
		}, 0);
}
		http.send(res, 0, "ok");
	}	
	else {
		http.send(res, 1, "failed");
	}
}


async  post_mock(req, res) {


    res.json({id:Date.now()})
}
async  goodDetailPost(req, res) {
    var  data = null;
    if (req.files.files) {
       var data = req.files.files
    }


        console.log(data)
    res.json({id:Date.now()})
}
 
/////////////////////////////
    }

    return httpController;
};
