// components/post-crad/index.js
import { heartSwitch } from "../../store/module/posts";
const app = getApp();
const { dispatch } = app.store;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    postData: Object,
  },

  lifetimes: {
    attached: function () {},
    detached: function () {},
  },

  /**
   * 组件的初始数据
   */
  data: {
    ownId: "",
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 跳转到个人主页
    goUserPage(event) {
      const { id } = event.currentTarget.dataset;
      wx.navigateTo({
        url: `/pages/user-page/index?id=${id}`,
      });
    },

    // 点赞
    handleHeart(event) {
      const { id } = event.currentTarget.dataset;
      dispatch(heartSwitch(id)).unwrap();
    },
  },
});
