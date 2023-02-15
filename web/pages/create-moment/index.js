// pages/create-moment/index.js
import dayjs from "dayjs";

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
    db.collection("moment").add({
      // data 字段表示需新增的 JSON 数据
      data: {
        content: this.data.value,
        tribleId: "",// 圈子id
        createTime:dayjs().format("YYYY-MM-DD HH:mm:ss")
      },
      success: function () {
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
