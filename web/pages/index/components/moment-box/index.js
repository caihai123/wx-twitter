// pages/index/components/moment-box/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tribeId: String,
  },

  /**
   * 组件的初始数据
   */
  data: {
    momentList: [],

    triggered: false, // 控制下拉刷新状态
  },

  // lifetimes: {
  //   attached: function () {
  //     this.init();
  //   },
  // },

  observers: {
    tribeId: function () {
      this.init();
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 初始化组件
    init() {
      const { tribeId } = this.properties;
      if (tribeId) {
        this.refreshMomentList();
      } else {
        this.setData({ momentList: [] });
      }
    },

    // 用于刷新或首此获取动态
    refreshMomentList() {
      const { tribeId } = this.properties;
      return wx.cloud
        .callFunction({
          name: "getMoments",
          data: { tribeId },
        })
        .then((res) => {
          this.setData({ momentList: res.result || [], triggered: false });
        });
    },

    // 处理用户下拉
    handleRefresher() {
      this.refreshMomentList().then(() => {
        wx.showToast({
          title: "刷新成功！",
          icon: "none",
        });
      });
    },
  },
});
