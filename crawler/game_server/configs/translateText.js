const { hasProject } = require('./utils')
//语言翻译
const translateText = {
	玩家不存在:{
		cn:"该玩家不存在",
		Thailand:"ไม่มีสมาฃิกหมายเลขนี้",
		twhf:"該玩家不存在",
		ina:"The player does not exist",
	},
	
	机器故障:{
		cn:"该机器发生故障，管理员正在抢修！",
		Thailand:"เครื่องขัดข้อง เจ้าหน้าที่กำลังซ่อมแซม",
		twhf:"該機器發生故障，管理員正在搶修！",
		ina:"Machine Failure,Please try again later.",
	},
	矿机挖坏:{
		cn:"抱歉！该矿机被挖坏了，管理员正在抢修！",
		Thailand:"เครื่องขัดข้อง เจ้าหน้าที่กำลังซ่อมแซม",
		twhf:"抱歉！該礦機被挖壞了，管理員正在搶修！",
		ina:"I'm sorry! The miner was excavated and the administrator is repairing it.",
	},
	抓到娃娃:{
		cn:"抓到娃娃",
		Thailand:"ยินดีด้วย คุณ คีบได้แล้ว ",
		twhf:"抓到娃娃",
		ina:"Catch the doll",
	},
	没抓到娃娃:{
		cn:"好气！没有抓到娃娃~",
		Thailand:"เสียดาย พลาดไปนิดเดียว",
		twhf:"好氣！沒有抓到娃娃~",
		ina:"Good breath! I didn't catch the doll.",
	},
	挖到娃娃币:{
		cn:"挖到娃娃币",
		Thailand:"คีบสำเร็จแล้ว !",
		twhf:"挖到娃娃點",
		ina:"Dig doll coins",
	},
	挖矿失败:{
		cn:"好气！挖矿失败~",
		Thailand:"น่าเสียดาย คีบไม่สำเร็จ",
		twhf:"好氣！挖礦失敗~",
		ina:"Good breath! Failure of mining",
	},
	弹幕含敏感词语:{
		cn:"尊敬的玩家，您又调皮了~",
		Thailand:"ข้อความมีคำไม่เหมาะสม",
		twhf:"尊敬的玩家，您又調皮了~",
		ina:"Respected player, you are naughty again.",
	},
	被禁言:{
		cn:"尊敬的玩家，您过于调皮，已被禁言~",
		Thailand:"คุณถูกจำกัดสิทธิ์การแสดงข้อความ",
		twhf:"尊敬的玩家，您過於調皮，已被禁言~",
		ina:"Respected players, you are too naughty, have been banned.",
	},
	留言过长:{
		cn:"留言太长啦，宝宝记不住~",
		Thailand:"ข้อความยาวเกินไป",
		twhf:"留言太長啦，寶寶記不住~",
		ina:"The message is too long for the baby to remember.",
	},
	留言过于频繁:{
		cn:"留言太快啦，宝宝记不住~",
		Thailand:"留言太快啦，宝宝记不住~",
		twhf:"留言太快啦，寶寶記不住",
		ina:"The message is too fast for the baby to remember.",
	},
	娃娃币不足:{
		cn:"娃娃币不足！",
		Thailand:"จำนวนเหรียญที่เหลือไม่เพียงพอสำหรับการเล่น",
		twhf:"娃娃點不足！",
		ina:"Doll money is not enough!",
	},
	进来了:{
		cn:"进来了",
		Thailand:"เข้าสู่เกม",
		twhf:"進來了",
		ina:"Come in",
	},
	离开了房间:{
		cn:"离开了房间",
		Thailand:"ออกจากเกม",
		twhf:"離開了房間",
		ina:"Left the room.",
	},
	开局失败:{
		cn:"开局失败,机器处于繁忙状态~",
		Thailand:"ตู้ไม่ว่าง",
		twhf:"開局失敗,機器處於繁忙狀態~",
		ina:"Start failure, machine is busy.",
	},
	保夹值提示:{
		cn:"保夹值满，即可获得一只娃娃",
		Thailand:"保夹值满，即可获得一只娃娃",
		twhf:"保夾值滿，即可獲得壹只娃娃",
		ina:"You can get a doll if the clip is full.",
	},
	挖币满了(gift_coins,country){
		let text ='';
		switch(country){
			case "cn" 		:	text = `挖币已满${gift_coins},任务结束~`;break;
			case "Thailand" :	text = `挖币已满${gift_coins},任务结束~`;break;
			case "twhf" 	:	text = `挖幣已滿${gift_coins},任務結束~`;break;
			case "ina" 	:		text = `The money has been dug ${gift_coins}.`;break;
		}
		return text;
	},
	游戏中(mac_no,country){
		let text ='';
		switch(country){
			case "cn" 		:	text = `您在${mac_no}房间处于游戏中`;break;
			case "Thailand" :	text = `กำลังเล่นตู้หมายเลข ${mac_no} `;break;
			case "twhf" 	:	text = `您在${mac_no}房間處於遊戲中`;break;
			case "ina" 	:	text = `You are in the ${mac_no} room in the game`;break;
		}
		return text;

	},
	故障退币(coins,country){
		let text ='';
		switch(country){
			case "cn" 		:	text = `抱歉！该机器发生故障，退还您${coins}个娃娃币`;break;
			case "Thailand" :	text = `เครื่องขัดข้อง คุณได้รับเหรียญคืน ${coins} เหรียญ`;break;
			case "twhf" 	:	text = `抱歉！該機器發生故障，退還您${coins}個娃娃幣`;break;
			case "ina" 	:		text = `I'm sorry! The machine fails and returns ${coins} dolls.`;break;
		}
		return text;
	},
	挖到多少币(coins,country){
		let text ='';
		switch(country){
			case "cn" 		:	text = hasProject(/aiqu/)?'抓娃娃练习成功':`挖到${coins}个娃娃币`;break;
			case "Thailand" :	text = `ยินดีด้วย  คุณ ${coins} คีบได้แล้ว`;break;
			case "twhf" 	:	text = `挖到${coins}個娃娃幣`;break;
			case "ina" 	:	text = `Dig up ${coins} doll coins.`;break;
		}
		return text;
	},
	没有抓到某个娃娃(wawa_name,country){
		let text ='';
		switch(country){
			case "cn" 		:	text = `好气！没有抓到${wawa_name}~`;break;
			case "Thailand" :	text = `เสียดาย พลาดไปนิดเดียว`;break;
			case "twhf" 	:	text = `好氣！沒有抓到${wawa_name}~`;break;
			case "ina" 	:		text = `Good breath! Did not catch ${wawa_name}~`;break;
		}
		return text;
	},
	获得多少积分(score,country){
		let text ='';
		switch(country){
			case "cn" 		:	text = score>0?`太棒了！总共获得${score}积分          `:`很遗憾，获得0积分~`;break;
			case "Thailand" :	text = score>0?`太棒了！总共获得${score}积分          `:`很遗憾，获得0积分~`;break;
			case "twhf" 	:	text = score>0?`太棒了！總共獲得${score}積分          `:`很遺憾，獲得0積分~`;break;
			case "ina" 	:		text = score>0?`That is great! Total ${score} score is obtained.          `:`I'm sorry to get 0 points.`;break;
		}
		return text;
	},
	获得多少币(coins,country){
		let text ='';
		switch(country){
			case "cn" 		:	text = coins>0?`太棒了！获得${coins}币          `:`很遗憾，获得0币~`;break;
			case "Thailand" :	text = coins>0?`太棒了！获得${coins}币          `:`很遗憾，获得0币~`;break;
			case "twhf" 	:	text = coins>0?`太棒了！獲得${coins}幣          `:`很遺憾，獲得0幣~`;break;
			case "ina" 	:		text = coins>0?`That is great! Get ${coins} coins          `:`I'm sorry to get 0 coins.`;break;
		}
		return text;
	},
	
	赠送某个娃娃(wawa_name,country){
		let text ='';
		switch(country){
			case "cn" 		:	text = `保夹值已满送您一个${wawa_name}~`;break;
			case "Thailand" :	text = `保夹值已满送您一个${wawa_name}~`;break;
			case "twhf" 	:	text = `保夾值已滿送你一個${wawa_name}~`;break;
			case "ina" 	:	text = `The clipping value is full to send you a ${wawa_name}~.`;break;
		}
		return text;
	},
	
}

module.exports = { translateText }
