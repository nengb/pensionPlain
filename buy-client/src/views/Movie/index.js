let { getQueryStringArgsAes,genQueryString,getTime,dealQuery } = serverConfig;

import { Skeleton, Tab, Tabs, Field, Image, List, Loading, PullRefresh, Uploader,Cell, CellGroup ,Button, Search    } from 'vant';
import httpGet from '../../services/httpGet';
import { wechatAut } from '../../configs/wechat'
import { mapState } from 'vuex';


export default {
  components: {
    [Field.name]: Field,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Button.name]: Button,
    [Search.name]: Search,
    [List.name]: List,
    

  },

  data() {

    return {
      value:'',
      inputTime:0,
      movieData:[],
      urlType:{
        0:"迅雷链接",
        1:"磁力链接"
      }
  
    }
  },
  
 
  async created() {
    
  },
 

  methods: {
    onLoad(){

    },
    onSearch(e){
      console.log(e)
    },
    dealSearchName(name){
      if(typeof name != 'string'){
        return name
      }
      if(this.value.length>0){
        return name.replace(this.value,`<span style="color:red">${this.value}</span>`)
      }else{
        return name

      }
    },
    dealData(data){
      return data.map(e => {
        try {
         
          e.movie_name = this.dealSearchName(e.movie_name)
        
        } catch (err) {
        }
        return e;
      })
    },
    async onInput(e){
      e = e.replace(/[' ']+/g,'')
      if(e && e.length >0 && Date.now() - this.inputTime > 500){
        this.inputTime = Date.now()
        console.log(e)
        let result  = await httpGet.search_movie({name:e})
        console.log(result)
        if(result && result.data && result.data.length>0){
          this.movieData = this.dealData(result.data)
        }else{
          this.movieData = []
        }
      }else{
        this.movieData = []

      }

    }


  }
}


