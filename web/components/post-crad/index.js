// components/post-crad/index.js

const { subscribe, getState, dispatch } = getApp().store;
import { apiSlice } from "../../store/module/apiSlice";
import { selectUserId } from "../../store/module/userInfo";
// import { createSelector } from "../../utils/redux-toolkit";

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
      this.setData({ loading: true });

      const { postId } = this.properties;
      const { getPostItemById, getUserInfoById } = mapDispatch;

      // 开始监测store数据
      this.watchStore = subscribe(() => {
        const state = getState();
        const { data } = getPostItemById.select(postId)(state);
        this.setData({ selfUserId: selectUserId(state) });
        if (data) {
          this.setData({ postData: data });
          const { data: userInfo } = getUserInfoById.select(data.userId)(state);
          userInfo && this.setData({ userInfo });

          this._userUnsubscribe?.();
          const { unsubscribe } = dispatch(
            getUserInfoById.initiate(data.userId)
          );
          this._userUnsubscribe = unsubscribe;

          this.setData({ loading: false });
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
      this.watchStore?.();
      this.userUnsubscribe?.();
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    postData: {},
    userInfo: {},

    isHeartWatch: null,

    loading: false,

    selfUserId: "", // 自己的userId
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
          userId: this.data.selfUserId,
          isHeart
        })
      );
    },
  },
});
