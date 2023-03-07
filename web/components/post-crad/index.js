// components/post-crad/index.js

const app = getApp();
const { subscribe, getState, dispatch } = app.store;
import { apiSlice } from "../../store/module/apiSlice";
import { selectUserId } from "../../store/module/userInfo";

const db = wx.cloud.database();

const mapDispatch = {
  getPostItemById: apiSlice.endpoints.getPostItemById,
  getUserInfoById: apiSlice.endpoints.getUserInfoById,
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
      // this.setData({ loading: true });

      // this.setData({ loading: false });

      const { postId } = this.properties;
      const { getPostItemById, getUserInfoById } = mapDispatch;

      // 开始监测store数据
      this.watchStore = subscribe(() => {
        const state = getState();
        const { data } = getPostItemById.select(postId)(state);
        this.setData({ selfUserId: selectUserId(state) });
        if (data) {
          this.setData({ postData: data });
          const { data: userInfo } = getUserInfoById.select(data.userId)(
            getState()
          );
          this.setData({ userInfo });

          this.userUnsubscribe?.();
          const { unsubscribe } = dispatch(
            getUserInfoById.initiate(data.userId)
          );
          this.userUnsubscribe = unsubscribe;
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
      const isHeart = !this.data.postData.isHeart;
      this.setData({ "postData.isHeart": isHeart });
      // 这里需要做防抖，只需要将最后一次的结果存储到数据库
      const { postId } = this.properties;
      const { selfUserId } = this.data;
      if (isHeart) {
        await db
          .collection("heart")
          .add({ data: { postId, userId: selfUserId } });
      } else {
        await db
          .collection("heart")
          .where({ postId, userId: selfUserId })
          .remove();
      }
      this._refetch(); // 点赞之后刷新动态
    },
  },
});
