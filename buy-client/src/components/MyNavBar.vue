
<template>
  <div class="mynavBar">
    <div class="navBarH" v-if="hasHeight"></div>
    <div :class="{navBar:true,hasBg:hasBg}" :style="{color:fontColor}">
      <i class="iconfont icon-back" @click="navBack"></i>
      <div class="title">{{title}}</div>
    </div>
  </div>
</template>
<script>
let { genQueryString, getQueryStringArgsAes, formatTime,getHrefNew } = serverConfig;

import { Tabbar, TabbarItem } from "vant";
export default {
  components: {},
  props: {
    title: {
      type: String,
      default: ""
    },
    hasHeight: {
      type: Boolean,
      default: false
    },
    bgColor: {
      type: String,
      default: "transparent"
    },
    fontColor: {
      type: String,
      default: "#fff"
    },
    hasBg: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {};
  },

  async created() {
    this.isFirstHistory() 
  },

  methods: {
    isFirstHistory() {

      let isfirst = getHrefNew('?','isfirst')
      if(isfirst){
        return true
      }else{
        return false;
      }
      //是否是第一条记录

      // var flag = false;
      // var length = window.history.length;
      // var currentURL = window.location.origin+window.location.pathname;
      // var firstURL = sessionStorage.getItem("fisrtHistoryURL");
      // console.log(`history`,length)
      // if (firstURL && this._compareURL(firstURL, currentURL)) {
      //   return true;
      // }
      // //IE,Opera从0开始，Firefox、Chrome和Safari从1开始。
      // if (this.isIE && !this.isOpera) {
      //   if (length == 1) {
      //     sessionStorage.setItem("fisrtHistoryURL", currentURL);
      //     flag = true;
      //   }
      // } else if (
      //   this.isSafari ||
      //   this.isFireFox ||
      //   this.isChrome ||
      //   this.isOpera
      // ) {
      //   if (length == 2) {
      //     sessionStorage.setItem("fisrtHistoryURL", currentURL);
      //     flag = true;
      //   }
      // }

      // return flag;
    },

    _compareURL(e, t) {
      var n =
          e.indexOf("?") > -1
            ? e.match(/(\S*)(\:\/\/)(\S*)(?=\?)/)
            : e.match(/(\S*)(\:\/\/)(\S*)/),
        i =
          t.indexOf("?") > -1
            ? t.match(/(\S*)(\:\/\/)(\S*)(?=\?)/)
            : t.match(/(\S*)(\:\/\/)(\S*)/);
      if (n && i) {
        var o = n[3],
          s = i[3];
        return (
          (o = "/" == o[o.length - 1] ? o.slice(0, -1) : o),
          (s = "/" == s[s.length - 1] ? s.slice(0, -1) : s),
          o == s ? !0 : !1
        );
      }
      return !1;
    },

    navBack() {

      //验证是否存在记录
      if (this.isFirstHistory()) {
        // if(window.__wxjs_environment === 'miniprogram'){
        //     wx.miniProgram.reLaunch({url: '/pages/index/index'})
        // }else{
        //     this.$router.replace({ name: "home" });
        // }

            this.$router.replace({ name: "home" });



      } else {
        this.$router.back();
        // this.$router.go(-1)
      }
    }
  }
};
</script>


<style lang='less' scope>
.mynavBar {
  .navBarH {
    padding-top: 46px;
  }
  .hasBg {
    background-size: cover;
  }
  .navBar {
    width: 100%;
    top: 0;
    left: 0;
    z-index: 100;
    position: fixed;
    height: 46px;
    line-height: 46px;

    .icon-back {
      position: absolute;
      left: 5px;
    }
    .title {
      text-align: center;
      font-size: 17px;
      font-weight: 500;
    }
  }
}
</style>


