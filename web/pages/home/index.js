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
    userInfo: {
      avatarUrl: "",
      nickName: "",
      describe: "",
    },
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

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 停止监听store
    unsubscribe();
  },
});
