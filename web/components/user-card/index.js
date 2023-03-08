// components/user-card/index.js
import { selectUserId } from "../../store/module/userInfo";
import { apiSlice } from "../../store/module/apiSlice";
const app = getApp();
const { subscribe, getState, dispatch } = app.store;

const mapDispatch = {
  getUserInfoById: apiSlice.endpoints.getUserInfoById,
  handelFollowChange: apiSlice.endpoints.handelFollowChange,
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
      const { handelFollowChange } = mapDispatch;
      const { userId } = this.properties;
      const isFollow = !this.data.userInfo.isFollow;
      dispatch(
        handelFollowChange.initiate({
          followId: userId,
          userId: selectUserId(getState()),
          isFollow,
        })
      );
    },
  },
});
