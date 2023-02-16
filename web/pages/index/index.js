// pages/index/index.js
const app = getApp();
let unsubscribe = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentTribe: "", // 当前圈子
    tribeList: [], // 圈子列表
    showDrawer: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initPage();
    // 监测store变化
    unsubscribe = app.store.subscribe(() => {
      this.initPage();
    });
  },

  // 初始化页面
  initPage() {
    const { userInfo, tribeList } = app.store.getState();
    this.setData({ tribeList, currentTribe: userInfo.currentTribe });
  },

  // 去发动态
  goCreatdMoment() {
    const that = this;
    wx.navigateTo({
      url: "/pages/create-moment/index?type=1",
      success() {
        that.closeDrawer();
      },
    });
  },

  // 去创建圈子
  goCreateTribe() {
    wx.navigateTo({
      url: "/pages/create-tribe/index",
    });
  },

  // 打开drawer
  openDrawer() {
    this.setData({
      showDrawer: true,
    });
  },

  // 取消drawer
  closeDrawer() {
    this.setData({
      showDrawer: false,
    });
  },
  
  // 页面卸载时
  onUnload() {
    // 停止监听store
    unsubscribe();
  },
});
