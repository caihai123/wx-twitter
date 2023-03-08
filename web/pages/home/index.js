// pages/home/index.js

import { selectUserId } from "../../store/module/userInfo";
import { apiSlice } from "../../store/module/apiSlice";

const app = getApp();
const { subscribe, getState, dispatch } = app.store;

const mapDispatch = {
  getUserInfoById: apiSlice.endpoints.getUserInfoById,
};

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
    const { getUserInfoById } = mapDispatch;

    // // 监测store变化
    this._watchStore = subscribe(() => {
      const state = getState();
      const userId = selectUserId(state);

      if (userId) {
        const { data: userInfo } = getUserInfoById.select(userId)(state);
        userInfo && this.setData({ userInfo });

        this._unsubscribe?.();
        const { unsubscribe } = dispatch(getUserInfoById.initiate(userId));
        this._unsubscribe = unsubscribe;
      }
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

  // 跳转到个人中心
  goUserPage() {
    const userId = selectUserId(getState());
    wx.navigateTo({
      url: `/pages/user-page/index?id=${userId}`,
    });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 停止监听store
    this._unsubscribe?.();
    this._watchStore?.();
  },
});
