// pages/fans/index.js
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
      .where({ followId: userId })
      .get()
      .then(({ data }) => {
        this.setData({ list: data });
      })
      .finally(() => {
        this.setData({ loading: false });
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
