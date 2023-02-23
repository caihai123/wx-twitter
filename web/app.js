// app.js
import store from "./store/index";
import { updateUserInfo } from "./store/module/userInfo";

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
        store.dispatch(updateUserInfo(res.result));
      },
    });
  },
});
