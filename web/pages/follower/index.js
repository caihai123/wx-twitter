// pages/follower/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const userId = options?.userId;
    wx.cloud.callFunction({
      name: "handleFollow",
      data: { userId, type: "getFollowList" },
      success: ({ result }) => {
        this.setData({ list: result });
      },
    });
  },
});
