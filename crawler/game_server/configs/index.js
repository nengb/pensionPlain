/* 融合该文件夹上所有配置文件配置 */
const allConf = {}
const conFiles = require('require-all')({
    dirname     : __dirname,
    // filter      :  /(.+Controller)\.js$/,
    excludeDirs :  /^\.(git|svn)$/,              //排除
    recursive   : true ,                         //递归
    resolve     : func => {
        Object.assign(allConf,func)
    }
})

module.exports = allConf

