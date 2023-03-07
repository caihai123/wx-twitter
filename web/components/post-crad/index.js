// components/post-crad/index.js
import dayjs from "dayjs";
import "../../utils/zh-cn";
dayjs.locale("zh-cn");
const app = getApp();
const { subscribe, getState, dispatch } = app.store;
import { apiSlice } from "../../store/module/apiSlice";

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
        const { data } = getPostItemById.select(postId)(getState());

        if (data) {
          this.setData({ postData: data });
          const { data: userInfo } = getUserInfoById.select(data.userId)(getState());
          this.setData({ userInfo });

          this.userUnsubscribe?.();
          const { unsubscribe } = dispatch(
            getUserInfoById.initiate(data.userId)
          );
          this.userUnsubscribe = unsubscribe;
        }
      });

      // 订阅缓存数据
      const caihai = dispatch(getPostItemById.initiate(postId));
      console.log(caihai)
      this.unsubscribe = caihai.unsubscribe;
    },
    detached: function () {
      this.unsubscribe?.();
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
    heartNum: 0,
    isHeart: false,

    isHeartWatch: null,

    loading: false,

    selfUserId: "",
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 获取喜欢的人的数量
    async getHeartNum() {
      const { postId } = this.properties;
      const { total: heartNum } = await db
        .collection("heart")
        .where({ postId })
        .count();
      this.setData({ heartNum: heartNum });
    },

    // 是否是自己喜欢
    async canHeart(userId) {
      const { postId } = this.properties;
      if (userId) {
        // 仅仅是代码层处理一下，谁的id也不会一直变吧
        const { isHeartWatch } = this.data;
        isHeartWatch && isHeartWatch.close();

        const model = db.collection("heart").where({ postId, userId });
        // 侦听器
        this.data.isHeartWatch = model.watch({
          onChange: (snapshot) => {
            this.setData({ isHeart: snapshot.docs.length > 0 });
            this.getHeartNum();
          },
          onError: () => {},
        });
      }
    },

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

    // 点赞
    handleHeart() {
      const isHeart = !this.data.isHeart;
      this.setData({ isHeart });
      // 这里需要做防抖，只需要将最后一次的结果存储到数据库
      const { postId } = this.properties;
      const { selfUserId } = this.data;
      if (isHeart) {
        db.collection("heart").add({ data: { postId, userId: selfUserId } });
      } else {
        db.collection("heart").where({ postId, userId: selfUserId }).remove();
      }
    },

    // 处理时间为相对时间
    handleRelativeTime(time) {
      const datDate = dayjs(time);
      const today = dayjs(); // 现在
      if (today.unix() - datDate.unix() < 604800) {
        // 小于7天
        return datDate.fromNow();
      } else if (today.format("YYYY") === datDate.format("YYYY")) {
        // 如果是今年
        return datDate.format("M月D日");
      } else {
        // 不是今年
        return datDate.format("YYYY年M月D日");
      }
    },
  },
});
