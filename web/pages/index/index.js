// pages/index/index.js
import { selectAllPosts, postInit } from "../../store/module/posts";
const app = getApp();
const { dispatch, subscribe, getState } = app.store;

let unsubscribe = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    showDrawer: false,
    posts: [], // 动态列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // 监测store变化
    unsubscribe = subscribe(() => {
      this.setData({ posts: selectAllPosts(getState()) });
    });
    this.initPosts();
  },

  // 初始化动态列表
  initPosts() {
    wx.cloud.callFunction({ name: "getMoments" }).then((res) => {
      const data = res.result.map(({ _id, ...rest }) => ({ id: _id, ...rest }));
      dispatch(postInit(data));
    });
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
