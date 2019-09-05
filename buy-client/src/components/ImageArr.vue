
<template>
  <div class="imageList">
    <!-- <div  class='image image{{imageList.length<=6?imageList.length:6}}' wx:if="{{imageList.length>0}}"> -->
    <div
      :class="{image:true,[`image${imageList.length<=6?imageList.length:6}`]:true}"
      v-if="imageList && imageList.length>0"
    >
      <!-- <image class="imageCon" wx:if="{{index <6 && item.type=='image'}}" data-index="{{index}}"  src="{{item.value}}" lazy-load mode="aspectFill"></image> -->
      <!-- <img v-if="index <6 && item.type=='image'" v-lazy="item.value" alt=""> -->
        
      <template v-for="(item,index) in imageList"  >
        <van-image
          class="imageCon"
          v-if="index <6 && item.type=='image'"
          lazy-load
          fit="cover"
          :src="item.value"
        >
          <template v-slot:loading>
            <van-loading type="spinner" size="20"/>
          </template>
        </van-image>

        <div class="imageCon" v-if="index <6 && item.type=='video'">
          <video  muted :src="item.value"></video>
        </div>
      </template>

      <!-- <video class="imageCon" loop autoplay v-if="index <6 && item.type=='video'" :src="item.value" 
 
      ></video>-->
    </div>
  </div>
</template>
<script>
import {
  NavBar,
  List,
  Tab,
  Tabs,
  PullRefresh,
  Toast,
  Loading,
  Image,
  Icon
} from "vant";
import serverConfig from "../configs/serverConfig";
let { genQueryString, getQueryStringArgsAes, formatTime } = serverConfig;
import wechat from "../configs/wechat";

export default {
  components: {
    [NavBar.name]: NavBar,
    [List.name]: List,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [PullRefresh.name]: PullRefresh,
    [Toast.name]: Toast,
    [Loading.name]: Loading,
    [Image.name]: Image,
    [Icon.name]: Icon
  },
  props: {
    imageList: Array
  },
  data() {
    return {
      list: []
    };
  },
  async created() {},

  methods: {}
};
</script>


<style lang='less' scope>
.imageList{

  .image {
    overflow: hidden;
    justify-content: space-between;
  }
  
  .image1 {
    // height: 454px;
  }
  .imageCon {
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    background: #f8f8f8;
    img,
    video {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      object-fit: cover;
    }
  }
  .image1 .imageCon {
    width: 100%;
    padding: 28% 0;
  }
  
  .image2 {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  
  .image2 .imageCon {
    width: calc(50% - 2.5px);
    padding: calc(22% - 1.25px) 0;
  }
  .image2 .imageCon:last-child {
    margin-right: 0px;
  }
  
  .image3 {
    display: flex;
    position: relative;
    width: 100%;
  }
  
  .image3 .imageCon:nth-child(1) {
    width: calc(67% - 2.5px);
    // flex-basis: 66%;
    // height: 454px;
    padding: 30% 0;
  }
  .image3 .imageCon:nth-child(2) {
    position: absolute;
    right: 0;
    top: 0;
    width: calc(33% - 2.5px);
    // height: 222px;
    padding: calc(15% - 1.25px) 0;
  }
  .image3 .imageCon:nth-child(3) {
    position: absolute;
    right: 0;
    bottom: 0;
    width: calc(33% - 2.5px);
    // height: 222px;
    padding: calc(15% - 1.25px) 0;
  }
  
  .image4 {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .image4 .imageCon:nth-child(2),
  .image4 .imageCon:nth-child(4) {
    margin-right: 0;
  }
  
  .image4 .imageCon:nth-child(3),
  .image4 .imageCon:nth-child(4) {
    margin-bottom: 0;
  }
  
  .image4 .imageCon {
    width: calc(50% - 2.5px);
    // height: 300px;
    padding: 20% 0;
    margin: 0 0px 5px 0;
  }
  
  .image5 {
    display: flex;
    flex-wrap: wrap;
  }
  .image5 .imageCon:nth-child(1),
  .image5 .imageCon:nth-child(2) {
    width: calc(50% - 2.5px);
    // height: 300px;
    padding: 20% 0;
  
    margin-right: 5px;
  }
  .image5 .imageCon:nth-child(2) {
    margin-right: 0px;
  }
  
  .image5 .imageCon:nth-child(3),
  .image5 .imageCon:nth-child(4),
  .image5 .imageCon:nth-child(5) {
    margin-top: 5px;
    margin-right: 5px;
    // width: 222px;
    width: calc(33% - 2.5px);
    padding: 16% 0;
  
    // height: 144px;
  }
  .image5 .imageCon:nth-child(5) {
    margin-right: 0px;
  }
  
  .image6 {
    position: relative;
  }
  
  .image6 .imageCon {
    width: calc(33% - 2.5px);
    padding: calc(15% - 1.25px) 0;
  
    // width: 222px;
    // height: 222px;
    float: left;
  }
  .image6 .imageCon:first-child {
    // width: 454px;
    // height: 454px;
    width: calc(67% - 2.5px);
    padding: 30% 0;
  }
  .image6 .imageCon:nth-child(2) {
    margin-left: 5px;
  }
  .image6 .imageCon:nth-child(3) {
    margin: 5px 0 5px 5px;
  }
  .image6 .imageCon:nth-child(4),
  .image6 .imageCon:nth-child(5) {
    margin-right: 5px;
  }
}
</style>


