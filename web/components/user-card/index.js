// components/user-card/index.js
import { selectUserId } from "../../store/module/userInfo";
import { apiSlice, selectUserItem } from "../../store/module/apiSlice";
const { subscribe, getState, dispatch } = getApp().store;

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

      this._watchStore = subscribe(() => {
        const userInfo = selectUserItem(getState(), userId);
        userInfo && this.updateData("userInfo", userInfo);
      });

      const { getUserInfoById } = mapDispatch;
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

    // 更新data数据,会先判断数据是否改变,没改变时不执行setData,减少无意义的渲染
    updateData(key, val) {
      if (this.data[key] !== val) {
        this.setData({ [key]: val });
      }
    },
  },
});
