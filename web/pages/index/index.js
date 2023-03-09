// pages/index/index.js
import {
  updatePostList,
  selectPostList,
  getFurtherPostList,
  selectStatus,
} from "../../store/module/posts";

const app = getApp();
const { subscribe, getState, dispatch } = app.store;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    postIds: [], // 动态的id列表
    initLoading: true,
    loadMoreLoading: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this._unsubscribe = subscribe(() => {
      this.setData({
        postIds: selectPostList(getState()),
      });
    });
    dispatch(updatePostList())
      .unwrap()
      .finally(() => {
        this.setData({ initLoading: false });
      });
  },

  // 去发动态
  goCreatdPost() {
    wx.navigateTo({
      url: "/pages/create-post/index",
    });
  },

  // 页面上拉触底
  onReachBottom() {
    const status = selectStatus(getState());
    if ((status !== "nomore" && status !== "loading") || status === "init") {
      this.setData({ loadMoreLoading: true });
      dispatch(getFurtherPostList())
        .unwrap()
        .catch(() => {
          wx.showToast({
            title: "获取失败!",
            icon: "error",
          });
        })
        .finally(() => {
          this.setData({ loadMoreLoading: false });
        });
    }
  },

  // 处理用户下拉操作
  onPullDownRefresh() {
    dispatch(updatePostList())
      .unwrap()
      .then(() => {
        wx.stopPullDownRefresh({
          complete: () => {
            wx.showToast({
              title: "刷新成功",
              icon: "none",
            });
          },
        });
      })
      .catch(() => {
        wx.stopPullDownRefresh();
      });
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 停止监听store
    this._unsubscribe();
  },
});
