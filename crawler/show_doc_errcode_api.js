var request = require('request');

var errcode = require('./utils/errcode.js');
console.log(errcode)

const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
  
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatNumber = n => {
n = n.toString()
return n[1] ? n : '0' + n
}
let data = {
    api_key:'b1b192c7aba226bd34755b297c4bd2c41090925364',
    api_token:'4d77789f8c9c0b1f4e2383a1fa7bac9b916461167',
    cat_name:'',
    page_title:`全局错误码`,
    page_content:`
- 更新时间：${formatTime(new Date())} \n
| code | msg   |
| ------------ | ------------ |
    `,
    s_number:'1',
}

function getCodeMsg(code,msg){
    return `|  ${code} |  ${msg} |\n`;
}

let content =``
for(let processKey in errcode){
    if( typeof errcode[processKey] === 'object' ){
        console.log(processKey)
        if(processKey === 'RET_OK'){
            data.page_content += getCodeMsg(errcode[processKey].code,errcode[processKey].msg)
            continue;
        }
        for(let typeKey in errcode[processKey]){
            let code = errcode[processKey][typeKey].code;
            let msg = errcode[processKey][typeKey].msg;
            // if(code && allCode[code]){
            //     console.error(`errcode.js 文件 存在相同的 code  位置：${processKey}.${typeKey}  重复的位置：${allCode[code]}`)
            // }else{
            //     allCode[code] = `code 进程类型：${processKey}.${typeKey}`

                data.page_content+= getCodeMsg(code,msg)

            // }
        }
    }
}


console.log(data.page_content)
console.log(data.page_title)
request.post('https://www.showdoc.cc/server/api/item/updateByApi',function(error, response, body){
// console.log(error)
// console.log(response)
}).form(data)
