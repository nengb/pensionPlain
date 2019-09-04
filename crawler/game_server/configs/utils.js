const { SERVER_CONF } = require('../../configs');
const PROJECT = SERVER_CONF.name;
//判断是否在该项目
function hasProject(regexp){
    return regexp.test(PROJECT)
}
//是否是试抓测试人员
function checkTestPlayUser(user){
	return  (user.sex == 5 && ( !hasProject(/aiqu/) || ( hasProject(/aiqu/) && user.userid != 615628 )) );
}

//获取某个范围随机数[0,99],包括两边
function getRandom(min, max){
	max++;
	var r = Math.random() * (max - min);
	var re = Math.floor(r + min);
	re = Math.max(Math.min(re, max), min);
	return re;
}
//二进制数组转换成数组
function changeArr(bufferArr){
	var arr= [];
	bufferArr.forEach(e => {
		arr.push(e);
	});
	return arr;
}
//定时任务
async function dealTask( time ,task ){
	console.log(`设置了一个定时任务 time ${time}`)
	function getHMSTIme(time){
		let hours = parseInt(`${time/(1000 * 60 * 60)}`);
		let minutes = parseInt(`${time/(1000 * 60)}`);
		let seconds = parseInt(`${time/1000}`);
		return { hours, minutes, seconds };
	}
	function getDateTime(time){
		let date = new Date(time);
		let day = date.getDay();
		let hours = date.getHours();
		let minutes = date.getMinutes();
		let seconds = date.getSeconds();
		return { day,hours, minutes, seconds };
	}

	let { hours, minutes, seconds } =  getHMSTIme(time);
	console.log(` hours${hours} minutes${minutes} seconds${seconds}`)
	let nowTime = new Date().getTime();
	let { hours:nowHours, minutes:nowMinutes, seconds:nowSeconds } =  getDateTime(nowTime);

	console.log(` nowHours${nowHours} nowMinutes${nowMinutes} nowSeconds${nowSeconds}`)

	let today = new Date();
	let setHours = hours == 0?nowHours:0;
	let setMinutes = minutes == 0 ?nowMinutes:0;
	let setSeconds = seconds == 0 ?nowSeconds:0;
	today.setHours(setHours);
	today.setMinutes(setMinutes);
	today.setSeconds(setSeconds);
	

	let todayTime = today.getTime(); //获取今天凌晨时间戳

	let nextTime = todayTime + time; 
	
	while(nextTime<=nowTime){
		// console.log(nextTime)
		nextTime = nextTime + time;
	}

	console.log(`定位到的 nextTime ${today.getTime()} setHours${setHours} setMinutes${setMinutes} setSeconds${setSeconds}`)
	console.log("现在的时间是")
	console.log(getDateTime(nowTime))
	console.log("到下次执行任务的时间戳：" + nextTime);
	console.log( getDateTime(nextTime))
	
	let subTime = nextTime - nowTime;
	console.log("现在到下次执行任务的毫秒差：" + subTime)

	if(subTime>=0){
		console.log(`等待时间执行${subTime}`)
		await  sleep(subTime);
		task()
	}
	setInterval(()=>{
		task()
	},time)
}

module.exports = { 
    PROJECT, hasProject, checkTestPlayUser, getRandom, changeArr, dealTask }
