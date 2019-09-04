var JPush = require("jpush-sdk")
var { jiguangPush_id,jiguangPush_key }  = require("../configs").hall_server();
var client = JPush.buildClient(jiguangPush_id, jiguangPush_key)

exports.send = function(title,userid,type,to_all){
	if(!title){
		return false
	}
	var aim=null
if(to_all){
		aim = JPush.ALL
}else{
	if(!userid){
		return false
		
	}
	aim = JPush.alias(userid)
}
if(!type){
	var type = 0
}
	client.push().setPlatform('ios', 'android')
		.setAudience(aim)
		.setNotification(title, JPush.ios(title, 'happy', 1, false, { data: { type: type } }), JPush.android(title, null, null, { data: { type: type } }))
		 .setOptions(null, 60,null,true)
		.send(function (err, result) {
			if (err) {

				if (err instanceof JPush.APIConnectionError) {
					console.log(err.message)
					// Response Timeout means your request to the server may have already received,
					// please check whether or not to push
					console.log(err.isResponseTimeout)
				} else if (err instanceof JPush.APIRequestError) {
					console.log(err.message)
				}
				return false
			} else {
				console.log('Sendno: ' + result.sendno)
				console.log('Msg_id: ' + result.msg_id)
				return true;
			}
		})
}




