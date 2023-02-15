// pages/index/index.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    groupList: [], // 圈子列表
    showDrawer: false,
    dynamicList: [
      {
        id: "1",
        user: {
          name: "蔡海",
          portrait:
            "https://portrait.gitee.com/uploads/avatars/user/2911/8735677_caihai123_1614740186.png!avatar200",
          describe: "30万人关注他",
        },
        content: {
          type: "text",
          text:
            "这是一段纯文本动态这是一段纯文本动态这是一段纯文本动态这是一段纯文本动态这是一段纯文本动态这是一段纯文本动态",
        },
        statistics: {
          star: 100,
          comments: 100,
          watching: 100,
        },
      },
      {
        id: "2",
        user: {
          name: "王麻子",
          portrait: "https://caihai123.com/Dribbble/lists/screen-shot.jpg",
          describe: "30万人关注他",
        },
        content: {
          type: "img",
          url: [
            "https://caihai123.com/Dribbble/lists/preview_teaser.png",
            "https://caihai123.com/Dribbble/lists/car_teaser.gif",
            "https://caihai123.com/Dribbble/lists/preview_teaser.png",
            "https://caihai123.com/Dribbble/lists/car_teaser.gif",
          ],
          text: "这是带图片的动态，最多可放9张图片。",
        },
        statistics: {
          star: 100,
          comments: 100,
          watching: 100,
        },
      },
      {
        id: "3",
        user: {
          name: "张三",
          portrait:
            "https://img.alicdn.com/imgextra/i4/O1CN01aG16y424E11XsURUd_!!6000000007358-2-tps-206-240.png",
          describe: "30万人关注他",
        },
        content: {
          type: "video",
          url: "https://www.youtube.com/watch?v=4s2cJVqd6cw",
          text: "这是带视频的动态，只能有一个视频。",
        },
        statistics: {
          star: 100,
          comments: 100,
          watching: 100,
        },
      },
      {
        id: "4",
        user: {
          name: "李四",
          portrait:
            "https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png",
          describe: "30万人关注他",
        },
        content: {
          type: "vote",
          text: "这是一个投票，你认为真理掌握在？（单选）",
          options: [
            {
              key: "1",
              label: "多数人手中",
              value: 90,
            },
            {
              key: "2",
              label: "少数人手中",
              value: 10,
            },
          ],
        },
        statistics: {
          star: 100,
          comments: 100,
          watching: 100,
        },
      },
      {
        id: "5",
        user: {
          name: "小张",
          portrait: "https://avatars.githubusercontent.com/u/47770861?s=40&v=4",
          describe: "30万人关注他",
        },
        content: {
          type: "fan-tan",
          text: "这是一个接龙",
          list: [
            {
              index: 1,
              user: {
                id: "",
                name: "",
                portrait: "",
              },
              text: "1",
            },
          ],
        },
        statistics: {
          star: 100,
          comments: 100,
          watching: 100,
        },
      },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.globalData.loginPromise.then(() => {
      this.getGroup();
    });
  },

  // 获取用户所在的圈子
  getGroup() {
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
          console.log(res)
          this.setData({
            groupList: res.data,
          });
        },
      });
  },

  // 获取动态列表
  getMoments(page) {},

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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
