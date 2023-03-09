// pages/user-page/index.js

const { subscribe, getState, dispatch } = getApp().store;
import { apiSlice } from "../../store/module/apiSlice";

const mapDispatch = {
  getUserInfoById: apiSlice.endpoints.getUserInfoById,
};

Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: "",
    userInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const userId = options?.id;
    this.setData({ id: userId });

    const { getUserInfoById } = mapDispatch;

    this._watchStore = subscribe(() => {
      const state = getState();
      const { data: userInfo } = getUserInfoById.select(userId)(state);
      if (userInfo) this.setData({ userInfo });
    });

    const { unsubscribe } = dispatch(getUserInfoById.initiate(userId));
    this._unsubscribe = unsubscribe;
  },

  setUserInfo(data) {
    this.setData({ userInfo: data });
    wx.setNavigationBarTitle({
      title: data.nickName + "的个人主页",
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
    const { id } = this.data;
    wx.navigateTo({
      url: `/pages/follower/index?userId=${id}`,
    });
  },
  // 去粉丝列表（关注者）
  goFans() {
    const { id } = this.data;
    wx.navigateTo({
      url: `/pages/fans/index?userId=${id}`,
    });
  },

  // 头像预览
  previewAvatar(event) {
    const { url } = event.currentTarget.dataset;
    wx.previewImage({
      urls: [url],
      current: url,
    });
  },

  tabsChange() {
    this.selectComponent("#tabs").resize();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 停止监听store
    this._watchStore?.();
    this._unsubscribe?.();
  },
});
