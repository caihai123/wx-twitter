// pages/follower/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    loading: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const userId = options?.userId;
    wx.cloud
      .callFunction({
        name: "handleFollow",
        data: { userId, type: "getFollowList" },
      })
      .then(({ result }) => {
        this.setData({ list: result });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },
});
