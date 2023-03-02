// pages/user-page/index.js
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
    const id = options?.id;
    this.setData({ id });
    wx.cloud.callFunction({
      name: "getUserInfo",
      data: { id },
      success: (res) => {
        const data = res.result;
        this.setData({ userInfo: data });
        wx.setNavigationBarTitle({
          title: data.nickName+'的个人主页',
        });
      },
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
});
