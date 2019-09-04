//机器各种状态
const MACSTATE = {
    INGAME:1,                                   //游戏中
    NORMAL:0,                                   //机器正常上架
    UNDERCARRIAGE:-1,                           //未上架
    POWEROFF:-2,                                //断电或断网
    SERVERRESTART:-3,                           //服务器重启
	LOWERNETWORK :-5,                           //网络不稳定

    FAULT_1:-101,                            //'上下电机故障或者天车未接或者上升微动故障';     
    FAULT_3:-103,                            //'左右移动电机故障';      		 
    FAULT_4:-104,                            //'前后移动电机故障或者后移微动故障';
    FAULT_5:-105,                            //'下降微动损坏或者上下电机故障'; 	
    FAULT_6:-106,                            //'上升微动故障'; 	
    FAULT_7:-107,                            //'左移微动故障'; 
    FAULT_8:-108,                            //'前后移动电机故障或者前移'; 
    FAULT_9:-109,                            //'检测礼品的光眼堵住了'; 
	FAULT_11:-111,                           //'下线长度太长'; 
 
    CHECKONE:-300,                              //上架自检第一次中
    CHECKTWO:-301,                              //上架自检第二次中
    CHECKTHREE:-302,                            //上架自检第三次中
    CHECKFAIL:-399,                             //上架自检失败
    CHECKFAILDOWNLINE:-411,                     //上架失败码+故障码后两位（如-411，检查到下线长度太长）
	PROBABILITYABNORMAL:-500,                   //概率异常
	NOCARDS:-600,								//虚拟卡不足

	UNKNOWN_FAULT:-209,						//机器未知故障
}

module.exports = { MACSTATE }
