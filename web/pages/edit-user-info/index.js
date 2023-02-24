// pages/edit-user-info/index.js
import { selectUserInfo, updateUserInfo } from "../../store/module/userInfo";
const app = getApp();
const { dispatch, getState } = app.store;
import { uploadToCloud } from "./../../utils/util";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    _id: "",
    wallImg: {
      url: "",
      new: false, // 是否是临时地址
    },
    avatar: {
      url: "",
      new: false, // 是否是临时地址
    },
    nickName: "",
    describe: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const userInfo = selectUserInfo(getState());
    this.setData({
      _id: userInfo._id,
      nickName: userInfo.nickName,
      "avatar.url": userInfo.avatarUrl,
      "wallImg.url": userInfo.wallUrl,
      describe: userInfo.describe,
    });
  },

  onNickNameChange(event) {
    this.setData({ nickName: event.detail });
  },
  onDescribeChange(event) {
    this.setData({ describe: event.detail });
  },

  onAvatarUrlChange(event) {
    const { file } = event.detail;
    this.setData({
      avatar: {
        url: file.url,
        new: true,
      },
    });
  },

  onWallUrlChange(event) {
    const { file } = event.detail;
    this.setData({
      wallImg: {
        url: file.url,
        new: true,
      },
    });
  },

  submitForm() {
    if (!this.formValidate()) {
      return;
    }
    const { _id, wallImg, avatar, nickName, describe } = this.data;

    const uploadTasks = [wallImg, avatar].map((item) => {
      if (item.new) {
        return uploadToCloud(item.url);
      } else {
        return new Promise((resolve) => resolve({ fileID: item.url }));
      }
    });

    Promise.all(uploadTasks).then(
      ([{ fileID: wallImgUrl }, { fileID: avatarUrl }]) => {
        const db = wx.cloud.database();
        const params = {
          nickName,
          describe,
          avatarUrl: avatarUrl,
          wallUrl: wallImgUrl,
        };
        db.collection("user")
          .doc(_id)
          .update({ data: params })
          .then(() => {
            wx.showToast({
              title: "更新成功",
              icon: "success",
              duration: 2000,
            });
            const userInfo = selectUserInfo(getState());
            dispatch(
              updateUserInfo({
                ...userInfo,
                ...params,
              })
            );
            setTimeout(() => {
              wx.navigateBack();
            }, 2000);
          });
      }
    );
  },

  // 字段验证
  formValidate() {
    const { avatar, nickName } = this.data;
    if (!avatar.url) {
      wx.showToast({
        title: "请上传头像",
        icon: "none",
      });
      return false;
    }
    if (!nickName) {
      wx.showToast({
        title: "请填写昵称",
        icon: "none",
      });
      return false;
    }
    return true;
  },
});
