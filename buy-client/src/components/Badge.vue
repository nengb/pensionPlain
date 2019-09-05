
<template>
    <div class="badge" v-if="num>0">
      {{num>99?'99+':num}}
    </div>
    <div class="badge_cycle" v-else-if="num==-1">
    </div>
</template>
<script>
  export default {
    components:{
     
    },
    props:{
        num:Number,
    },
    data () {
      return {
      }
    },
    
    async created(){
    
    },

    methods:{
        change(){
        }
    
   
    }


  }
</script>


<style lang='less' scope>
  
 .badge{
   line-height: 16px;
   height: 16px;
   padding:0 4px ;
   background: rgb(255, 68, 68);
   box-sizing: border-box;
   border-radius:16px; 
   font-size: 10px;
   color: #fff;
   position: absolute;
   text-align: center;
     top: -5px;
   right: -5px;
 }

  .badge_cycle{
   padding: 1px ;
   background: rgb(255, 68, 68);
   width: 8px;
   height: 8px;
   box-sizing: border-box;
   border-radius:50%; 
   color: #fff;
   position: absolute;
   top: -5px;
   right: -5px;
 }
</style>


