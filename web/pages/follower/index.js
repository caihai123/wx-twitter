// pages/follower/index.js

const db = wx.cloud.database();

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
