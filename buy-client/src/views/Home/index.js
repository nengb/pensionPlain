let { getQueryStringArgsAes,genQueryString,getTime,dealQuery } = serverConfig;

import { Skeleton, Tab, Tabs, Field, Image, List, Loading, PullRefresh, Uploader,Cell, CellGroup ,Button   } from 'vant';
import httpGet from '../../services/httpGet';
import { wechatAut } from '../../configs/wechat'
import { mapState } from 'vuex';


export default {
  components: {
    [Field.name]: Field,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Button.name]: Button,
    

  },

  data() {

    return {
      age:25,
      retireYear:50,                  //默认退休年龄
      lifeMax:80,                     //默认寿命
      retireMonthCostMoney:4000,      //默认退休每个月花费
      monthSaveMoney:2000,            //默认每个月存钱
      inflationRate:0.06 ,            //通货膨胀率
      earnRate:0.09 ,                 //年收益率
      report:[],
      retireReport:[],
    }
  },
  
 
  async created() {
    this.saveMoney()
  },
 

  methods: {
     saveMoney(){
       console.log(`生成数据`)
       this.earnRate = Number(this.earnRate)

        this.report=[]
        this.retireReport=[]
        let a = this.retireCost(this.lifeMax-this.retireYear)
        let retireRP = `${this.retireYear} 岁退休 每个月花${this.retireMonthCostMoney}元，${this.lifeMax-this.retireYear}年后共需要${a}元`
        this.retireReport.push(retireRP)
        let allMoney=0;
        let allMoney2 = 0;
        retireRP =`每个月存 ${this.monthSaveMoney} 元 ， 一年共存 ${this.monthSaveMoney*12} 元 ` 
        this.report.push(retireRP)
        this.report.push(`总额 A：${Number(this.earnRate*100).toFixed(0)}%年收益率，总额 B: ${Number((this.earnRate-this.inflationRate)*100).toFixed(0)}%年收益率(抹平通货)`)

        for(let i=1;i<=this.retireYear-this.age;i++){

        let year = (allMoney+this.monthSaveMoney*12)*(1+this.earnRate);
        allMoney= year;

        let year2 = (allMoney2+this.monthSaveMoney*12)*(1+(this.earnRate-this.inflationRate))
        allMoney2 = year2

        let retireRP=`第${i}年 | ${Number(this.age)+i}岁 | 总额A ${allMoney.toFixed(0)} 元 | 总额B ${allMoney2.toFixed(0)} 元` 
        this.report.push(retireRP)
      }


      return allMoney
    },
    //退休花费
    retireCost(n){
      let month = this.retireMonthCostMoney;
      let allMoney=0;
      for(let i=1;i<=n;i++){
      let year = month*12;
      allMoney+= year;
      // console.log(`第${i}年 第${60+i}岁 allMoney ${allMoney}`)
      }
      return allMoney
    },
  


  }
}


