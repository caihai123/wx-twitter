// pages/index/index.js
import { selectAllPosts, refreshPostList } from "../../store/module/posts";
const app = getApp();
const { dispatch, subscribe, getState } = app.store;

let unsubscribe = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    posts: [], // 动态列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // 监测store变化
    unsubscribe = subscribe(() => {
      const state = getState();
      this.setData({
        posts: selectAllPosts(state),
      });
    });
    // 初始化动态列表
    dispatch(refreshPostList()).unwrap();
  },

  // 去发动态
  goCreatdPost() {
    wx.navigateTo({
      url: "/pages/create-post/index",
    });
  },

  // 页面卸载时
  onUnload() {
    // 停止监听store
    unsubscribe();
  },

  // 处理用户下拉操作
  onPullDownRefresh() {
    dispatch(refreshPostList())
      .unwrap()
      .then(() => {
        wx.stopPullDownRefresh({
          complete: () => {
            wx.showToast({
              title: "刷新成功",
              icon: "none",
            });
          },
        });
      })
      .catch(() => {
        wx.stopPullDownRefresh();
      });
  },
});
