
const os = require("os");

/* ！！！项目IP地址清单 ---换服务器配置的时候，下列IP地址不用改！！！ */
const IP_LIST = {
	QUNJIELONG:{ 
		IP:[ 
			"47.96.43.115",
			"47.97.32.55",
		],	
		domain:function(){ return "www.csxtech.com.cn" },	
		name:"qunjielong" 
	},		
	LOCAL:{ 
		IP:[ "127.0.0.1" ],		
		domain:function(){ return this.IP[0] },	
		name:"local" 
	},		

}

let localServerAddrfess = []
let { eth0 , eth1 } = os.networkInterfaces();
eth1?localServerAddrfess.push(eth1[0].address):null;
eth0?localServerAddrfess.push(eth0[0].address):null;

console.log(`本机地址`,localServerAddrfess);

//统一处理打印信息
let a = console.log
console.log = (e)=>{
    a(`进程号：${process.pid}=>`,e)
}

//本服务器配置
var SERVER_CONF = {};
for(let key in IP_LIST){
	server = IP_LIST[key]
	for(let i=0;i<server.IP.length;i++){
		let findAddress = localServerAddrfess.find(e => e === server.IP[i] );
		if(findAddress){
			SERVER_CONF = { ...server, LOCAL_IP:findAddress };
		}
	}

}
if(!SERVER_CONF.IP){
	SERVER_CONF = { ...IP_LIST["LOCAL"], LOCAL_IP:"127.0.0.1" };
}

console.error(`本服务器配置为`)
console.error(SERVER_CONF)
exports.SERVER_CONF = SERVER_CONF;


let { account_server,hall_server,game_server, database } = require(`./server_conf/${SERVER_CONF.name}`)

//账号服基础配置
const ACCOUNT_SERVER = {
	SERVER_CONF,
	HTTP_PORT:9000,
	// HALL_IP:HALL_IP,
	// HALL_CLIENT_PORT:HALL_CLIENT_PORT,
	// ACCOUNT_PRI_KEY:ACCOUNT_PRI_KEY,
	// DEALDER_API_IP:LOCAL_IP,
	DEALDER_API_PORT:12581,
	//redis数据库
	redisDb:1,
};
//大厅服基础配置
const HALL_SERVER = {
	SERVER_CONF,
	HALL_IP:SERVER_CONF.LOCAL_IP,
	HALL_CLIENT_PORT:9001,

	HTTP_PORT:9001,
	//redis数据库
	redisDb:1,
}
//游戏服基础配置
const GAME_SERVER = { 
	SERVER_CONF,

	//暴露给大厅服的HTTP端口号
	HTTP_PORT:9003,
	//大厅服IP

	//暴露给客户端的接口
	CLIENT_PORT:10000,

}

//微信机器人服基础配置
const ROBOT_SERVER = { 
	SERVER_CONF,

	//暴露给大厅服的HTTP端口号
	HTTP_PORT:9004,
	//大厅服IP

	redisDb:1,

}


//账号服添加配置
Object.assign(ACCOUNT_SERVER,account_server);
//大厅服添加配置
Object.assign(HALL_SERVER,hall_server);
//添加数据库配置
Object.assign(exports,database);

exports.account_server = function(){ return ACCOUNT_SERVER;}
exports.hall_server = function(){ return HALL_SERVER;}
exports.game_server = function(){ return GAME_SERVER;}
exports.robot_server = function(){ return ROBOT_SERVER;}


//HTTP加密key
exports.HTTP_AES_KEY = "hTtp^@AES&*kEy";
//Socket加密key
exports.GAME_AES_KEY = "GaMe;$AES#!KeY";



