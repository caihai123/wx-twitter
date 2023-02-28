// pages/fans/index.js
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
      data: { userId, type: "getFansList" },
      success: ({ result }) => {
        this.setData({ list: result });
      },
    });
  },

  // 处理关注人员改变
  handleFollowChange(event) {
    const { userId, followState } = event.detail;
    const { list } = this.data;
    const found = list.find((item) => item._id === userId);
    if (found) {
      found.followState = followState;
      this.setData({
        list,
      });
    }
  },
});
