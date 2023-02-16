// pages/create-tribe/index.js
import dayjs from "dayjs";
const app = getApp();
const db = wx.cloud.database();
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
    const that = this;
    const { name, description } = this.data;
    if (!name) {
      wx.showToast({
        title: "请填写名称",
        icon: "error",
      });
      return;
    }
    const { userInfo, tribeList } = app.store.getState();
    const formData = {
      name: name,
      description: description,
      createTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      members: [userInfo._id],
    };
    db.collection("tribes").add({
      data: formData,
      success: function (res) {
        const { _id } = res;
        app.store.dispatch({
          type: "setTribeList",
          payload: [{ _id, ...formData }, ...tribeList],
        });
        if (tribeList.length) {
          // 询问用户是否切换
          wx.showModal({
            title: "提示",
            content: "圈子创建成功，是否立即切换？",
            complete: (res) => {
              if (res.cancel) {
                that.updateCurrentTribe(_id).then(() => {
                  wx.navigateBack();
                });
              } else if (res.confirm) {
                wx.navigateBack();
              }
            },
          });
        } else {
          // 如果是第一个圈子则自动帮他切换
          that.updateCurrentTribe(_id);
          wx.showToast({
            title: "创建成功",
            icon: "success",
            duration: 2000,
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      },
    });
  },

  // 更新用户当前的群
  updateCurrentTribe(currentTribeId) {
    const { userInfo } = app.store.getState();
    return db
      .collection("user")
      .doc(userInfo._id)
      .update({
        data: { currentTribe: currentTribeId },
      })
      .then(() => {
        this.store.dispatch({
          type: "setUserInfo",
          payload: { ...userInfo, currentTribe: currentTribeId },
        });
      });
  },
});
