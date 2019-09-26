<template>
  <div class="movie">
    <div class="headTitle">电影搜索</div>
    
    <van-search placeholder="请输入搜索关键词" v-model="value"  @search="onSearch" @input="onInput"/>
   

    <div
      class="list"
      v-for="(item,index) in movieData"
      :key="index"
    >
    <div>
      <div>{{urlType[item.url_type]}}:</div>
      <a :href="item.movie_url" ><div v-html="item.movie_name"></div></a>
    </div>
    
    </div>


  </div>
</template>

    

<script src="./index.js"></script>
<style src="./index.less" lang='less' scope></style>