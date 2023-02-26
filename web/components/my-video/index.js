// components/my-video/index.js

let videoContext = null;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    url: String,
    width: String,
    height: String,
    poster: String,
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      videoContext = wx.createVideoContext(this.properties.url, this);
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    // 播放视频
    playVideo() {
      videoContext.requestFullScreen();
    },

    // 全屏或退出全屏的回调
    bindfullscreenchange(event) {
      const { fullScreen } = event.detail;
      if (fullScreen) {
        videoContext.play();
      } else {
        videoContext.stop();
      }
    },
  },
});
