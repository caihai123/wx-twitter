// pages/create-moment/index.js
import { refreshPostList } from "../../store/module/posts";
import dayjs from "dayjs";
const app = getApp();
const { dispatch } = app.store;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    value: "",
    autosize: { maxHeight: 100, minHeight: 100 },
  },

  // 处理动态文本框改变
  handelValueChange(event) {
    this.setData({ value: event.detail });
  },

  // 发表
  submitForm() {
    const db = wx.cloud.database();
    db.collection("posts").add({
      data: {
        content: this.data.value,
        createTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        thumbsUp: [],
      },
      success: function () {
        dispatch(refreshPostList()).unwrap();
        wx.showToast({
          title: "发表成功",
          icon: "success",
          duration: 2000,
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 2000);
      },
    });
  },
});
