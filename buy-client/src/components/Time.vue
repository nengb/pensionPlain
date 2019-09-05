
<template>
    <span class="time" >
      {{time_f}}
    </span>
</template>
<script>
  let { genQueryString, getQueryStringArgsAes,formatTime,getTime } = serverConfig;
  export default {
    components:{
     
    },
    props:{
        time:Number,
      type:String,
    },
    data () {
      return {
      }
    },
    computed: {
      time_f: function () {
        let key = 'formatTime';
        switch(this.type){
          case 'timeago':{
            key = 'getTime'
          }break;
          case 'sort':{
            key = 'formatSortTime'
          }break;
        
        }
        // console.log(this.time)
        // this.time_f = serverConfig[key](this.time)

        return serverConfig[key](this.time)
      }
    },
    
    async mounted(){
      // console.log(this)
        

    },

    methods:{
        change(){
        }
    
   
    }


  }
</script>


<style lang='less' scope>
  
 .time{
   color: #999999;
   font-size: 10px;
 }
</style>


