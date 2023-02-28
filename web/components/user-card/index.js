// components/user-card/index.js
const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  options: {
    styleIsolation: "true",
  },
  properties: {
    userId: String,
    nickName: String,
    avatarUrl: String,
    describe: String,
    followState: String,
  },

  observers: {
    followState: function (val) {
      this.setData({
        _followState: val,
      });
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    _followState: "",
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
