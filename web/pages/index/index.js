// pages/index/index.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    groupList: [], // 圈子列表
    showDrawer: false,
    // 动态列表
    moments: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.globalData.loginPromise.then(() => {
      this.getTribeList();
      this.getMoments();
    });
  },

  // 获取用户所在的圈子
  getTribeList() {
    const db = wx.cloud.database();
    const _ = db.command;
    db.collection("tribes")
      .where({
        _id: _.in(app.globalData.userInfo?.tribes || []),
      })
      .field({
        _id: true,
        name: true,
        description: true,
      })
      .get({
        success: (res) => {
          this.setData({
            groupList: res.data,
          });
        },
      });
  },

  // 获取动态列表
  getMoments() {
    wx.cloud.callFunction({
      name: "getMoments",
      success: (res) => {
        this.setData({ moments: res.result || [] });
      },
    });
  },

  // 去发动态
  goCreatdMoment() {
    const that = this;
    wx.navigateTo({
      url: "/pages/create-moment/index?type=1",
      success() {
        that.closeDrawer();
      },
    });
  },

  // 刷新动态列表
  refreshMoments() {},

  // 打开drawer
  openDrawer() {
    this.setData({
      showDrawer: true,
    });
  },
  // 取消drawer
  closeDrawer() {
    this.setData({
      showDrawer: false,
    });
  },
});
