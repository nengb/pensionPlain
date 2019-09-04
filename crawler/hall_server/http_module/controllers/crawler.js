
const db = require('../../../utils/dbsync_hall');
const dbRedis = require('../../../utils/db_redis_hall');
const redis = require('../../../utils/redis');

const crypto = require('../../../utils/crypto');
const http = require('../../../utils/http');
const configs = require('../../../configs.js');
const config = configs.hall_server();

const path = require('path');
const fs = require('fs');
const TOKEN = require('../utils/token');

const ERRCODE = require('../../../utils/errcode.js');

const cheerio = require('cheerio');
const charset = require('superagent-charset');
const superagent= require('superagent');
charset(superagent);

//redis表名
const { TOKENS_USER, USERS_TOKEN, CRAWLER_URL,CRAWLER_URL_DATA } = dbRedis;
const { RET_OK } = ERRCODE;
//大厅服错误码
const { TOKEN_TIMEOUT, NO_USER, OPERATE_FAILED } = ERRCODE.HALL_ERRS;
//系统错误码
const { INVALID_PARAMETER, INTER_NETWORK_ERROR } = ERRCODE.SYS_ERRS;



/**
 * 
 *  爬虫模块
 */

// import db from '../utils/dbsync_hall'
// await db.update_user_info(account, name, headimgurl, sex)
module.exports = app => {
    const controllerUtils = require('../utils')(app)
    class httpController extends controllerUtils {
        constructor() {
            super()
            console.log(`启动爬虫`)

            this.taskUrl = new Set();

            this.time = 0;

            this.run()

            this.dealTask();

        }

        async run(){
            // superagent.get('http://news.baidu.com/').end((err, res) => {
            //     if (err) {
            //       // 如果访问失败或者出错，会这行这里
            //       console.log(`热点新闻抓取失败 - ${err}`)
            //     } else {
            //      // 访问成功，请求http://news.baidu.com/页面所返回的数据会包含在res
            //      // 抓取热点新闻数据
            //      console.log(res)

            //     }
            //   });

            let url = 'https://www.dytt8.net/'
            // url = 'https://www.dytt8.net/html/tv/hytv/20190807/58960.html'
            console.log(`run`)
           let result = await this.getHrefList(url)
            if(!result){
                console.log(`not result`)
                setTimeout(()=>{
                    this.run()
                },5000)
            }
            // this.getMovieData(url)
            // let data = await superagent.get(url)
            // let urlData = data.res.text;
            // // console.log(data.res)
            // let domain = data.res.socket.servername
            // let $ = cheerio.load(urlData);
            // this.getHrefList(domain,$)
             
        }

        dealTask(){
            clearInterval(this.time)
            this.time = setInterval(async ()=>{
                console.log(`taskUrl ${this.taskUrl.size}`,this.taskUrl.size)
                for(let url of this.taskUrl){
                    console.log(`dealTask ${url}`)
                    await this.getMovieData(url)
                    this.taskUrl.delete(url)
                    return;
                }

            },500)
        }

        async getUrlData(url){
            let domain='';
            let urlData='';

            let getUrlData = await redis.hget(CRAWLER_URL_DATA,url)
            if(getUrlData && getUrlData.data){
                urlData = crypto.fromBase64(getUrlData.data)
                try {
                    domain = getUrlData.domain
                } catch (error) {
                    console.log("error")
                    console.log(error)
                }
            }else{
                try {
                    console.log(`获取网页内容${url}`)
                    let data = await superagent.get(url).charset('gbk')
                    urlData = data.res.text;
                    domain = data.res.socket.servername;
                    await redis.hmset(CRAWLER_URL_DATA,{
                        [url]:JSON.stringify({
                            domain,
                            data:crypto.toBase64(urlData)
                        })
                    })
                } catch (error) {
                    return 
                }
            }

            // console.log(data.res)

            let $ = cheerio.load(urlData, { decodeEntities: false });

            return { domain ,$ ,urlData}

        }

        async getHrefList(url){
            // console.log(url)
            // let data = await superagent.get(url)
            // let urlData = data.res.text;
            // // console.log(data.res)
            // let domain = data.res.socket.servername
            
            let getUrlData =await this.getUrlData(url)
            if(!getUrlData){
                this.taskUrl.delete(url)
                this.taskUrl.add(url)

                return;
            }
            let { domain ,$ ,urlData} = getUrlData;
            console.log(domain)

            let a_list = [];
            $('a').each(function(i,elem){
              a_list[i] = $(this).attr('href')
            })
            a_list.forEach(async e=>{

                if(e && e[0] == '/'){
                    // this.getMovieData(taskUrl)
                    let taskUrl = `https://${domain}${e}`
                    // console.log(taskUrl)
                       let getUrl = await redis.hget(CRAWLER_URL,taskUrl)
                        if(!getUrl){
                           this.taskUrl.add(taskUrl);
                        }
                }
                if(/http/.test(e) && !/magnet:/.test(e)){
                    let taskUrl = e
                    let getUrl = await redis.hget(CRAWLER_URL,taskUrl)
                     if(!getUrl){
                        this.taskUrl.add(taskUrl);
                     } 
                }

            })

            return true

            
        }

        async getMovieData(url){
            // console.log(url)
            let getUrl = await redis.hget(CRAWLER_URL,url)
            if(getUrl){
                setTimeout(()=>{
                    this.getHrefList(url)
                },2000)
                return ;
            }
            // let data = await superagent.get(url).charset('gbk')
            // let urlData = data.res.text;
            // // console.log(data.res)
            // let domain = data.res.socket.servername
            // let $ = cheerio.load(urlData, { decodeEntities: false });
            let getUrlData = await this.getUrlData(url)
            if(!getUrlData){
                this.getMovieData(url)
                return;
            }
            let { $ ,urlData} =  getUrlData  

            await redis.hmset(CRAWLER_URL,{
                [url]:true
            })
            console.log(`提取网站 ${url}`)
            let movie_img = ''
            let name = $('#Zoom p').text()
            try {
                name = name.match(/◎译　　名[\W]*\s◎/g)[0]
                name = name.replace('◎译　　名　','').replace('','').replace('◎','')
            } catch (error) {
                try {
                    name = name.match(/◎片　　名[\W]*◎/g)[0]
                    name = name.replace('◎片　　名　','').replace('','').replace('◎','')
                } catch (error) {
                    
                }
            }
            $('#Zoom img').each(function(i,ele){
              let a = $(this).attr('src')
              movie_img += a+','
            })
            movie_img = movie_img.slice(0,movie_img.length-1)

            let movie_url=''
            let movie_url2=''
            let url_name=''
            $('#Zoom a').each(function(i,ele){
                let thunderhref = $(this).attr('href')
                if(thunderhref && /magnet:/.test(thunderhref)){
                    movie_url2 = thunderhref
                }
            })

            $('#Zoom table a').each(async function(i,ele){
                let thunderhref = $(this).attr('href')
                if(thunderhref){
                    movie_url = thunderhref
                    url_name = $(this).text()
                    if(movie_url != ''){
                        let getMovie = await db.get_movie({movie_url})
                        if(!getMovie){
                            db.add_movie({req_url:url,movie_url,movie_url2,name,movie_img,url_name})
                        }
                    }
                }
            })
            
         

            setTimeout(()=>{
                this.getHrefList(url)
            },2000)
        }




    }

    return httpController;
};
