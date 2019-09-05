

// //所有api请求路径,cache：接口是否启用缓存
//get请求
export const get = {
  /**
  * user 
  */
  //微信小程序-用户注册
  mini_wechat_auth: { path: '/mini_wechat_auth', cache: false },
  //微信网页 - 用户注册
  h5_wechat_auth: { path: '/h5_wechat_auth', cache: false },
  //用户登录
  login: { path: '/login', cache: false },
  //上报用户定位
  uploadLocation: { path: '/uploadLocation', cache: false },
  //获取用户信息
  get_user_info: { path: '/get_user_info', cache: false },
  //获取用户粉丝列表信息
  get_user_fans: { path: '/get_user_fans', cache: false },
  //屏蔽粉丝或修改粉丝备注
  update_user_fans_info: { path: '/update_user_fans_info', cache: false },
  //阅读我的所有粉丝
  read_user_all_fans: { path: '/read_user_all_fans', cache: false },
  //更新用户联系信息
  update_user_contact_info: { path: '/update_user_contact_info', cache: false },
  //上报用户表单id（发送服务通知使用）
  report_user_formid: { path: '/report_user_formid', cache: false },
  //获取其他用户的信息
  get_other_user_info: { path: '/get_other_user_info', cache: false },
  //获取用户接龙列表
  get_user_active_list: { path: '/get_user_active_list', cache: false },
  //获取用户二维码
  get_mini_scanCode: { path: '/get_mini_scanCode', cache: false },
  //获取微信jssdk配置
  get_wechat_jssdk_config: { path: '/get_wechat_jssdk_config', cache: false },

  /**
  * certificate_manage 
  */

  //修改接龙凭证信息
  update_active_record_info: { path: '/update_active_record_info', cache: false },
  //修改接龙凭证状态
  update_active_record_state: { path: '/update_active_record_state', cache: false },
  //阅读我的所有凭证
  read_user_all_active_records: { path: '/read_user_all_active_records', cache: false },
  //获取用户单个凭证
  get_active_record_by_id: { path: '/get_active_record_by_id', cache: false },
  //获取用户单个凭证的操作记录
  get_active_record_log: { path: '/get_active_record_log', cache: false },
  //获取接龙的凭证管理信息
  get_active_record_manage_info: { path: '/get_active_record_manage_info', cache: false },
  //获取接龙凭证管理页面的凭证列表
  get_active_records_manage_list: { path: '/get_active_records_manage_list', cache: false },
  //获取签到管理信息
  get_active_record_signIn_manage_info: { path: '/get_active_record_signIn_manage_info', cache: false },
  //获取签到管理页面的凭证列表
  get_active_records_signIn_manage_list: { path: '/get_active_records_signIn_manage_list', cache: false },
  //签到凭证
  signIn_active_records: { path: '/signIn_active_records', cache: false },
  //获取接龙可通知的用户列表
  get_active_notice_user: { path: '/get_active_notice_user', cache: false },

  /**
  * page_active 
  */
  //获取接龙类型列表接口
  get_activetype_list: { path: '/get_activetype_list', cache: false },
  //修改接龙状态
  update_active_state: { path: '/update_active_state', cache: false },
  //阅读接龙
  read_active: { path: '/read_active', cache: false },
  //获取活动参与记录
  get_attend_records: { path: '/get_attend_records', cache: false },
  //不看这个接龙
  shield_active: { path: '/shield_active', cache: false },
  //添加历史地理位置
  add_history_local: { path: '/add_history_local', cache: false },
  //删除历史地理位置
  del_history_local: { path: '/del_history_local', cache: false },
  //获取历史地理位置
  get_history_local: { path: '/get_history_local', cache: false },
  //获取活动数据统计
  get_active_data_statistics: { path: '/get_active_data_statistics', cache: false },
  //获取活动数据-用户信息
  get_active_data_userinfo: { path: '/get_active_data_userinfo', cache: false },

  /**
  * page_index 
  */
  //获取首页列表
  get_index_list: { path: '/get_index_list', cache: false },
  //获取活动详情
  get_active_info: { path: '/get_active_info', cache: false },
  //获取我的接龙凭证
  get_active_certificates: { path: '/get_active_certificates', cache: false },
  //获取我的订阅
  get_subscribe: { path: '/get_subscribe', cache: false },
  //删除我的订阅
  delete_subscribe: { path: '/delete_subscribe', cache: false },
  //修改用户订阅状态
  update_subscribe_state: { path: '/update_subscribe_state', cache: false },
  //获取首页历史搜索记录
  get_index_search_history: { path: '/get_index_search_history', cache: false },
  //删除首页历史搜索记录
  del_index_search_history: { path: '/del_index_search_history', cache: false },


  /**
  * page_good 
  */
  //获取商品分类列表
  get_goodclass_list: { path: '/get_goodclass_list', cache: false },
  //添加商品分类
  add_good_class: { path: '/add_good_class', cache: false },
  //修改商品分类
  update_good_class: { path: '/update_good_class', cache: false },
  //删除商品分类
  delete_good_class: { path: '/delete_good_class', cache: false },

  //获取商品列表
  get_good_list: { path: '/get_good_list', cache: false },
  //删除商品
  delete_good: { path: '/delete_good', cache: false },

  /**
  * page_money 
  */
  //提现接口
  user_withdraw: { path: '/user_withdraw', cache: false },
  //获取支付参数
  pay_for_order: { path: '/pay_for_order', cache: false },
  //获取支付参数
  submit_order: { path: '/submit_order', cache: false },

  //获取订单详情
  get_active_record_detail: { path: '/get_active_record_detail', cache: false },
  //获取账单
  get_user_bills: { path: '/get_user_bills', cache: false },
  //提现
  get_wechatPay_to_user: { path: '/get_wechatPay_to_user', cache: false },

  get_pay_data: { path: '/get_pay_data', cache: false },
  //余额支付
  balance_for_order: { path: '/balance_for_order', cache: false },

  //退款
  refund_to_buyer: { path: '/refund_to_buyer', cache: false },
  get_wechat_order: { path: '/get_wechat_order', cache: false },
  get_user_withdraw_records: { path: '/get_user_withdraw_records', cache: false },


  /**
  * page_notice
  */
  //发送消息
  send_template: { path: '/page_notice.send_template', cache: false },


  /**
  * page_message
  */
  //获取我的消息列表
  get_message_list: { path: '/get_message_list', cache: false },
  //阅读我的消息
  read_message: { path: '/read_message', cache: false },


  /**
  * leave_msg
  */
  //获取活动留言信息列表
  get_leave_msg_list: { path: '/get_leave_msg_list', cache: false },
  //添加留言列表
  add_leave_msg: { path: '/add_leave_msg', cache: false },
  //给留言点赞
  thumbup_leavemsg: { path: '/thumbup_leavemsg', cache: false },
  //回复留言
  reply_leave_msg: { path: '/reply_leave_msg', cache: false },
  //生成短链接
  get_short_url: { path: '/get_short_url', cache: false },
  
  

  get_history_good_list:{path:'/get_history_good_list',cache: false},


}


//post请求
export const post = {
  publish_active: '/publish_active',                      //发布接龙
  update_active: '/update_active',                      //修改接龙
  add_good: '/add_good',                                //添加商品
  update_good: '/update_good',                           //修改商品
  upload_files: '/upload_files',                          //上传文件
  get_mini_scanCode:'/get_mini_scanCode'
}