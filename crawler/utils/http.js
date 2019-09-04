var http = require('http');
var https = require('https');
var qs = require('querystring');
var fs = require('fs');
var request = require('request');

// var fibers = require('fibers');
var crypto = require('./crypto');
const dbRedis = require('./db_redis_hall');
const redis = require('./redis');

const { API_LOG } = dbRedis;

var API_DATA = {};


function getClientIp(req) {
	var ip = req.ip;
	try {
		ip = ip.replace('::ffff:', '');
	} catch (error) {
	}
	return ip
}

//缓存接口数据

function saveAPI_DATA(res,data){
	let url = res.req.originalUrl;
	if(res.req.method != "GET"){
		return;
	}

	API_DATA[url] = {
		data,
		time:Date.now(),
	};
	
}
//存储接口日志
function saveAPI_LOG(res,jsonstr){

	try {
		let { start_time, user, body, query,method } = res.req;
		let { pathname } = res.req._parsedUrl;
		let user_agent = res.req.headers['user-agent'];
		try {
			body = JSON.stringify(body)
			query = JSON.stringify(query)
		} catch (error) {
		}
		let ip = getClientIp(res.req)
		let userid = user ? user.userid:null

		let end_time = Date.now();
		let delay_time = end_time-start_time;
		try {
			jsonstr = jsonstr && jsonstr.length<500?jsonstr :jsonstr.length
		} catch (error) {
		}
		let data = {
			method,
			query,
			body,
			start_time,
			end_time,
			delay_time,
			userid,
			pathname,
			user_agent,
			ip,
			sendData:jsonstr
		}
		redis.rpush(API_LOG,data)

	} catch (error) {
		console.error(error)
	}

}


exports.getApiData = function (res){
	let url = res.req.originalUrl
	if(API_DATA[url] && API_DATA[url].data && Date.now() - API_DATA[url].time <3000){
		// console.log(`使用缓存数据`);
		res.send(API_DATA[url].data);
		return API_DATA[url].data;
	}else{
		return null;
	}
	
}


String.prototype.format = function (args) {
	var result = this;
	if (arguments.length > 0) {
		if (arguments.length == 1 && typeof (args) == "object") {
			for (var key in args) {
				if (args[key] != undefined) {
					var reg = new RegExp("({" + key + "})", "g");
					result = result.replace(reg, args[key]);
				}
			}
		}
		else {
			for (var i = 0; i < arguments.length; i++) {
				if (arguments[i] != undefined) {
					//var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题，谢谢何以笙箫的指出
					var reg = new RegExp("({)" + i + "(})", "g");
					result = result.replace(reg, arguments[i]);
				}
			}
		}
	}
	return result;
};

exports.getSync = function (url, data, safe, encoding) {
	if (data) {
		var content = qs.stringify(data);
		var url = url + '?' + content;
	}

	var proto = http;
	if (safe) {
		proto = https;
	}

	if (!encoding) {
		encoding = 'utf8';
	}

	var ret = {
		err: null,
		data: null,
	};

	return new Promise((resolve, reject) => {
		var req = proto.get(url, function (res) {
			//console.log('STATUS: ' + res.statusCode);  
			//console.log('HEADERS: ' + JSON.stringify(res.headers));  
			res.setEncoding(encoding);
			var body = '';

			ret.type = res.headers["content-type"];
			res.on('data', function (chunk) {
				body += chunk;

			});
			res.on('end', function () {
				if (encoding != 'binary') {
					try {
						ret.data = JSON.parse(body);
					} catch (e) {
						console.log('JSON parse error: ' + e + ', url: ' + url);
					}
					resolve(ret);

				}
				else {
					ret.data = body;
					resolve(ret);
				}
			});
			req.on('error', function (e) {
				console.log('problem with request3: ' + e.message);
				console.log(e)
				ret.err = e;
				reject(ret);

			});

			req.end();
		});
	})
};


var xml2js = require('xml2js');


exports.postXML = function (url, data, callback, safe) {
	var str = `<xml>`
	for (var key in data) {
		str += `<${key}>${data[key]}</${key}>`
	}
	str += '</xml>'
	console.log(str)
	var b = new xml2js.Builder();
	var parser = new xml2js.Parser();
	var xml = str;
	var parseString = xml2js.parseString;
	request(
		{
			url: url,
			method: 'POST',
			body: xml
		}, function (err, response, body) {
			if (!err && response.statusCode == 200) {
				console.log("body");
				console.log(body);

				parseString(body, { explicitArray: false }, function (err, result) {
					console.log(JSON.stringify(result));
					callback(false, result.xml)
				});
			} else {
				callback(true, null)

			}
		}
	);


};

exports.postXML_Sync = function (url, data) {
	var str = `<xml>`
	for (var key in data) {
		str += `<${key}>${data[key]}</${key}>`
	}
	str += '</xml>'
	console.log(str)
	var b = new xml2js.Builder();
	var parser = new xml2js.Parser();
	var xml = str;
	var parseString = xml2js.parseString;

	var ret = {
		err: null,
		data: null,
	};
	return new Promise((resolve, reject) => {
		request(
			{
				url: url,
				method: 'POST',
				body: xml
			}, function (err, response, body) {
				if (!err && response.statusCode == 200) {
					console.log("body");
					console.log(body);
					parseString(body, { explicitArray: false }, function (err, result) {
						// callback(false, result.xml)
						ret.data = result.xml;
						resolve(ret);
					});
				} else {
					ret.err = err;
					resolve(ret);
				}
			}
		);
	})

};





exports.postXML_TX_Sync = function (url, data, callback, safe) {
	var str = `<xml>`
	for (var key in data) {
		str += `<${key}>${data[key]}</${key}>`
	}
	str += '</xml>'
	var b = new xml2js.Builder();
	var parser = new xml2js.Parser();
	var xml = str;
	var parseString = xml2js.parseString;
	var ret = {
		err: null,
		data: null,
	};
	return new Promise((resolve, reject) => {
	request(
		{
			url: url,
			method: 'POST',
			body: xml,
			key: fs.readFileSync(__dirname + '/apiclient_key.pem'),
			cert: fs.readFileSync(__dirname + '/apiclient_cert.pem')
		}, function (err, response, body) {
			if (!err && response.statusCode == 200) {
				console.log("body");
				console.log(body);

				parseString(body, { explicitArray: false }, function (err, result) {
					console.log(JSON.stringify(result));
						ret.data = result.xml;
						resolve(ret);
				});
			} else {
					ret.err = err;
					resolve(ret);
			}
		}
	);
	})
};
exports.postXML_TX_Sync_gzh = function (url, data, callback, safe) {
	var str = `<xml>`
	for (var key in data) {
		str += `<${key}>${data[key]}</${key}>`
	}
	str += '</xml>'
	var b = new xml2js.Builder();
	var parser = new xml2js.Parser();
	var xml = str;
	var parseString = xml2js.parseString;
	var ret = {
		err: null,
		data: null,
	};
	return new Promise((resolve, reject) => {
	request(
		{
			url: url,
			method: 'POST',
			body: xml,
			key: fs.readFileSync(__dirname + '/apiclient_key_gzh.pem'),
			cert: fs.readFileSync(__dirname + '/apiclient_cert_gzh.pem')
		}, function (err, response, body) {
			if (!err && response.statusCode == 200) {
				console.log("body");
				console.log(body);

				parseString(body, { explicitArray: false }, function (err, result) {
					console.log(JSON.stringify(result));
						ret.data = result.xml;
						resolve(ret);
				});
			} else {
					ret.err = err;
					resolve(ret);
			}
		}
	);
	})
};
exports.postMENU = function (url, data) {
	var op = JSON.stringify(data)
	var ret = {
		err: null,
		data: null,
	};
	return new Promise((resolve, reject) => {
		request(
			{
				url: url,
				method: 'POST',
				body: op
			}, function (err, response, body) {
				if (!err && response.statusCode == 200) {
					console.log("body");
					console.log(body);
					// callback(null, body)
					ret.data = body;
					resolve(ret);
				} else {
					ret.err = err;
					resolve(ret);
				}
			}
		);

	})



};


exports.postJsonImage = function ({host, port, path, data, safe}) {
	// var ret = {
	// 	err: null,
	// 	data: null,
	// };
	return new Promise((resolve, reject) => {
		var content = JSON.stringify(data);
		// console.log(data);  
		var opt = {
			method: "POST",
			host: host,
			port: port,
			path: path,
			headers: {
				"Content-Type": 'application/json',
				"Content-Length": content.length
			}
		};


		var proto = http;
		if (safe) {
			proto = https;
		}

		var req = proto.request(opt, function (res) {
			// var str = '';
			var chunks = []; //用于保存网络请求不断加载传输的缓冲数据
			var size = 0;　　 //保存缓冲数据的总长度
			//console.log('STATUS: ' + res.statusCode);  
			//console.log('HEADERS: ' + JSON.stringify(res.headers));  
			// res.setEncoding('utf-8');  
			res.on('data', function (chunk) {
				// console.log('BODY: ' + chunk);
				// str += chunk;
				chunks.push(chunk);
				size += chunk.length;　　//累加缓冲数据的长度
			});
			res.on('end', function () {
				var data = Buffer.concat(chunks, size);
				var base64Img = data.toString('base64');
				// console.log(base64Img)
				try {
					data = JSON.parse(new Buffer(base64Img, 'base64').toString())
					// ret.err = true;
					resolve(data);
					// console.error(data)

					// console.error(e)

				} catch (err) {
					resolve(base64Img);
				}
			
			});
		});

		req.on('error', function (e) {
			console.log('problem with request: ' + e.message);
			// callback(true, e);
			console.error(e)
			resolve(null);

		});
		req.write(content + "\n");
		req.end();

	})

};
exports.getSync12 = function (url, data, safe, nocon, encoding) {
	if (data) {
		var content = qs.stringify(data);
		var url = url + '?' + content;
	}

	var proto = http;
	if (safe) {
		proto = https;
	}
	if (!encoding) {
		var encoding = 'utf8';
	}
	var ret = {
		err: null,
		data: null,
	};
	if (!nocon) {
		console.log(url)
	}
	return new Promise((resolve, reject) => {
		try {
			var req = proto.get(url, function (res) {
				res.setEncoding(encoding);
				var body = ''
				ret.type = res.headers["content-type"];
				res.on('data', function (chunk) {
					body += chunk;

				});
				res.on('end', function () {
					if (encoding != 'binary') {
						try {
							ret.data = JSON.parse(body);
						} catch (error) {
							console.log("JSON数据格式化错误")
							console.log(body)
						}
					} else {
						ret.data = body
					}
					resolve(ret);
				});
			});

			req.on('error', function (e) {
				console.log('problem with request: ' + e.message);
				ret.err = e;
				reject(ret);
			});
			req.end();
		} catch (error) {
			console.error("图片地址出错")
			console.error(url)
			console.error(error)
			ret.err = error;
			reject(ret);
		}
	})

};


exports.send = function(res, ret, data){
	if(data == null){
		data = {};
	}
	data.errcode = ret.code;
	data.errmsg = ret.msg;
	let jsonstr = JSON.stringify(data);

	saveAPI_DATA(res,jsonstr)

	saveAPI_LOG(res,jsonstr)

	res.send(jsonstr);
};



///////////////////////////////////////////
//路由管理器，用于加密通信
function HttpRoutMgr() {
	this.getRoutMap = {};
	this.postRoutMap = {};
}

HttpRoutMgr.prototype.get = function (path, fn) {
	this.getRoutMap[path] = fn;
};

HttpRoutMgr.prototype.post = function (path, fn) {
	this.postRoutMap[path] = fn;
};

HttpRoutMgr.prototype.rout = function (method, path, req, res) {
	var routerDict = null;
	if (method == 'GET') {
		routerDict = this.getRoutMap;
	} else if (method == 'POST') {
		routerDict = this.postRoutMap;
	}

	if (routerDict) {
		var fn = routerDict[path];
		if (fn && typeof fn == 'function') {
			fn(req, res);
		}
	}
};

exports.HttpRoutMgr = HttpRoutMgr;