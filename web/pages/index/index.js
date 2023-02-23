// pages/index/index.js
import {
  selectAllPosts,
  postInit,
  thumbsUpSync,
} from "../../store/module/posts";
import { selectUserId } from "../../store/module/userInfo";
const app = getApp();
const { dispatch, subscribe, getState } = app.store;

let unsubscribe = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    ownId: "", // 自己的id
    posts: [], // 动态列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // 监测store变化
    unsubscribe = subscribe(() => {
      const state = getState();
      this.setData({
        ownId: selectUserId(state),
        posts: selectAllPosts(state),
      });
    });
    this.initPosts();
  },

  // 初始化动态列表
  initPosts() {
    wx.cloud.callFunction({ name: "getPosts" }).then((res) => {
      const data = res.result.map(({ _id, ...rest }) => ({ id: _id, ...rest }));
      dispatch(postInit(data));
    });
  },

  // 去发动态
  goCreatdPost() {
    wx.navigateTo({
      url: "/pages/create-post/index",
    });
  },

  // 点赞
  thumbsUp(event) {
    const { id } = event.currentTarget.dataset;
    dispatch(thumbsUpSync(id)).unwrap();
  },

  // 页面卸载时
  onUnload() {
    // 停止监听store
    unsubscribe();
  },
});
