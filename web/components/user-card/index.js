// components/user-card/index.js
import { apiSlice } from "../../store/module/apiSlice";
const app = getApp();
const { subscribe, getState, dispatch } = app.store;

const mapDispatch = {
  getUserInfoById: apiSlice.endpoints.getUserInfoById,
};

Component({
  /**
   * 组件的属性列表
   */
  options: {
    styleIsolation: "true",
  },
  properties: {
    userId: String,
  },
  data: {
    userInfo: {},
  },

  lifetimes: {
    attached() {
      const { userId } = this.properties;
      const { getUserInfoById } = mapDispatch;

      this._watchStore = subscribe(() => {
        const state = getState();
        const { data: userInfo } = getUserInfoById.select(userId)(state);
        userInfo && this.setData({ userInfo });
      });

      const { unsubscribe } = dispatch(getUserInfoById.initiate(userId));
      this._unsubscribe = unsubscribe;
    },
    detached() {
      this._watchStore?.();
      this._unsubscribe?.();
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 切换对某个人的关注状态
    followSwitch() {
      const { userId } = this.properties;
      const { _followState } = this.data;

      switch (_followState) {
        case "1":
          this.setData({ _followState: "4" });
          break;
        case "2":
          this.setData({ _followState: "3" });
          break;
        case "3":
          this.setData({ _followState: "2" });
          break;
        case "4":
          this.setData({ _followState: "1" });
          break;
        default:
          break;
      }

      wx.cloud.callFunction({
        name: "handleFollow",
        data: { userId, type: "followSwitch" },
        success: ({ result }) => {
          this.triggerEvent("followChange", {
            userId,
            followState: result.followState,
          });
          app.login();
        },
      });
    },
  },
});
