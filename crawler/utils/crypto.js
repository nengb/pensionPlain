var crypto = require('crypto');
var aes = require('./aes');
console.error(aes)
exports.md5 = function (content) {
	var md5 = crypto.createHash('md5');
	md5.update(content);
	return md5.digest('hex');
}
exports.sha1 = function (content) {
	// console.log(content)
	// console.log(key)

	var sha = crypto.createHash('sha1');
	sha.update(content, 'utf8')
	// console.log(hmac.digest())
	str = sha.digest('hex')
	return str;
}

exports.sha256 = function (content) {
	// console.log(content)
	// console.log(key)

	var sha = crypto.createHash('sha256');
	sha.update(content, 'utf8')
	// console.log(hmac.digest())
	str = sha.digest('hex')
	return str;
}

exports.hmac = function (content, key) {
	// console.log(content)
	// console.log(key)

	var hmac = crypto.createHmac('sha1', key);
	hmac.update(content);
	// console.log(hmac.digest())

	return hmac.digest().toString('base64');
}
exports.toBase64 = function (content) {

	return Buffer.from(content).toString('base64');
}

exports.fromBase64 = function (content) {
	return Buffer.from(content, 'base64').toString();
}

exports.rsasha256 = function (content, key) {

	var sign = crypto.createSign('RSA-SHA256');
	sign.update(Buffer.from(content));

	var ret = sign.sign(key, 'base64')
	return ret
}

let rsa_public_key = `-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEA3eGigAAlwuO9owrakkhf5JOPPQJ/CG88mKXGv2H5hkbZrwRJptdL
+CwcJ/6z+FKFcN1lNnxQ8mDgj3MfFStdsVs8ujZMn9SgrMdgfZJzb+lDzDKZ5W1Q
fK5C99/GkWm9gbrjMy5dHu/uXqx62DRMlOdf5C72PoueCKU+fk14PB+ttAswPuzC
HMNLl73ZFZdHDgxePspoDe9z1MJwzdSn9WDPDTtVAQqn9kMGvIyxJeoAh+Q3zL6E
EMVknlBpFqeX3rOQZprh9BlQjErDznRpglb4drzUU7HxDARaGX/tZ9f+ivJJIbYf
b0kcxksiquThYqiCn5HT0YyDjM5L9XRnNwIDAQAB
-----END RSA PUBLIC KEY-----`

let rsa_key = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3eGigAAlwuO9owrakkhf
5JOPPQJ/CG88mKXGv2H5hkbZrwRJptdL+CwcJ/6z+FKFcN1lNnxQ8mDgj3MfFStd
sVs8ujZMn9SgrMdgfZJzb+lDzDKZ5W1QfK5C99/GkWm9gbrjMy5dHu/uXqx62DRM
lOdf5C72PoueCKU+fk14PB+ttAswPuzCHMNLl73ZFZdHDgxePspoDe9z1MJwzdSn
9WDPDTtVAQqn9kMGvIyxJeoAh+Q3zL6EEMVknlBpFqeX3rOQZprh9BlQjErDznRp
glb4drzUU7HxDARaGX/tZ9f+ivJJIbYfb0kcxksiquThYqiCn5HT0YyDjM5L9XRn
NwIDAQAB
-----END PUBLIC KEY-----`

exports.rsa_padding = function (data) {
	//  var publicPem = fs.readFileSync('./rsa_public_key.pem');
	var pubkey = rsa_key;
	var buf = Buffer.from(data);
	var plaintext = crypto.publicEncrypt(pubkey, buf);
	let result = plaintext.toString('base64')
	return result
}

//  enc_bank_no: 'ci4hI33xYhC58PYjIQCygrdGWhoX1dXOfneWn9UN8KjQhzT7IVsmElSC3jcXgP2UCuPG7ikCjPBDtfOPufxBUf1Sjjrjzc2RkCu8Kl7x3EOanKm038QNsZMskiXk7ERUTerlL1nnedHDgiOXob1uY57UuIvlubSIq+EtbzakvtDMatLP30v7fLxV3rRQxRzY9H/HHmlhkXn58e8J/ng36zuVZGEL1h/e0HMRsfJ1C7pH44qkBeKLmsORdYOPKHxCjjBnTWiBOeWnsbLWmR8W8Q0BxV3XrwFmKtBZvFNF/RjARnjXIpg3Z69JaTjLGQCwwYaZHUgnIy6Ya8I5PblxPA==',
//   enc_true_name: '3RlAQ6R065cn5wOGY0iTguSAVmzjZv29QPbALo4NIhzTmxYlTwBRvsykaQlIjE7khQMTVkzMgFNmiB75D98CWI+bRPURV3We7601WHAWhF1J9ts7PM19BARgvfvYK+u5OQxdC8xeAAmyOqDegdCAszp5Xy7JI9iEpGr0KOV6EuK2WJ8Np0wPzMpH+AvTH90t53L3PIhP1lv7DPFb6stCkRYOUnzj6xFh0L8fRqk82QFNxzVHYbzKxEVwWx5CqzI7t2AkGdqofS99+4Pive8U37nZmi3tbev7XOf6LXvvJtxsRcVCzgQbVLo+T62XNR+iYe9bvbWsF7LnaoamtojklQ==',

exports.decryptData = function (epData, iv, appId, sessionKey) {
	// base64 decode
	console.log("decryptData")
	console.log(epData)
	console.log(iv)
	console.log(appId)
	console.log(sessionKey)
	sessionKey = Buffer.from(sessionKey, 'base64')
	epData = Buffer.from(epData, 'base64')
	iv = Buffer.from(iv, 'base64')
	let decoded = ''
	try {
		// 解密
		let decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv)
		// 设置自动 padding 为 true，删除填充补位
		decipher.setAutoPadding(true)
		decoded = decipher.update(epData, 'binary', 'utf8')
		decoded += decipher.final('utf8')

		decoded = JSON.parse(decoded)
		if (decoded.watermark.appid !== appId) {
			console.error('appid1!=', decoded.watermark.appid + ' [==] ' + appId)
			return null;
		}
	} catch (err) {
		console.error(err)
		return null
	}
	return decoded
}



exports.AesEncrypt = aes.encrypt;

exports.AesDecrypt = aes.decrypt;
