/* eslint-disable */

class ServerConfig {
    constructor() {
        //连接服务器的请求地址
        this.ip = '47.97.32.55';	 //测试服务器
        // let ip = 'localhost' ;	
        // this.ip = process.env.NODE_ENV == 'production' ? window.location.hostname : ip;  //从浏览器拿ip
        // this.ip='115.451.15.154';  //假ip地址
        this.httpAddress = `http://${this.ip}:13581`
        // this.httpAddress=`http://localhost:9001`  //测试服务器


        //使用mock模拟数据
        // this.httpAddress = 'mock'
        this.loca_key = '!@$%&S&@'
        //socket
        this.socketAddress = `${this.ip}:10000`
        // this.imgAddress = `${window.location.protocol}//${this.ip}/web_h5/dist/img_aiqu_pink`


        // this.path='/mobile_web'
        // this.path=''

    }
    getUrlAesData(type, attr) {
        var url = document.location.href;
        let data = this.getHrefNew('?', 'data')
        // let a = decodeURIComponent(url.split('data=')[1])
        let a = decodeURIComponent(data)
        return a
    }
    getHashSearch() {
        let a = window.location.hash.split('?');
        return a[1] ? '?' + a[1] : ''
    }
    //解析地址栏参数
    getQueryStringArgs(urlSearch) {

        let qs = "";
        if (urlSearch.length > 0) {
            let n = urlSearch.split('?')
            qs = n.length == 2 ? n[1] : n[0]
        }
        let args = {};
        let items = qs.length ? qs.split("&") : [];
        let item = null;
        let name = null;
        let value = null;
        let i = 0;
        let len = items.length;

        for (i = 0; i < len; i++) {
            item = items[i].split("=");

            // decodeURIComponent解码
            // name = decodeURIComponent(item[0]);
            // value = decodeURIComponent(item[1]);
            name = decodeURIComponent(item[0]);
            value = decodeURIComponent(item[1]);


            if (name.length) {
                args[name] = value;
            }
        }

        return args;
    }
    //解析加密地址栏参数
    getQueryStringArgsAes() {
        let data = this.getUrlAesData();
        let urlSearch = AesDecrypt(data, this.loca_key, 128);
        try {
            data = JSON.parse(urlSearch)
        } catch (error) {
            data = {}
        }
        return data;
    }
    //地址栏参数加密传输
    genQueryString(path, query) {

        let url = path;

        if (query && query != 'null' && typeof query == 'object') {
            try {
                let userid = sessionStorage.userid;
                if (userid) {
                    query.invitor_id = userid;
                }
                query = JSON.stringify(query)
            } catch (error) {
            }

            let urlSearch = AesEncrypt(query, this.loca_key, 128);
            // let urlSearchAes = AesDecrypt(urlSearch, this.loca_key, 128);
            urlSearch = encodeURIComponent(urlSearch)
            url = url + '?data=' + urlSearch;
        }

        return url;

    }
    getHrefNew(type, attr) {
        var url = document.location.href;
        var arr = url.match(/(https?:)\/\/([^\/]+)(\/[^\?]*)?(\?[^#]*)?(#.*)?/);
        var protocol = arr[1];  // 协议
        var host = arr[2];      // 主机
        var pathname = arr[3];  // 路径
        var search = arr[4];    // 查询
        var hash = arr[5];      // 哈希值
        var str;
        if (type == "?") {
            if (search) {
                str = search.replace("?", "");
            }
        }
        if (type == "#") {
            if (hash) {
                str = hash.split("?")[1];
            }
        }
        if (str) {
            if (str.indexOf("&") > -1) {
                str = str.split("&");
                for (var x in str) {
                    var arr = str[x].split("=");
                    if (arr[0] == attr) {
                        return arr[1];
                    }
                }
            } else {
                var arr = str.split("=");
                if (arr[0] == attr) {
                    return arr[1];
                }
            }
        } else {
            return;
        }
    }
    //获取token
    getToken() {
        return sessionStorage.token
    }
    formatTime(date) {
        date = new Date(Number(date));

        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hour = date.getHours()
        const minute = date.getMinutes()
        const second = date.getSeconds()
        return [year, month, day].map(this.formatNumber).join('-') + ' ' + [hour, minute, second].map(this.formatNumber).join(':')
    }
    formatSortTime(date) {
        date = new Date(Number(date));

        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hour = date.getHours()
        const minute = date.getMinutes()
        const second = date.getSeconds()
        return [month, day].map(this.formatNumber).join('/') + ' ' + [hour, minute].map(this.formatNumber).join(':')
    }
    formatNumber(n) {
        n = n.toString()
        return n[1] ? n : '0' + n
    }
    getTime(dateTimeStamp) {

        var minute = 1000 * 60;
        var hour = minute * 60;
        var day = hour * 24;
        var halfamonth = day * 15;
        var month = day * 30;
        var now = Date.now();
        var diffValue = now - dateTimeStamp;

        if (diffValue < 0) { return '刚刚'; }
        var monthC = diffValue / month;
        var weekC = diffValue / (7 * day);
        var dayC = diffValue / day;
        var hourC = diffValue / hour;
        var minC = diffValue / minute;

        var result = ''
        if (monthC >= 1) {
            result = "" + parseInt(monthC) + "月前";
        }
        else if (dayC >= 1) {
            switch (parseInt(dayC)) {
                case 1: result = "昨天"; break;
                case 2: result = "前天"; break;
                default: result = "" + parseInt(dayC) + "天前"; break;
            }


        }
        else if (hourC >= 1) {
            result = "" + parseInt(hourC) + "小时前";
        }
        else if (minC >= 1) {
            result = "" + parseInt(minC) + "分钟前";
        } else {
            result = "刚刚";
        }

        return result;
    }

    dealQuery(query) {
        for (let key in query) {
            let data = query[key];
            if (data == null) {
                delete query[key];
            }
        }
        return query;
    }

    fullScreenCall() {
        var el = document.documentElement; //若要全屏页面中div，var element= document.getElementById("divID");

        //切换全屏
        var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
        if (typeof rfs != "undefined" && rfs) {
            rfs.call(el);

        } else if (typeof window.ActiveXObject != "undefined") {
            // for Internet Explorer 
            var wscript = new ActiveXObject("WScript.Shell");
            if (wscript != null) {
                wscript.SendKeys("{F11}");
            }
        }
    }

    checkFull() {
        var isFull = document.fullscreenEnabled || window.fullScreen || document.webkitIsFullScreen || document.msFullscreenEnabled;
        //to fix : false || undefined == undefined
        if (isFull === undefined) isFull = false;
        return isFull;
    }

    fullExitCall() {
        var el = document;
        var cfs = document.exitFullscreen || document.webkitCancelFullScreen || document.msExitFullscreen || document.mozCancelFullScreen;
        if (typeof cfs != "undefined" && cfs) {
            cfs.call(el);
        } else if (typeof window.ActiveXObject != "undefined") {
            var wscript = new ActiveXObject("WScript.Shell");
            if (wscript != null) {
                wscript.SendKeys("{F11}");
            }
        }
    }

    formatSize(size) {
        let kb = (size / 1024).toFixed(2);
        let mb = (kb / 1024).toFixed(2);
        let gb = (mb / 1024).toFixed(2);
        if (gb > 1) {
            return `${gb}G`;
        } else if (mb > 1) {
            return `${mb}M`;
        }
        else if (kb > 1) {
            return `${kb}K`;
        }
        else {
            return `${size}B`;
        }
    }
    //数组对象深拷贝
    deepCopy(o) {
        if (o instanceof Array) {
            var n = [];
            for (var i = 0; i < o.length; ++i) {
                n[i] = this.deepCopy(o[i]);
            }
            return n;

        } else if (o instanceof Object) {
            var n = {}
            for (var i in o) {
                n[i] = this.deepCopy(o[i]);
            }
            return n;
        } else {
            return o;
        }
    }
    dataURLtoFile(dataurl, filename) {
        console.log("dataURLtoFile223")

        let arr = dataurl.split(',')
        console.log(arr.length)
        console.log(arr)
        let mime = arr[0].match(/:(.*?);/)[1];
        console.log(mime.length)

        let bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);

        while (n--) {

            u8arr[n] = bstr.charCodeAt(n);

        }
        return new File([u8arr], filename, { type: mime });
    }

    /*
        三个参数
        file：一个是文件(类型是图片格式)，
        w：一个是文件压缩的后宽度，宽度越小，字节越小
        objDiv：一个是容器或者回调函数
        photoCompress()
         */
    photoCompress(file, w) {
        return new Promise(async (resolve,reject)=>{
            var ready = new FileReader();
            /*开始读取指定的Blob对象或File对象中的内容. 当读取操作完成时,readyState属性的值会成为DONE,如果设置了onloadend事件处理程序,则调用之.同时,result属性中将包含一个data: URL格式的字符串以表示所读取文件的内容.*/
            let that = this;
            ready.readAsDataURL(file);
            ready.οnlοad = async function () {
                var re = this.result;
                resolve(await that.canvasDataURL(re, w))
            }
        })
    }
    canvasDataURL(path, obj) {
        return new Promise((resolve,reject)=>{

            var img = new Image();
            img.src = path;
            img.onload = function () {
                var that = this;
                // 默认按比例压缩
                var w = that.width,
                    h = that.height,
                    scale = w / h;
                w = obj.width || w;
                h = obj.height || (w / scale);
                var quality = 0.7;  // 默认图片质量为0.7
                //生成canvas
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                // 创建属性节点
                var anw = document.createAttribute("width");
                anw.nodeValue = w;
                var anh = document.createAttribute("height");
                anh.nodeValue = h;
                canvas.setAttributeNode(anw);
                canvas.setAttributeNode(anh);
                ctx.drawImage(that, 0, 0, w, h);
                // 图像质量
                if (obj.quality && obj.quality <= 1 && obj.quality > 0) {
                    quality = obj.quality;
                }
                // quality值越小，所绘制出的图像越模糊
                var base64 = canvas.toDataURL('image/jpeg', quality);
                // 回调函数返回base64的值
                
                resolve(base64)
                // callback(base64);
            }
        })
    }

     showSize(base64url) {
        //获取base64图片大小，返回MB数字
			var str = base64url.replace('data:image/jpeg;base64,', '');
			
			var equalIndex = str.indexOf('=');
			if(str.indexOf('=')>0) {
				str=str.substring(0, equalIndex);
			}
			
			var strLength=str.length;
			
			var fileLength=parseInt(strLength-(strLength/8)*2);
			console.log("```````````````"+strLength);
			// 由字节转换为MB
			var size = "";
			size = (fileLength/(1024 * 1024)).toFixed(2);
			console.log("```````````````"+size);
			var sizeStr = size + "";                        //转成字符串
			var index = sizeStr.indexOf(".");                    //获取小数点处的索引
			var dou = sizeStr.substr(index + 1 ,2)            //获取小数点后两位的值
			if(dou == "00"){                                //判断后两位是否为00，如果是则删除00                
				return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
			}
			return parseInt(size);
		}



    async getLocation() {

        return new Promise((resolve, reject) => {
            console.log(window.jssdk)
            if (window.jssdk) {
                wx.getLocation({
                    type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                    success: async (res) => {
                        var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                        var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                        var speed = res.speed; // 速度，以米/每秒计
                        var accuracy = res.accuracy; // 位置精度

                        window.latitude = latitude;
                        window.longitude = longitude;
                        resolve(res)
                    },
                    fail(e) {
                        resolve(null)
                    }

                });

            } else {
                resolve(null)

            }

        })
    }
    //微信jssdk-选择相册
    async chooseImage(count, userid) {
        return new Promise((resolve, reject) => {
            if (window.jssdk && count > 0) {
                wx.chooseImage({
                    count: count, // 默认9
                    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                    success: async (res) => {
                        var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                        let imgData = [];
                        console.log(`chooseImage`)
                        console.log(res)
                        if (localIds && localIds.length > 0) {
                            for (let i = 0; i < localIds.length; i++) {
                                let base64Data = await this.getLocalImgData(localIds[i])
                                if (base64Data) {
                                    let imgName = `${userid}-${Date.now()}-${i}.jpeg`
                                    let size = this.showSize(base64Data)
                                    if(size>1){
                                        base64Data  = await this.canvasDataURL(base64Data,{
                                            quality:0.2
                                        })

                                    }
                                    imgData[i] = {
                                        content: base64Data,
                                        file: this.dataURLtoFile(base64Data, imgName),
                                        length: base64Data.length,
                                    }
                                }
                            }
                        }
                        console.log(`imgData`)
                        console.log(imgData)
                        resolve(imgData)
                    },
                    fail(e) {
                        resolve(null)
                    }

                });

            } else {
                resolve(null)
            }

        })
    }
    //微信jssdk-相册图片转base64
    async getLocalImgData(localId) {
        return new Promise((resolve, reject) => {
            if (window.jssdk && localId) {
                wx.getLocalImgData({
                    localId: localId, // 图片的localID
                    success: function (res) {
                        var localData = res.localData; // localData是图片的base64数据，可以用img标签显示
                        let u = navigator.userAgent;
                        let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端  
                        if (isAndroid) {
                            localData = ' data:image/jpeg;base64,' + localData
                        } else {
                            localData = localData.replace('jgp', 'jpeg');
                        }

                        resolve(localData)
                    },
                    fail(e) {
                        resolve(null)
                    }
                });
            } else {
                resolve(null)

            }

        })
    }


    //计算两个经纬度坐标的距离（km）
    getFlatternDistance(lat1, lng1, lat2, lng2) {
        var EARTH_RADIUS = 6378137.0;    //单位M
        var PI = Math.PI;

        function getRad(d) {
            return d * PI / 180.0;
        }
        var f = getRad((lat1 + lat2) / 2);
        var g = getRad((lat1 - lat2) / 2);
        var l = getRad((lng1 - lng2) / 2);

        var sg = Math.sin(g);
        var sl = Math.sin(l);
        var sf = Math.sin(f);

        var s, c, w, r, d, h1, h2;
        var a = EARTH_RADIUS;
        var fl = 1 / 298.257;

        sg = sg * sg;
        sl = sl * sl;
        sf = sf * sf;

        s = sg * (1 - sl) + (1 - sf) * sl;
        c = (1 - sg) * (1 - sl) + sf * sl;

        w = Math.atan(Math.sqrt(s / c));
        r = Math.sqrt(s * c) / w;
        d = 2 * w * a;
        h1 = (3 * r - 1) / 2 / c;
        h2 = (3 * r + 1) / 2 / s;

        return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
    }

}

//绑定this
function selfish(target) {
    const cache = new WeakMap();
    const handler = {
        get(target, key) {
            const value = Reflect.get(target, key);
            if (typeof value !== 'function') {
                return value;
            }
            if (!cache.has(value)) {
                cache.set(value, value.bind(target));
            }
            return cache.get(value);
        }
    };
    const proxy = new Proxy(target, handler);
    return proxy;
}



window.serverConfig = selfish(new ServerConfig());

export default window.serverConfig;