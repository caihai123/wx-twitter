// pages/index/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    postIds: [], // 动态的id列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.getPostIds();
  },

  getPostIds() {
    return wx.cloud
      .callFunction({
        name: "getPostLast",
      })
      .then((res) => {
        this.setData({ postIds: res.result });
      });
  },

  // 去发动态
  goCreatdPost() {
    wx.navigateTo({
      url: "/pages/create-post/index",
    });
  },

  // 处理用户下拉操作
  onPullDownRefresh() {
    this.getPostIds()
      .then(() => {
        wx.stopPullDownRefresh({
          complete: () => {
            wx.showToast({
              title: "刷新成功",
              icon: "none",
            });
          },
        });
      })
      .catch(() => {
        wx.stopPullDownRefresh();
      });
  },
});
