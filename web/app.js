// app.js
const Redux = require("./assets/redux.min");
const initialState = {
  userInfo: {
    _id: "",
    _openid: "",
    nickName: "", // 昵称
    gender: "", // 性别
    avatarUrl: "", // 头像地
    describe: "", // 自我描述or个性签名
    currentTribe: "", // 当前所在圈子
  },
  tribeList: [],
};
const store = Redux.createStore((state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case "setUserInfo":
      return {
        ...state,
        userInfo: payload,
      };
    case "setTribeList":
      return {
        ...state,
        tribeList: payload,
      };
    default:
      return state;
  }
});

App({
  store: store,
  onLaunch() {
    wx.cloud.init({ traceUser: true });
    this.login();
  },

  // 登录，实际是获取用户信息
  login() {
    wx.cloud.callFunction({
      name: "login",
      success: (res) => {
        const { tribeList = [], ...userInfo } = res.result;
        this.store.dispatch({ type: "setUserInfo", payload: userInfo });
        this.store.dispatch({ type: "setTribeList", payload: tribeList });
      },
    });
  },
});
