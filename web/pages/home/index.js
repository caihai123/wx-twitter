// pages/home/index.js

import { selectUserInfo } from "../../store/module/userInfo";
const app = getApp();
const { subscribe, getState } = app.store;

let unsubscribe = null;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // 监测store变化
    unsubscribe = subscribe(() => {
      this.initPage();
    });
    this.initPage();
  },

  // 初始化页面
  initPage() {
    const state = getState();
    const userInfo = selectUserInfo(state);
    this.setData({
      userInfo: userInfo,
    });
  },

  // 去编辑个人资料
  goEditUserInfo() {
    wx.navigateTo({
      url: "/pages/edit-user-info/index",
    });
  },

  // 去正在关注页面
  goFollower() {
    const { _id } = this.data.userInfo;
    wx.navigateTo({
      url: `/pages/follower/index?userId=${_id}`,
    });
  },
  // 去粉丝列表（关注者）
  goFans() {
    const { _id } = this.data.userInfo;
    wx.navigateTo({
      url: `/pages/fans/index?userId=${_id}`,
    });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 停止监听store
    unsubscribe();
  },
});
