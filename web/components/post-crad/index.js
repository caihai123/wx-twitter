// components/post-crad/index.js

const { subscribe, getState, dispatch } = getApp().store;
import {
  apiSlice,
  selectPostItem,
  selectUserItem,
} from "../../store/module/apiSlice";
import { selectUserId } from "../../store/module/userInfo";

const mapDispatch = {
  getPostItemById: apiSlice.endpoints.getPostItemById,
  getUserInfoById: apiSlice.endpoints.getUserInfoById,
  handleHeartChange: apiSlice.endpoints.handleHeartChange,
};

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    postId: String, // 动态id
  },

  lifetimes: {
    attached: async function () {
      this.updateData("loading", true);

      const { postId } = this.properties;
      const { getPostItemById, getUserInfoById } = mapDispatch;

      // 开始监测store数据
      this._watchStore = subscribe(() => {
        const state = getState();
        const postData = selectPostItem(state, postId);
        if (postData) {
          this.updateData("postData", postData);
          const userInfo = selectUserItem(state, postData.userId);
          userInfo && this.updateData("userInfo", userInfo);

          this._userUnsubscribe?.();
          const { unsubscribe } = dispatch(
            getUserInfoById.initiate(postData.userId)
          );
          this._userUnsubscribe = unsubscribe;

          this.updateData("loading", false);
        }
      });

      // 订阅缓存数据
      const { unsubscribe, refetch } = dispatch(
        getPostItemById.initiate(postId)
      );
      this._unsubscribe = unsubscribe;
      this._refetch = refetch;
    },
    detached: function () {
      this._unsubscribe?.();
      this._watchStore?.();
      this._userUnsubscribe?.();
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    postData: {},
    userInfo: {},

    loading: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 跳转到个人主页
    goUserPage() {
      const { _id } = this.data.userInfo;
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const currentPageUrl = currentPage.route;
      if (
        currentPageUrl !== "pages/user-page/index" ||
        currentPage.data.id !== _id
      ) {
        wx.navigateTo({
          url: `/pages/user-page/index?id=${_id}`,
        });
      }
    },

    // 点击爱心
    async handleHeart() {
      const { handleHeartChange } = mapDispatch;
      const { _id } = this.data.postData;
      const isHeart = !this.data.postData.isHeart;
      dispatch(
        handleHeartChange.initiate({
          postId: _id,
          userId: selectUserId(getState()),
          isHeart,
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
