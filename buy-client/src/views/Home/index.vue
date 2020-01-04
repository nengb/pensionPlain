<template>
  <div class="home">
    <div class="headTitle">养老基金计算器</div>
    
    <van-cell-group>
      <van-field v-model="age"  label="今年多少岁" placeholder="今年多少岁"  />
      <van-field v-model="retireYear"  label="退休年龄" placeholder="请输入退休年龄"  />
      <van-field v-model="retireMonthCostMoney"  label="退休月花销" placeholder="退休每个月的花销"  />
      <van-field v-model="lifeMax"  label="寿命" placeholder="请输入寿命"  />
      <van-field v-model="monthSaveMoney"  label="每个月存的钱" placeholder="每个月存的钱"  />
      <van-field v-model="inflationRate"  label="通货膨胀率" placeholder="通货膨胀率"  />
      <van-field v-model="earnRate"  label="年收益率" placeholder="年收益率" />
    </van-cell-group>

    <div class="btn"><van-button  type="primary" @click="saveMoney"> 生成报告</van-button></div>
    <!-- <van-cell title="单元格" is-link value="内容" /> -->
    <div class="report">
      <div class="title">退休花销</div>
      <div class="con">
        <p v-for="item in retireReport">{{item}}</p>
        
      </div>
    </div>
    <div class="report">
      <div class="title">存钱计划</div>
      <div class="con">
        <p v-for="item in report">{{item}}</p>
        
      </div>
    </div>
  </div>
</template>

    

<script src="./index.js"></script>
<style src="./index.less" lang='less' scope></style>