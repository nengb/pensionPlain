

// //所有api请求路径,cache：接口是否启用缓存
//get请求
export const get = {
  /**
  * movie 
  */
  //微信小程序-用户注册
  search_movie: { path: '/search_movie', cache: true },
  

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