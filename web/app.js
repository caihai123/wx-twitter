// app.js
App({
  onLaunch() {
    wx.cloud.init({ traceUser: true });
    // 登录
    this.globalData.loginPromise = new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: "login",
        success: (res) => {
          const { openid } = res.result;
          // 获取用户信息 开始
          const db = wx.cloud.database();
          db.collection("user")
            .where({ _openid: openid })
            .get({
              success: (res) => {
                const userInfo = res.data[0];
                if (userInfo) {
                  this.globalData.userInfo = userInfo;
                } else {
                  this.globalData.userInfo = null;
                }
                resolve(res);
              },
              fail: (err) => {
                reject(err);
              },
            });
          // 获取用户信息 结束
        },
        fail: (err) => {
          reject(err);
        },
      });
    });
  },

  globalData: {
    userInfo: {
      _id: "",
      _openid: "",
      nickName: "",// 昵称
      gender: "",// 性别
      avatarUrl: "",// 头像地
      description: "",// 自我描述or个性签名
      tribes: [],// 所属部落
      currentGroup: "",// 当前所在组
    },
    loginPromise: null,
  },
});
