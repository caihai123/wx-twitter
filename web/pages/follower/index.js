// pages/follower/index.js

import { selectUserId } from "../../store/module/userInfo";
const db = wx.cloud.database();
const { getState } = getApp().store;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userId: "",
    list: [],
    loading: true,
    isSelf: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const userId = options?.userId;
    const selfId = selectUserId(getState());
    this.setData({ isSelf: userId === selfId, userId });
    db.collection("follow")
      .where({ userId })
      .get()
      .then(({ data }) => {
        this.setData({ list: data });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },
});
