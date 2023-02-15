// pages/create-tribe/index.js
import dayjs from "dayjs";
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    name: "",
    description: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},

  // 处理名称输入框改变
  handelNameChange(event) {
    this.setData({ name: event.detail });
  },

  // 处理圈子介绍输入框改变
  handelDescriptionChange(event) {
    this.setData({ description: event.detail });
  },

  submitForm() {
    const db = wx.cloud.database();
    const { name, description } = this.data;
    if (!name) {
      wx.showToast({
        title: "请填写名称",
        icon: "error",
      });
      return
    }
    db.collection("tribes").add({
      data: {
        name: name,
        description: description,
        createTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        members: [app.globalData.userInfo._id],
      },
      success: function () {
        wx.showToast({
          title: "创建成功",
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
