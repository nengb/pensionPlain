
/**
 * redis 表名模块  格式 ： 数据类型+下划线+表名
 * 数据类型有：string（字符串），hash（哈希），list（列表），set（集合）及zset(sorted set：有序集合)。
 */

/**
 * 玩家登录凭证
 */
exports.TOKENS_USER = `string_TOKENS_USER`;
exports.USERS_TOKEN = `string_USERS_TOKEN`;

// exports.USERS_DATA = `hash_USERS_DATA`;

//小程序access_token
exports.MINI_ACCESS_TOKEN = `hash_MINI_ACCESS_TOKEN`;
//微信公众号access_token
exports.WX_ACCESS_TOKEN = `hash_WX_ACCESS_TOKEN`;
//微信 jssdk - jsapi_ticket
exports.WX_JSAPI_TICKET = `hash_WX_JSAPI_TICKET`;


//接口请求日志
exports.API_LOG = `list_API_LOG`;

//首页历史搜索记录
exports.INDEX_SEARCH_HISTORY = `list_INDEX_SEARCH_HISTORY`;


//提现token
exports.WITHDRAW_LIST = `hash_WITHDRAW_LIST`;



//微信群绑定接龙id
exports.WX_GROUP_ACTIVEID = `hash_WX_GROUP_ACTIVEID`;



//爬虫链接-已读取过内容
exports.CRAWLER_URL = `hash_CRAWLER_URL`;

//爬虫链接-存储网页内容
exports.CRAWLER_URL_DATA = `hash_CRAWLER_URL_DATA`;
